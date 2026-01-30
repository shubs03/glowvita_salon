import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import StaffModel from '@repo/lib/models/staffModel';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorServicesModel from '@repo/lib/models/Vendor/VendorServices.model';
import { calculateVendorTravelTime } from '@repo/lib/modules/scheduling/EnhancedTravelUtils';

await _db();

/**
 * Unified Multi-Service Slot Discovery API
 * 
 * This endpoint handles complex multi-service bookings by calculating sequential
 * time slots on the backend, ensuring accuracy and consistency across web and mobile.
 * 
 * Supports:
 * - Same staff handling multiple services
 * - Different staff handling different services
 * - Home service with travel time calculation
 * - Salon services
 * 
 * POST /api/booking/slots/multi
 */

// Helper: Convert time string to minutes
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper: Convert minutes to time string
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Helper: Parse duration string to minutes
function parseDuration(duration, defaultValue = 60) {
  if (duration === undefined || duration === null || duration === '') return 0;
  if (typeof duration === 'number') return duration;
  if (typeof duration === 'string') {
    const match = duration.match(/(\d+)\s*(min|hour|hours)/i);
    if (!match) {
      const num = parseInt(duration);
      return isNaN(num) ? defaultValue : num;
    }
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 'min') return value;
    if (unit === 'hour' || unit === 'hours') return value * 60;
  }
  return defaultValue;
}

// Helper: Check if staff is available on a specific day
function isStaffAvailableOnDay(staff, date) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayAvailableField = `${dayOfWeek}Available`;
  return staff[dayAvailableField] === true;
}

// Helper: Get staff working hours for a specific day
function getStaffWorkingHours(staff, date) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySlotsField = `${dayOfWeek}Slots`;
  return staff[daySlotsField] || [];
}

// Helper: Check if a time slot is blocked for staff
function isTimeSlotBlocked(staff, date, startMinutes, endMinutes) {
  if (!staff.blockedTimes || staff.blockedTimes.length === 0) return false;
  
  const dateString = date.toISOString().split('T')[0];
  
  return staff.blockedTimes.some(blocked => {
    const blockedDateString = new Date(blocked.date).toISOString().split('T')[0];
    if (blockedDateString !== dateString) return false;
    
    const blockStart = blocked.startMinutes || timeToMinutes(blocked.startTime);
    const blockEnd = blocked.endMinutes || timeToMinutes(blocked.endTime);
    
    // Check overlap
    return (startMinutes < blockEnd && endMinutes > blockStart);
  });
}

// Helper: Check if a time slot conflicts with existing appointments for a specific staff
function hasAppointmentConflict(appointments, staffId, date, startMinutes, endMinutes) {
  const dateString = date.toISOString().split('T')[0];
  
  return appointments.some(appointment => {
    // Check if appointment is for this staff member (either primary or secondary service)
    const isPrimaryStaff = (appointment.staff && typeof appointment.staff === 'object' 
      ? appointment.staff._id?.toString() || appointment.staff.id?.toString()
      : appointment.staff?.toString()) === staffId?.toString();
    
    const isSecondaryStaff = appointment.serviceItems?.some(item => {
      const itemStaffId = (item.staff && typeof item.staff === 'object'
        ? item.staff._id?.toString() || item.staff.id?.toString()
        : item.staff?.toString());
      return itemStaffId === staffId?.toString();
    });

    if (!isPrimaryStaff && !isSecondaryStaff) return false;
    
    // Check if appointment is on the same date
    const appointmentDateString = new Date(appointment.date).toISOString().split('T')[0];
    if (appointmentDateString !== dateString) return false;
    
    // Check if appointment status is active
    const status = (appointment.status || '').toLowerCase();
    if (!['confirmed', 'pending', 'scheduled', 'temp-locked'].includes(status)) return false;
    
    // Check for time overlap including travel time for external services
    const aptStart = timeToMinutes(appointment.startTime);
    const aptEnd = timeToMinutes(appointment.endTime);
    
    // If it was a home service, it blocks time before and after for travel
    // Calculate the full blocked window for the existing appointment
    // Robustness: Fallback to 30 mins if it's a home service but travelTime is missing
    const aptTravelTime = appointment.travelTime || (appointment.isHomeService ? 30 : 0);
    const aptBufferBefore = Number(appointment.bufferBefore) || 0;
    const aptBufferAfter = Number(appointment.bufferAfter) || 0;
    
    const aptBlockedStart = aptStart - aptTravelTime - aptBufferBefore;
    const aptBlockedEnd = aptEnd + aptTravelTime + aptBufferAfter;
    
    return (startMinutes < aptBlockedEnd && endMinutes > aptBlockedStart);
  });
}

/**
 * Helper: Comprehensive availability check for a staff member
 */
function checkStaffAvailability(staff, date, fullBlockedStart, fullBlockedEnd, existingAppointments) {
  if (!staff || staff.isAny) return false;
  
  // 1. Check staff exists and is available on this day
  if (!isStaffAvailableOnDay(staff, date)) return false;
  
  // 2. Check working hours - The professional must be working from the start of travel until return from travel
  const workingHours = getStaffWorkingHours(staff, date);
  let windowCovered = false;
  
  for (const period of workingHours) {
    const periodStart = timeToMinutes(period.startTime);
    const periodEnd = timeToMinutes(period.endTime);
    
    if (fullBlockedStart >= periodStart && fullBlockedEnd <= periodEnd) {
      windowCovered = true;
      break;
    }
  }
  
  if (!windowCovered) return false;
  
  // 3. Check blocked times against the full professional window
  if (isTimeSlotBlocked(staff, date, fullBlockedStart, fullBlockedEnd)) return false;
  
  // 4. Check appointment conflicts against the full professional window
  if (hasAppointmentConflict(existingAppointments, staff._id || staff.id, date, fullBlockedStart, fullBlockedEnd)) return false;
  
  return true;
}

// Main validation: Check if a complete sequence is valid
async function validateSequence(assignments, startMinutes, date, existingAppointments, allActiveStaff, isHomeService, travelTimeInfo, bufferBefore = 0, bufferAfter = 0) {
  const travelTimeMinutes = (isHomeService && travelTimeInfo) ? travelTimeInfo.timeInMinutes : 0;
  
  // Calculate total duration for the entire sequence including all addons
  let totalServiceDuration = 0;
  assignments.forEach(a => {
    const base = parseDuration(a.service.duration);
    const addons = (a.addOnDetails || []).reduce((sum, ad) => sum + parseDuration(ad.duration, 0), 0);
    totalServiceDuration += (base + addons);
  });

  // Calculate the FULL professional blocked period [Start - TravelTo - BufferBefore, Start + Duration + TravelBack + BufferAfter]
  const fullBlockedStart = startMinutes - travelTimeMinutes - bufferBefore;
  const fullBlockedEnd = startMinutes + totalServiceDuration + travelTimeMinutes + bufferAfter;

  // Find a suitable professional for 'any' assignments
  let anyProfessionalCandidate = null;
  const hasAnyAssignment = assignments.some(a => a.staff.isAny);
  
  if (hasAnyAssignment) {
    // Try each active staff to see if they can handle the FULL sequence
    for (const candidate of allActiveStaff) {
      if (checkStaffAvailability(candidate, date, fullBlockedStart, fullBlockedEnd, existingAppointments)) {
        anyProfessionalCandidate = candidate;
        break;
      }
    }
    
    // If no one can handle 'any', this slot is invalid
    if (!anyProfessionalCandidate) {
      return { valid: false, reason: 'No professional available for "Any Professional" selection' };
    }
  }

  // Double check availability for specific staff assignments
  for (const a of assignments) {
    if (!a.staff.isAny) {
      if (!checkStaffAvailability(a.staff, date, fullBlockedStart, fullBlockedEnd, existingAppointments)) {
        return { valid: false, reason: `${a.staff.fullName} is not available for the full duration` };
      }
    }
  }

  const sequence = [];
  let currentMinutes = startMinutes;
  
  for (const assignment of assignments) {
    const { service, staff: originalStaff, staffId: originalStaffId, addOnDetails = [] } = assignment;
    const staff = originalStaff.isAny ? anyProfessionalCandidate : originalStaff;
    const staffId = staff._id || staff.id || originalStaffId;
    
    // Calculate total duration for this service including its addons
    const baseDuration = parseDuration(service.duration);
    const addonsDuration = addOnDetails.reduce((sum, addon) => sum + parseDuration(addon.duration, 0), 0);
    const serviceDuration = baseDuration + addonsDuration;
    
    const serviceEndMinutes = currentMinutes + serviceDuration;
    
    // Add to sequence
    sequence.push({
      serviceId: service._id.toString(),
      serviceName: service.name,
      staffId: staffId.toString(),
      staffName: staff.fullName,
      startTime: minutesToTime(currentMinutes),
      endTime: minutesToTime(serviceEndMinutes),
      duration: serviceDuration,
      baseDuration,
      addonsDuration,
      addOns: addOnDetails.map(a => ({
        id: a._id.toString(),
        name: a.name,
        duration: a.duration,
        price: a.price
      }))
    });
    
    // Move to next service start time
    currentMinutes = serviceEndMinutes;
  }
  
  return { valid: true, sequence, totalEndMinutes: currentMinutes };
}

// Generate candidate slots
function generateCandidateSlots(workingHours, stepMinutes = 15) {
  const slots = [];
  
  for (const period of workingHours) {
    const periodStart = timeToMinutes(period.startTime);
    const periodEnd = timeToMinutes(period.endTime);
    
    let currentTime = periodStart;
    while (currentTime < periodEnd) {
      slots.push(currentTime);
      currentTime += stepMinutes;
    }
  }
  
  return slots;
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('[MultiSlots] Received Request Body:', JSON.stringify(body, null, 2));
    
    const {
      vendorId,
      date: dateStr,
      assignments = [], // [{ serviceId, staffId }]
      isHomeService = false,
      location = null,
      stepMinutes = 15,
      bufferBefore = 0,
      bufferAfter = 0
    } = body;
    
    // Validation
    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: 'Vendor ID is required', slots: [] },
        { status: 400 }
      );
    }
    
    if (!dateStr) {
      return NextResponse.json(
        { success: false, message: 'Date is required', slots: [] },
        { status: 400 }
      );
    }
    
    if (!assignments || assignments.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Service assignments are required', slots: [] },
        { status: 400 }
      );
    }
    
    const date = new Date(dateStr);
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return NextResponse.json(
        { success: false, message: 'Cannot book appointments in the past', slots: [] },
        { status: 400 }
      );
    }
    
    console.log('Multi-service slot request:', {
      vendorId,
      date: dateStr,
      assignmentsCount: assignments.length,
      isHomeService,
      hasLocation: !!location
    });
    
    // Fetch vendor services to get service details
    const vendorServices = await VendorServicesModel.findOne({ vendor: vendorId });
    if (!vendorServices) {
      return NextResponse.json(
        { success: false, message: 'Vendor services not found', slots: [] },
        { status: 404 }
      );
    }
    
    // Prepare enriched assignments with full service and staff data
    const enrichedAssignments = [];
    const staffCache = new Map();
    const allAddOnIds = new Set();

    // Fetch all active staff for the vendor to handle "any" professional selection and caching
    const allActiveStaff = await StaffModel.find({ vendorId, status: 'Active' }).lean();
    allActiveStaff.forEach(s => staffCache.set(s._id.toString(), s));
    
    // Extract top-level addon IDs if they exist
    const topLevelAddOnIds = [
      ...(Array.isArray(body.addOnIds) ? body.addOnIds : []),
      ...(Array.isArray(body.selectedAddOns) ? body.selectedAddOns : [])
    ];
    topLevelAddOnIds.forEach(id => {
      if (id) allAddOnIds.add(id.toString());
    });
    
    // First pass: collect all service and staff data, and track required addons
    for (const assignment of assignments) {
      // Check both addOnIds and selectedAddOns inside assignment
      const assigAddOns = [
        ...(Array.isArray(assignment.addOnIds) ? assignment.addOnIds : []),
        ...(Array.isArray(assignment.selectedAddOns) ? assignment.selectedAddOns : [])
      ];
      assigAddOns.forEach(id => {
        if (id) allAddOnIds.add(id.toString());
      });
    }

    console.log('[MultiSlots] Extracted all unique Addon IDs:', Array.from(allAddOnIds));

    // Fetch addon details if any exist
    const addonDetailsMap = new Map();
    if (allAddOnIds.size > 0) {
      try {
        const AddOnModel = (await import("@repo/lib/models/Vendor/AddOn.model")).default;
        const addOnDocs = await AddOnModel.find({ _id: { $in: Array.from(allAddOnIds) } }).lean();
        console.log(`[MultiSlots] Fetched ${addOnDocs.length} addon documents from DB`);
        addOnDocs.forEach(doc => {
          console.log(`  - Addon: ${doc.name}, Duration: ${doc.duration}, ID: ${doc._id}`);
          addonDetailsMap.set(doc._id.toString(), doc);
        });
      } catch (err) {
        console.error("[MultiSlots] Error fetching addons:", err);
      }
    }
    
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];
      const { serviceId, staffId, addOnIds = [] } = assignment;
      
      // Find service
      const service = vendorServices.services.id(serviceId);
      if (!service) {
        return NextResponse.json(
          { success: false, message: `Service ${serviceId} not found`, slots: [] },
          { status: 404 }
        );
      }
      
      // Find or fetch staff
      let staff;
      if (staffId === 'any') {
        staff = { _id: 'any', fullName: 'Any Professional', isAny: true };
      } else if (staffCache.has(staffId)) {
        staff = staffCache.get(staffId);
      } else {
        // Robustness: try for valid ObjectId
        if (staffId && /^[0-9a-fA-F]{24}$/.test(staffId)) {
          staff = await StaffModel.findOne({ _id: staffId, vendorId, status: 'Active' }).lean();
        }
        
        if (!staff) {
          return NextResponse.json(
            { success: false, message: `Staff ${staffId} not found or inactive`, slots: [] },
            { status: 404 }
          );
        }
        staffCache.set(staffId, staff);
      }

      // Map addon IDs to full details
      // Merge assignment-specific addons with top-level ones (if this is the first service)
      const assignmentAddOnIds = [
        ...(Array.isArray(assignment.addOnIds) ? assignment.addOnIds : []),
        ...(Array.isArray(assignment.selectedAddOns) ? assignment.selectedAddOns : [])
      ];

      const combinedAddOnIds = [...new Set([
        ...assignmentAddOnIds.map(id => id.toString()),
        ...(i === 0 ? topLevelAddOnIds.map(id => id.toString()) : [])
      ])];

      const addOnDetails = combinedAddOnIds
        .map(id => addonDetailsMap.get(id))
        .filter(Boolean);
      
      console.log(`[MultiSlots] Assignment ${i} (${service.name}):`, {
        staff: staff.fullName,
        addonCount: addOnDetails.length,
        addons: addOnDetails.map(a => a.name)
      });

      enrichedAssignments.push({
        service,
        staff,
        staffId,
        addOnIds: combinedAddOnIds,
        addOnDetails
      });
    }
    
    // Calculate travel time for home services
    let travelTimeInfo = null;
    if (isHomeService && location && location.lat && location.lng) {
      try {
        travelTimeInfo = await calculateVendorTravelTime(vendorId, location);
        console.log('Travel time calculated:', travelTimeInfo);
      } catch (error) {
        console.warn('Could not calculate travel time, using fallback:', error.message);
        travelTimeInfo = {
          timeInMinutes: 30,
          distanceInKm: 10,
          source: 'fallback'
        };
      }
    }
    
    // Calculate total duration including addons
    const totalServiceDuration = enrichedAssignments.reduce((sum, assignment) => {
      const baseDur = parseDuration(assignment.service.duration);
      const addOnsDur = assignment.addOnDetails.reduce((aSum, addon) => aSum + parseDuration(addon.duration, 0), 0);
      return sum + baseDur + addOnsDur;
    }, 0);
    
    const travelTimeAddition = isHomeService && travelTimeInfo ? (travelTimeInfo.timeInMinutes * 2) : 0;
    const totalDuration = totalServiceDuration + travelTimeAddition + Number(bufferBefore) + Number(bufferAfter);
    
    console.log('[MultiSlots] Final Duration Breakdown:', {
      serviceDuration: totalServiceDuration,
      travelTime: travelTimeAddition,
      buffers: Number(bufferBefore) + Number(bufferAfter),
      total: totalDuration
    });

    console.log('[MultiSlots] Enriched Assignments with Durations:');
    enrichedAssignments.forEach((a, i) => {
      const base = parseDuration(a.service.duration);
      const addons = a.addOnDetails.reduce((sum, ad) => sum + parseDuration(ad.duration, 0), 0);
      console.log(`  - Assignment ${i}: ${a.service.name} Base=${base}, Addons=${addons}, Total=${base+addons}`);
    });
    
    // Fetch existing appointments for all assigned staff
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const staffIds = Array.from(staffCache.keys());
    const existingAppointments = await AppointmentModel.find({
      vendorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'pending', 'scheduled', 'temp-locked'] }
    }).lean();
    
    console.log(`Found ${existingAppointments.length} existing appointments for the day`);
    
    // Determine the earliest and latest working hours across all staff involved
    let earliestStart = 24 * 60; // 11:59 PM in minutes
    let latestEnd = 0;
    
    // If any assignment is 'any', consider all active staff for the range
    const staffForRange = enrichedAssignments.some(a => a.staff.isAny) 
      ? allActiveStaff 
      : enrichedAssignments.map(a => a.staff);

    for (const staff of staffForRange) {
      const workingHours = getStaffWorkingHours(staff, date);
      
      for (const period of workingHours) {
        const periodStart = timeToMinutes(period.startTime);
        const periodEnd = timeToMinutes(period.endTime);
        
        if (periodStart < earliestStart) earliestStart = periodStart;
        if (periodEnd > latestEnd) latestEnd = periodEnd;
      }
    }
    
    console.log('Working hours range:', {
      earliest: minutesToTime(earliestStart),
      latest: minutesToTime(latestEnd)
    });
    
    // Generate candidate start times
    const candidateStartTimes = [];
    let currentTime = earliestStart;
    
    // If it's today, start from current time
    const now = new Date();
    // IST is UTC + 5:30
    const istOffset = 5.5 * 60; // 330 minutes
    const nowUTC = now.getTime() + (now.getTimezoneOffset() * 60000);
    const nowIST = new Date(nowUTC + (istOffset * 60000));
    const isToday = date.toDateString() === nowIST.toDateString();
    
    if (isToday) {
      const currentMinutesIST = nowIST.getHours() * 60 + nowIST.getMinutes();
      if (currentMinutesIST > earliestStart) {
        currentTime = Math.ceil(currentMinutesIST / stepMinutes) * stepMinutes;
      }
    }
    
    while (currentTime + totalDuration <= latestEnd) {
      candidateStartTimes.push(currentTime);
      currentTime += stepMinutes;
    }
    
    console.log(`Generated ${candidateStartTimes.length} candidate start times`);
    
    // Validate each candidate slot
    const validSlots = [];
    
    for (const activityStartMinutes of candidateStartTimes) {
      // The SERVICE starts after travel to customer and buffer
      const travelToMinutes = isHomeService && travelTimeInfo ? travelTimeInfo.timeInMinutes : 0;
      const serviceStartMinutes = activityStartMinutes + travelToMinutes + Number(bufferBefore);
      
      const validation = await validateSequence(
        enrichedAssignments,
        serviceStartMinutes,
        date,
        existingAppointments,
        allActiveStaff,
        isHomeService,
        travelTimeInfo,
        bufferBefore,
        bufferAfter
      );
      
      if (validation.valid) {
        validSlots.push({
          startTime: minutesToTime(serviceStartMinutes),
          endTime: minutesToTime(validation.totalEndMinutes),
          totalDuration,
          serviceDuration: totalServiceDuration,
          travelTime: travelTimeInfo ? travelTimeInfo.timeInMinutes * 2 : 0,
          sequence: validation.sequence,
          isHomeService,
          ...(travelTimeInfo && {
            travelInfo: {
              timeInMinutes: travelTimeInfo.timeInMinutes,
              distanceInKm: travelTimeInfo.distanceInKm,
              source: travelTimeInfo.source
            }
          })
        });
      }
    }
    
    console.log(`Found ${validSlots.length} valid time slots`);
    
    // Sort slots by start time
    validSlots.sort((a, b) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });
    
    return NextResponse.json({
      success: true,
      slots: validSlots,
      count: validSlots.length,
      metadata: {
        date: dateStr,
        vendorId,
        servicesCount: assignments.length,
        totalDuration,
        isHomeService,
        ...(travelTimeInfo && { travelTime: travelTimeInfo.timeInMinutes })
      }
    });
    
  } catch (error) {
    console.error('Error in multi-service slot discovery:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate multi-service slots',
        error: error.message,
        slots: []
      },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
