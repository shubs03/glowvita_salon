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
function parseDuration(duration) {
  if (typeof duration === 'number') return duration;
  if (typeof duration === 'string') {
    const match = duration.match(/(\d+)\s*(min|hour|hours)/);
    if (!match) return 60;
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === 'min') return value;
    if (unit === 'hour' || unit === 'hours') return value * 60;
  }
  return 60;
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
    // Check if appointment is for this staff member
    const appointmentStaffId = typeof appointment.staff === 'object' 
      ? appointment.staff._id?.toString() || appointment.staff.id?.toString()
      : appointment.staff?.toString();
    
    if (appointmentStaffId !== staffId.toString()) return false;
    
    // Check if appointment is on the same date
    const appointmentDateString = new Date(appointment.date).toISOString().split('T')[0];
    if (appointmentDateString !== dateString) return false;
    
    // Check if appointment status is active
    const status = (appointment.status || '').toLowerCase();
    if (!['confirmed', 'pending', 'scheduled'].includes(status)) return false;
    
    // Check for time overlap
    const aptStart = timeToMinutes(appointment.startTime);
    const aptEnd = timeToMinutes(appointment.endTime);
    
    return (startMinutes < aptEnd && endMinutes > aptStart);
  });
}

// Main validation: Check if a complete sequence is valid
async function validateSequence(assignments, startMinutes, date, existingAppointments, staffCache, isHomeService, travelTimeInfo) {
  let currentMinutes = startMinutes;
  const sequence = [];
  
  // Add travel time before first service for home services
  if (isHomeService && travelTimeInfo) {
    currentMinutes += travelTimeInfo.timeInMinutes;
  }
  
  for (const assignment of assignments) {
    const { service, staff, staffId } = assignment;
    const serviceDuration = parseDuration(service.duration);
    const serviceEndMinutes = currentMinutes + serviceDuration;
    
    // Check staff availability
    if (!isStaffAvailableOnDay(staff, date)) {
      return { valid: false, reason: `${staff.fullName} is not available on this day` };
    }
    
    // Check working hours
    const workingHours = getStaffWorkingHours(staff, date);
    let inWorkingHours = false;
    
    for (const period of workingHours) {
      const periodStart = timeToMinutes(period.startTime);
      const periodEnd = timeToMinutes(period.endTime);
      
      if (currentMinutes >= periodStart && serviceEndMinutes <= periodEnd) {
        inWorkingHours = true;
        break;
      }
    }
    
    if (!inWorkingHours) {
      return { valid: false, reason: `${staff.fullName} is not working at ${minutesToTime(currentMinutes)}` };
    }
    
    // Check blocked times
    if (isTimeSlotBlocked(staff, date, currentMinutes, serviceEndMinutes)) {
      return { valid: false, reason: `${staff.fullName} has blocked time at ${minutesToTime(currentMinutes)}` };
    }
    
    // Check appointment conflicts
    if (hasAppointmentConflict(existingAppointments, staffId, date, currentMinutes, serviceEndMinutes)) {
      return { valid: false, reason: `${staff.fullName} has an existing appointment at ${minutesToTime(currentMinutes)}` };
    }
    
    // Add to sequence
    sequence.push({
      serviceId: service._id.toString(),
      serviceName: service.name,
      staffId: staffId.toString(),
      staffName: staff.fullName,
      startTime: minutesToTime(currentMinutes),
      endTime: minutesToTime(serviceEndMinutes),
      duration: serviceDuration
    });
    
    // Move to next service start time
    currentMinutes = serviceEndMinutes;
  }
  
  // Add travel time after last service for home services
  if (isHomeService && travelTimeInfo) {
    currentMinutes += travelTimeInfo.timeInMinutes;
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
    
    for (const assignment of assignments) {
      const { serviceId, staffId } = assignment;
      
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
      if (staffCache.has(staffId)) {
        staff = staffCache.get(staffId);
      } else {
        staff = await StaffModel.findOne({ _id: staffId, vendorId, status: 'Active' });
        if (!staff) {
          return NextResponse.json(
            { success: false, message: `Staff ${staffId} not found or inactive`, slots: [] },
            { status: 404 }
          );
        }
        staffCache.set(staffId, staff);
      }
      
      enrichedAssignments.push({
        service,
        staff,
        staffId
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
    
    // Calculate total duration
    const totalServiceDuration = enrichedAssignments.reduce((sum, assignment) => {
      return sum + parseDuration(assignment.service.duration);
    }, 0);
    
    const travelTimeAddition = isHomeService && travelTimeInfo ? (travelTimeInfo.timeInMinutes * 2) : 0;
    const totalDuration = totalServiceDuration + travelTimeAddition + bufferBefore + bufferAfter;
    
    console.log('Duration breakdown:', {
      serviceDuration: totalServiceDuration,
      travelTime: travelTimeAddition,
      buffers: bufferBefore + bufferAfter,
      total: totalDuration
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
      status: { $in: ['confirmed', 'pending', 'scheduled'] }
    }).lean();
    
    console.log(`Found ${existingAppointments.length} existing appointments for the day`);
    
    // Determine the earliest and latest working hours across all staff
    let earliestStart = 24 * 60; // 11:59 PM in minutes
    let latestEnd = 0;
    
    for (const assignment of enrichedAssignments) {
      const workingHours = getStaffWorkingHours(assignment.staff, date);
      
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
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (currentMinutes > earliestStart) {
        currentTime = Math.ceil(currentMinutes / stepMinutes) * stepMinutes;
      }
    }
    
    while (currentTime + totalDuration <= latestEnd) {
      candidateStartTimes.push(currentTime);
      currentTime += stepMinutes;
    }
    
    console.log(`Generated ${candidateStartTimes.length} candidate start times`);
    
    // Validate each candidate slot
    const validSlots = [];
    
    for (const startMinutes of candidateStartTimes) {
      const validation = await validateSequence(
        enrichedAssignments,
        startMinutes,
        date,
        existingAppointments,
        staffCache,
        isHomeService,
        travelTimeInfo
      );
      
      if (validation.valid) {
        const actualStartMinutes = isHomeService && travelTimeInfo 
          ? startMinutes 
          : startMinutes;
        
        validSlots.push({
          startTime: minutesToTime(actualStartMinutes),
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
