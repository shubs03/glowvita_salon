import AppointmentModel from '../../models/Appointment/Appointment.model.js';
import StaffModel from '../../models/Vendor/Staff.model.js';
import { calculateVendorTravelTime } from './EnhancedTravelUtils.js';

/**
 * Fresha-like Slot Engine
 * Generates available time slots with comprehensive validation like Fresha
 */

/**
 * Convert time string to minutes for faster comparisons
 * Handles both 24-hour format (HH:MM) and 12-hour format (HH:MMAM/PM)
 * @param {string} timeStr - Time in HH:MM or HH:MMAM/PM format
 * @returns {number} - Minutes from midnight
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  
  // Remove any spaces
  timeStr = timeStr.trim();
  
  // Check if it's 12-hour format with AM/PM
  const isPM = timeStr.toUpperCase().includes('PM');
  const isAM = timeStr.toUpperCase().includes('AM');
  
  if (isPM || isAM) {
    // Remove AM/PM and parse
    const cleanTime = timeStr.replace(/AM|PM|am|pm/gi, '').trim();
    const [hours, minutes] = cleanTime.split(':').map(Number);
    
    let totalHours = hours;
    
    // Convert to 24-hour format
    if (isPM && hours !== 12) {
      totalHours = hours + 12;
    } else if (isAM && hours === 12) {
      totalHours = 0; // Midnight
    }
    
    return totalHours * 60 + minutes;
  }
  
  // Standard 24-hour format
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes back to time string
 * @param {number} minutes - Minutes from midnight
 * @returns {string} - Time in HH:MM format
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Helper: Parse duration string or number to minutes
 * @param {string|number} duration - Duration to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} - Duration in minutes
 */
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

/**
 * Generate available time slots for a service with Fresha-like validation
 * @param {Object} params - Slot generation parameters
 * @returns {Promise<Array>} - Array of available time slots
 */
export async function generateFreshaLikeSlots({
  vendorId,
  staffId,
  date,
  services = [], // Array of service objects with duration, prepTime, setupCleanupTime
  customerLocation = null,
  isHomeService = false,
  bufferBefore = 0,
  bufferAfter = 0,
  stepMinutes = 15, // Configurable step for slot generation
  maxAdvanceBookingDays = 365 // Maximum days in advance that can be booked
}) {
  try {
    // Validate inputs
    if (!vendorId || !staffId || !date || !services.length) {
      throw new Error('Missing required parameters: vendorId, staffId, date, or services');
    }

    // Check if date is within allowed booking window
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    
    const daysDifference = Math.floor((bookingDate - today) / (1000 * 60 * 60 * 24));
    if (daysDifference < 0) {
      throw new Error('Cannot book appointments in the past');
    }
    if (daysDifference > maxAdvanceBookingDays) {
      throw new Error(`Cannot book more than ${maxAdvanceBookingDays} days in advance`);
    }

    // Get staff availability
    const staff = await StaffModel.findOne({
      vendorId: vendorId,
      _id: staffId
    });

    if (!staff) {
      throw new Error('Staff not found');
    }

    // Get day of week and working hours
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvailableField = `${dayOfWeek}Available`;
    const daySlotsField = `${dayOfWeek}Slots`;

    // Check if staff is available on this day
    if (!staff[dayAvailableField]) {
      return [];
    }

    // Get working hours for the day
    const workingHours = staff[daySlotsField];
    if (!workingHours || workingHours.length === 0) {
      return [];
    }

    // Calculate total service time including all services
    const totalServiceTime = services.reduce((total, service) => {
      const dur = parseDuration(service.duration);
      const prep = parseDuration(service.prepTime, 0);
      const clean = parseDuration(service.setupCleanupTime, 0);
      return total + dur + prep + clean;
    }, 0);

    console.log(`[SlotEngine] totalServiceTime calculated: ${totalServiceTime} mins for ${services.length} records`);
    services.forEach((s, idx) => console.log(`  - Service ${idx + 1}: ${s.name} (${s.duration} mins)`));

    // Calculate travel time if needed
    let travelTimeInfo = null;
    if (isHomeService && customerLocation) {
      try {
        travelTimeInfo = await calculateVendorTravelTime(vendorId, customerLocation);
      } catch (error) {
        console.warn('Could not calculate travel time, using fallback:', error.message);
        // Use a conservative estimate
        travelTimeInfo = {
          timeInMinutes: 30, // Conservative 30-minute estimate
          distanceInKm: 10,
          source: 'fallback'
        };
      }
    }

    // Generate candidate slots
    const candidateSlots = [];

    // For each working period, generate slots
    for (const period of workingHours) {
      const periodStart = timeToMinutes(period.startTime);
      const periodEnd = timeToMinutes(period.endTime);

      // Check if the selected date is today to filter out past slots
      const now = new Date();
      // IST is UTC + 5:30
      const istOffset = 5.5 * 60; // 330 minutes
      const nowUTC = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nowIST = new Date(nowUTC + (istOffset * 60000));
      
      const isToday = bookingDate.toDateString() === nowIST.toDateString();
      const currentMinutesIST = isToday ? (nowIST.getHours() * 60 + nowIST.getMinutes()) : 0;

      // Adjust start time to account for travel time and buffer
      let slotStart = periodStart;
      
      // If today, ensure we don't show past slots
      if (isToday && slotStart < currentMinutesIST) {
        // Round up to next 15-minute interval
        slotStart = Math.ceil(currentMinutesIST / stepMinutes) * stepMinutes;
      }
      
      if (isHomeService && travelTimeInfo) {
        // For home services, we need to account for travel time to the customer
        // We block time before the appointment for travel to the customer
        slotStart += travelTimeInfo.timeInMinutes + bufferBefore;
      } else {
        slotStart += bufferBefore;
      }

      // Calculate the end time constraint considering travel time for home services
      let slotEndConstraint = periodEnd;
      if (isHomeService && travelTimeInfo) {
        // For home services, we need to account for travel time back from the customer
        // We block time after the appointment for travel back to base
        slotEndConstraint -= travelTimeInfo.timeInMinutes + bufferAfter;
      } else {
        slotEndConstraint -= bufferAfter;
      }

      // Generate slots at specified intervals
      while (slotStart + totalServiceTime <= slotEndConstraint) {
        const startTime = minutesToTime(slotStart);
        const endTime = minutesToTime(slotStart + totalServiceTime);

        candidateSlots.push({
          startTime,
          endTime,
          duration: totalServiceTime,
          travelTime: travelTimeInfo ? travelTimeInfo.timeInMinutes : 0,
          distance: travelTimeInfo ? travelTimeInfo.distanceInKm : 0,
          bufferBefore,
          bufferAfter,
          services: services.map(service => ({
            id: service._id || service.id,
            name: service.name,
            duration: service.duration,
            prepTime: service.prepTime || 0,
            setupCleanupTime: service.setupCleanupTime || 0
          }))
        });

        // Move to next slot
        slotStart += stepMinutes;
      }
    }

    // Filter slots based on comprehensive validation
    const availableSlots = await validateAndFilterSlots({
      vendorId,
      staffId,
      date,
      candidateSlots,
      travelTimeInfo,
      isHomeService,
      bufferBefore,
      bufferAfter,
      staff
    });

    // Score slots based on various criteria
    const scoredSlots = scoreSlots(availableSlots, travelTimeInfo, staff);

    return scoredSlots;
  } catch (error) {
    console.error('Error generating Fresha-like slots:', error);
    throw error;
  }
}

/**
 * Validate and filter slots based on comprehensive criteria
 * @param {Object} params - Validation parameters
 * @returns {Promise<Array>} - Validated available slots
 */
async function validateAndFilterSlots({
  vendorId,
  staffId,
  date,
  candidateSlots,
  travelTimeInfo,
  isHomeService,
  bufferBefore,
  bufferAfter,
  staff
}) {
  try {
    // Get existing appointments for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await AppointmentModel.find({
      vendorId: vendorId,
      $or: [
        { staff: staffId },
        { 'serviceItems.staff': staffId }
      ],
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['scheduled', 'confirmed', 'checked-in', 'temp-locked'] }
    });

    // Filter candidate slots
    const availableSlots = candidateSlots.filter(slot => {
      const slotStartMinutes = timeToMinutes(slot.startTime);
      const slotEndMinutes = timeToMinutes(slot.endTime);

      // Check if slot falls within staff working hours
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySlotsField = `${dayOfWeek}Slots`;
      const workingHours = staff[daySlotsField];

      // Calculate the full blocked window for the CURRENT candidate slot
      const currentTravelTime = travelTimeInfo ? travelTimeInfo.timeInMinutes : 0;
      const slotBlockedStart = slotStartMinutes - currentTravelTime - bufferBefore;
      const slotBlockedEnd = slotEndMinutes + (isHomeService ? currentTravelTime : 0) + bufferAfter;

      // Check if the FULL activity fits within staff's working hours
      let isInWorkingHours = false;
      for (const period of workingHours) {
        const periodStart = timeToMinutes(period.startTime);
        const periodEnd = timeToMinutes(period.endTime);
        if (slotBlockedStart >= periodStart && slotBlockedEnd <= periodEnd) {
          isInWorkingHours = true;
          break;
        }
      }

      if (!isInWorkingHours) {
        return false; // Slot activity window is outside working hours
      }

      // Check for conflicts with existing appointments using the pre-calculated slotBlockedStart/End
      for (const appointment of existingAppointments) {
        const aptStartMinutes = timeToMinutes(appointment.startTime);
        const aptEndMinutes = timeToMinutes(appointment.endTime);
        
        // Calculate the full blocked window for the existing appointment
        // including its own travel time and buffers if recorded
        // Robustness fallback: use 30 mins if it's a home service but travel is not recorded
        const aptTravelTime = appointment.travelTime || (appointment.isHomeService ? 30 : 0);
        const aptBufferBefore = appointment.bufferBefore || 0;
        const aptBufferAfter = appointment.bufferAfter || 0;
        
        const aptBlockedStart = aptStartMinutes - aptTravelTime - aptBufferBefore;
        const aptBlockedEnd = aptEndMinutes + aptTravelTime + aptBufferAfter;

        // Check for overlap between blocked windows
        if (slotBlockedStart < aptBlockedEnd && slotBlockedEnd > aptBlockedStart) {
          return false; // Slot or its travel/buffer time conflicts with existing appointment or its travel/buffer
        }
      }

      // Check for conflicts with staff blocked times/breaks
      if (staff.blockedTimes && staff.blockedTimes.length > 0) {
        const dateString = date.toISOString().split('T')[0];

        for (const blocked of staff.blockedTimes) {
          const blockedDateString = blocked.date instanceof Date ? 
            blocked.date.toISOString().split('T')[0] : 
            new Date(blocked.date).toISOString().split('T')[0];
          
          // Check if blocked time is for the same date
          if (blockedDateString === dateString) {
            const blockStart = timeToMinutes(blocked.startTime);
            const blockEnd = timeToMinutes(blocked.endTime);

            // Check for overlap with the pre-calculated slot blocked window
            if (slotBlockedStart < blockEnd && slotBlockedEnd > blockStart) {
              return false; // Slot or its travel/buffer conflicts with blocked time
            }
          }
        }
      }

      return true; // Slot passed all validations
    });

    return availableSlots;
  } catch (error) {
    console.error('Error validating slots:', error);
    throw error;
  }
}

/**
 * Score slots based on various criteria
 * @param {Array} slots - Available slots to score
 * @param {Object} travelTimeInfo - Travel time information
 * @param {Object} staff - Staff information
 * @returns {Array} - Scored slots sorted by score
 */
function scoreSlots(slots, travelTimeInfo, staff) {
  return slots.map(slot => {
    let score = 0;

    // Prefer slots with shorter travel times
    if (travelTimeInfo) {
      // Higher score for shorter travel times (inverse relationship)
      score += Math.max(0, 100 - travelTimeInfo.timeInMinutes);
    }

    // Prefer slots during preferred working hours (10 AM to 4 PM)
    const slotStartHour = parseInt(slot.startTime.split(':')[0]);
    if (slotStartHour >= 10 && slotStartHour <= 16) {
      score += 20; // Bonus for mid-day slots
    }

    // Prefer slots with higher rated staff
    if (staff.rating) {
      score += staff.rating * 5;
    }

    // Prefer slots with more experience staff
    if (staff.yearOfExperience) {
      score += staff.yearOfExperience;
    }

    // Prefer earlier slots (customers often prefer morning appointments)
    if (slotStartHour < 12) {
      score += 10;
    }

    return {
      ...slot,
      score
    };
  }).sort((a, b) => b.score - a.score); // Sort by score descending
}

/**
 * Generate slots for "Any Staff" option
 * @param {Object} params - Slot generation parameters
 * @returns {Promise<Array>} - Array of available time slots for any qualified staff
 */
export async function generateAnyStaffSlots({
  vendorId,
  serviceId,
  date,
  services = [], // Array of service objects
  customerLocation = null,
  isHomeService = false,
  bufferBefore = 0,
  bufferAfter = 0,
  stepMinutes = 15
}) {
  try {
    // Get all active staff for this vendor who can perform this service
    const staffMembers = await StaffModel.find({
      vendorId: vendorId,
      status: 'Active'
    });

    if (!staffMembers.length) {
      return [];
    }

    // Generate slots for each staff member
    const allStaffSlots = [];

    for (const staff of staffMembers) {
      try {
        const staffSlots = await generateFreshaLikeSlots({
          vendorId,
          staffId: staff._id,
          date,
          services,
          customerLocation,
          isHomeService,
          bufferBefore,
          bufferAfter,
          stepMinutes
        });

        // Add staff information to each slot
        const slotsWithStaffInfo = staffSlots.map(slot => ({
          ...slot,
          staff: {
            id: staff._id,
            name: staff.fullName,
            rating: staff.rating,
            yearOfExperience: staff.yearOfExperience
          }
        }));

        allStaffSlots.push(...slotsWithStaffInfo);
      } catch (error) {
        console.warn(`Failed to generate slots for staff ${staff.fullName}:`, error.message);
        // Continue with other staff members
      }
    }

    // Group slots by time and find slots where at least one staff is available
    const timeSlotMap = new Map();

    for (const slot of allStaffSlots) {
      const timeKey = `${slot.startTime}-${slot.endTime}`;
      
      if (!timeSlotMap.has(timeKey)) {
        timeSlotMap.set(timeKey, {
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          travelTime: slot.travelTime,
          distance: slot.distance,
          bufferBefore: slot.bufferBefore,
          bufferAfter: slot.bufferAfter,
          services: slot.services,
          availableStaff: []
        });
      }

      // Add staff to this time slot
      const timeSlot = timeSlotMap.get(timeKey);
      timeSlot.availableStaff.push(slot.staff);
    }

    // Convert map to array and sort by time
    const availableSlots = Array.from(timeSlotMap.values()).sort((a, b) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    // Score the slots
    return availableSlots.map(slot => {
      // Calculate average staff rating for this slot
      const avgRating = slot.availableStaff.reduce((sum, staff) => sum + (staff.rating || 0), 0) / slot.availableStaff.length;
      
      return {
        ...slot,
        score: Math.round(avgRating * 10) // Simple scoring based on average rating
      };
    });
  } catch (error) {
    console.error('Error generating "Any Staff" slots:', error);
    throw error;
  }
}

/**
 * Generate slots for wedding packages with team formation and Fresha-like validation
 * @param {Object} params - Wedding package slot generation parameters
 * @returns {Promise<Array>} - Array of available team slots
 */
export async function generateWeddingPackageSlots({
  packageId,
  vendorId,
  services,
  date,
  customerLocation = null,
  stepMinutes = 15, // 15-minute intervals for better availability
  acceptanceWindowHours = 24, // Time window for staff acceptance
  bufferBefore = 0,
  bufferAfter = 0
}) {
  try {
    // Get the wedding package details
    const WeddingPackageModel = (await import('../../models/Vendor/WeddingPackage.model.js')).default;
    const weddingPackage = await WeddingPackageModel.findById(packageId);

    if (!weddingPackage) {
      throw new Error('Wedding package not found');
    }

    // Get vendor information
    const VendorModel = (await import('../../models/Vendor/Vendor.model.js')).default;
    const vendor = await VendorModel.findById(vendorId);

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Get assigned staff for this wedding package, or all active staff if none assigned
    let staffMembers;
    if (weddingPackage.assignedStaff && weddingPackage.assignedStaff.length > 0) {
      console.log('Wedding package has assigned staff:', weddingPackage.assignedStaff);
      
      // Use only the assigned staff members
      staffMembers = await StaffModel.find({
        _id: { $in: weddingPackage.assignedStaff },
        vendorId: vendorId,
        status: 'Active'
      });
      
      console.log(`Found ${staffMembers.length} assigned staff members:`, staffMembers.map(s => ({ id: s._id, name: s.fullName })));
      
      // If no staff found, it might be an ID format mismatch - try treating as strings
      if (staffMembers.length === 0) {
        console.log('No staff found with _id, trying string comparison...');
        const allStaff = await StaffModel.find({
          vendorId: vendorId,
          status: 'Active'
        });
        
        // Filter staff manually by comparing ID strings
        const assignedStaffStrings = weddingPackage.assignedStaff.map(id => id.toString());
        staffMembers = allStaff.filter(staff => 
          assignedStaffStrings.includes(staff._id.toString())
        );
        
        console.log(`After manual filtering: Found ${staffMembers.length} staff members`);
      }
    } else {
      // Fallback to active staff if no specific staff assigned
      // We use the staffCount requirement to determine how many professionals to check
      const requiredStaffCount = weddingPackage.staffCount || 1;
      const allActiveStaff = await StaffModel.find({
        vendorId: vendorId,
        status: 'Active'
      }).limit(requiredStaffCount);
      staffMembers = allActiveStaff;
      console.log(`No assigned staff, using ${staffMembers.length} active staff members as placeholder for availability (Required: ${requiredStaffCount})`);
    }

    if (!staffMembers.length) {
      console.error('No available staff members for wedding package');
      console.error('Package assigned staff:', weddingPackage.assignedStaff);
      console.error('Vendor ID:', vendorId);
      return [];
    }

    // Log detailed staff information for debugging
    console.log('=== STAFF DETAILS FOR WEDDING PACKAGE ===');
    staffMembers.forEach(staff => {
      console.log(`Staff: ${staff.fullName}`);
      console.log(`  - Status: ${staff.status}`);
      console.log(`  - Monday: Available=${staff.mondayAvailable}, Slots=${staff.mondaySlots?.length || 0}`);
      console.log(`  - Tuesday: Available=${staff.tuesdayAvailable}, Slots=${staff.tuesdaySlots?.length || 0}`);
      console.log(`  - Wednesday: Available=${staff.wednesdayAvailable}, Slots=${staff.wednesdaySlots?.length || 0}`);
      console.log(`  - Thursday: Available=${staff.thursdayAvailable}, Slots=${staff.thursdaySlots?.length || 0}`);
      console.log(`  - Friday: Available=${staff.fridayAvailable}, Slots=${staff.fridaySlots?.length || 0}`);
      console.log(`  - Saturday: Available=${staff.saturdayAvailable}, Slots=${staff.saturdaySlots?.length || 0}`);
      console.log(`  - Sunday: Available=${staff.sundayAvailable}, Slots=${staff.sundaySlots?.length || 0}`);
      if (staff.mondaySlots && staff.mondaySlots.length > 0) {
        console.log(`  - Monday slots detail:`, staff.mondaySlots);
      }
    });
    console.log('=========================================');

    // Get vendor working hours
    const VendorWorkingHoursModel = (await import('../../models/Vendor/VendorWorkingHours.model.js')).default;
    const vendorWorkingHours = await VendorWorkingHoursModel.findOne({ vendor: vendorId });

    if (!vendorWorkingHours) {
      console.error('Vendor working hours not found for vendor:', vendorId);
      throw new Error('Vendor working hours not found');
    }

    // Get day of week (convert to lowercase for matching with working hours keys)
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const dayHours = vendorWorkingHours.workingHours[dayOfWeek];

    console.log(`Checking working hours for ${dayOfWeek}:`, dayHours);

    if (!dayHours || !dayHours.isOpen || !dayHours.hours.length) {
      console.warn(`Vendor is closed on ${dayOfWeek}`);
      return []; // Vendor is closed on this day
    }

    // Use the first time slot for the day
    const workingHours = dayHours.hours[0];

    // Calculate total duration - use package duration directly as it's already calculated
    let totalDuration = weddingPackage.duration || 0;
    
    console.log(`Wedding package "${weddingPackage.name}" duration: ${totalDuration} minutes`);
    
    if (totalDuration === 0) {
      console.error('Wedding package has no duration set');
      throw new Error('Wedding package duration is not configured');
    }

    // Calculate travel time if customer location is provided
    let travelTime = 0;
    if (customerLocation) {
      try {
        const travelInfo = await calculateVendorTravelTime(vendorId, customerLocation);
        travelTime = travelInfo.timeInMinutes;
      } catch (error) {
        console.warn('Could not calculate travel time, using fallback:', error.message);
        travelTime = 30; // Fallback estimate
      }
    }

    // Generate available slots
    const availableSlots = [];
    let currentTime = timeToMinutes(workingHours.openTime);
    const closeMinutes = timeToMinutes(workingHours.closeTime);

    // Check if the selected date is today
    const now = new Date();
    // IST is UTC + 5:30
    const istOffset = 5.5 * 60; // 330 minutes
    const nowUTC = now.getTime() + (now.getTimezoneOffset() * 60000);
    const nowIST = new Date(nowUTC + (istOffset * 60000));
    
    const isToday = date.toDateString() === nowIST.toDateString();
    const currentMinutesIST = isToday ? (nowIST.getHours() * 60 + nowIST.getMinutes()) : 0;
    
    // If it's today, start from current time or opening time, whichever is later
    if (isToday && currentMinutesIST > currentTime) {
      // Round up to next 15-minute interval
      currentTime = Math.ceil(currentMinutesIST / 15) * 15;
      console.log(`Today's date detected (IST). Starting slots from ${minutesToTime(currentTime)} (current time: ${minutesToTime(currentMinutesIST)})`);
    }

    // Account for travel time to and from the customer for home services
    const totalSlotActivityTime = customerLocation ? 
      totalDuration + (2 * travelTime) + bufferBefore + bufferAfter : 
      totalDuration + bufferBefore + bufferAfter;

    while (currentTime + totalSlotActivityTime <= closeMinutes) {
      // The SERVICE starts after travel and buffer
      const serviceStartMinutes = currentTime + (customerLocation ? travelTime : 0) + bufferBefore;
      const slotStart = minutesToTime(serviceStartMinutes);
      const slotEnd = minutesToTime(serviceStartMinutes + totalDuration);

      // Create blocking windows for travel time
      const blockingWindows = [];
      if (travelTime > 0 && customerLocation) {
        // Add travel time before appointment (to customer location)
        blockingWindows.push({
          startTime: minutesToTime(serviceStartMinutes - travelTime - bufferBefore),
          endTime: minutesToTime(serviceStartMinutes - bufferBefore),
          reason: 'Travel to customer location'
        });

        // Add buffer before
        if (bufferBefore > 0) {
          blockingWindows.push({
            startTime: minutesToTime(serviceStartMinutes - bufferBefore),
            endTime: slotStart,
            reason: 'Buffer before service'
          });
        }

        // Add buffer after
        if (bufferAfter > 0) {
          blockingWindows.push({
            startTime: slotEnd,
            endTime: minutesToTime(serviceStartMinutes + totalDuration + bufferAfter),
            reason: 'Buffer after service'
          });
        }

        // Add travel time after appointment (back to salon/base location)
        const returnTravelStartMinutes = serviceStartMinutes + totalDuration + bufferAfter;
        const returnTravelEndMinutes = returnTravelStartMinutes + travelTime;
        blockingWindows.push({
          startTime: minutesToTime(returnTravelStartMinutes),
          endTime: minutesToTime(returnTravelEndMinutes),
          reason: 'Travel back to salon'
        });
      } else if (bufferBefore > 0 || bufferAfter > 0) {
        // Add buffers for salon services
        if (bufferBefore > 0) {
          blockingWindows.push({
            startTime: minutesToTime(serviceStartMinutes - bufferBefore),
            endTime: slotStart,
            reason: 'Buffer before service'
          });
        }

        if (bufferAfter > 0) {
          blockingWindows.push({
            startTime: slotEnd,
            endTime: minutesToTime(serviceStartMinutes + totalDuration + bufferAfter),
            reason: 'Buffer after service'
          });
        }
      }

      // Validate this time slot against existing appointments and blocked times
      const isValidSlot = await validateWeddingPackageSlot({
        vendorId,
        date,
        slotStartTime: slotStart,
        slotEndTime: slotEnd,
        totalDuration,
        staffMembers,
        travelTime,
        bufferBefore,
        bufferAfter,
        customerLocation,
        isHomeService: !!customerLocation
      });

      console.log(`Slot ${slotStart}-${slotEnd}: ${isValidSlot ? 'VALID' : 'INVALID'}`);

      if (isValidSlot) {
        // Create team slot
        const teamSlot = {
          startTime: slotStart,
          endTime: slotEnd,
          team: staffMembers.map(staff => ({
            staffId: staff._id,
            staffName: staff.fullName,
            vendorId: vendorId,
            rating: staff.rating,
            yearOfExperience: staff.yearOfExperience
          })),
          totalTravelTime: travelTime,
          totalDuration: totalDuration,
          blockingWindows: blockingWindows,
          acceptanceWindowHours,
          depositRequired: weddingPackage.depositAmount > 0,
          depositAmount: weddingPackage.depositAmount || 0,
          totalAmount: weddingPackage.totalPrice,
          requiresDeposit: weddingPackage.depositAmount > 0
        };

        availableSlots.push(teamSlot);
      }

      // Move to next slot
      currentTime += stepMinutes;
    }

    // Score slots based on various criteria
    const scoredSlots = availableSlots.map(slot => {
      let score = 0;

      // Prefer slots with shorter travel times
      if (travelTime > 0) {
        score += Math.max(0, 100 - travelTime);
      }

      // Prefer slots during preferred working hours (10 AM to 4 PM)
      const slotStartHour = parseInt(slot.startTime.split(':')[0]);
      if (slotStartHour >= 10 && slotStartHour <= 16) {
        score += 20; // Bonus for mid-day slots
      }

      // Calculate average staff rating
      const avgRating = slot.team.reduce((sum, member) => sum + (member.rating || 0), 0) / slot.team.length;
      score += avgRating * 10;

      return {
        ...slot,
        score
      };
    }).sort((a, b) => b.score - a.score); // Sort by score descending

    console.log(`=== Wedding Package Slot Generation Complete ===`);
    console.log(`Total slots generated: ${scoredSlots.length}`);
    console.log(`Date: ${date.toDateString()}`);
    console.log(`Staff members used: ${staffMembers.map(s => s.fullName).join(', ')}`);

    return scoredSlots;
  } catch (error) {
    console.error('Error generating wedding package slots:', error);
    throw error;
  }
}

/**
 * Validate a wedding package time slot against existing appointments and blocked times
 * @param {Object} params - Validation parameters
 * @returns {Promise<boolean>} - Whether the slot is valid
 */
async function validateWeddingPackageSlot({
  vendorId,
  date,
  slotStartTime,
  slotEndTime,
  totalDuration,
  staffMembers,
  travelTime,
  bufferBefore,
  bufferAfter,
  customerLocation,
  isHomeService
}) {
  try {
    const slotStartMinutes = timeToMinutes(slotStartTime);
    const slotEndMinutes = timeToMinutes(slotEndTime);

    console.log(`Validating slot ${slotStartTime}-${slotEndTime} for ${staffMembers.length} staff members`);

    // Check each staff member for conflicts
    for (const staff of staffMembers) {
      // Check if staff is available on this day based on their working hours
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayAvailableField = `${dayOfWeek}Available`;
      const daySlotsField = `${dayOfWeek}Slots`;

      console.log(`[Staff Check] ${staff.fullName}:`, {
        dayOfWeek,
        dayAvailableField,
        dayAvailable: staff[dayAvailableField],
        daySlotsField,
        slotsCount: staff[daySlotsField]?.length || 0,
        slots: staff[daySlotsField]
      });

      // If staff is not available on this day, slot is invalid
      if (!staff[dayAvailableField]) {
        console.log(`❌ Staff ${staff.fullName} is not available on ${dayOfWeek} (${dayAvailableField}=${staff[dayAvailableField]})`);
        return false;
      }

      // Get staff working hours for the day
      const staffWorkingHours = staff[daySlotsField];
      if (!staffWorkingHours || staffWorkingHours.length === 0) {
        console.log(`❌ Staff ${staff.fullName} has no working hours on ${dayOfWeek} (${daySlotsField} is empty or undefined)`);
        return false;
      }

      const slotTotalStart = slotStartMinutes - (isHomeService ? travelTime : 0) - bufferBefore;
      const slotTotalEnd = slotEndMinutes + (isHomeService ? travelTime : 0) + bufferAfter;

      // Check if the FULL activity fits within staff's working hours
      let slotWithinWorkingHours = false;
      for (const period of staffWorkingHours) {
        const periodStart = timeToMinutes(period.startTime);
        const periodEnd = timeToMinutes(period.endTime);

        if (slotTotalStart >= periodStart && slotTotalEnd <= periodEnd) {
          slotWithinWorkingHours = true;
          break;
        }
      }

      if (!slotWithinWorkingHours) {
        console.log(`❌ Full window ${minutesToTime(slotTotalStart)}-${minutesToTime(slotTotalEnd)} is outside staff ${staff.fullName}'s working hours`);
        return false;
      }

      console.log(`✅ Staff ${staff.fullName} is available for this slot`);

      // Get existing appointments for this staff member on this day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Query for appointments:
      // 1. Regular appointments (with staff.id)
      // 2. Wedding packages (with weddingPackageDetails.teamMembers)
      // 3. For wedding slot generation, also get ALL wedding appointments for that date
      const existingAppointments = await AppointmentModel.find({
        vendorId: vendorId,
        $or: [
          { staff: staff._id },
          { 'staff.id': staff._id },
          { 'serviceItems.staff': staff._id },
          { 'weddingPackageDetails.teamMembers.staffId': staff._id.toString() },
          { 'weddingPackageDetails.teamMembers.staffId': staff._id }
        ],
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['scheduled', 'confirmed', 'checked-in', 'temp-locked'] }
      });

      console.log(`Found ${existingAppointments.length} existing appointments for validation`);

      // Check for conflicts with existing appointments using full window logic
      for (const appointment of existingAppointments) {
        const aptStartMinutes = timeToMinutes(appointment.startTime);
        const aptEndMinutes = timeToMinutes(appointment.endTime);
        const aptTravel = Number(appointment.travelTime) || 0;
        const aptBufBefore = Number(appointment.bufferBefore) || 0;
        const aptBufAfter = Number(appointment.bufferAfter) || 0;

        const aptBlockedStart = aptStartMinutes - aptTravel - aptBufBefore;
        const aptBlockedEnd = aptEndMinutes + aptTravel + aptBufAfter;

        if (slotTotalStart < aptBlockedEnd && slotTotalEnd > aptBlockedStart) {
          console.log(`Slot window conflicts with appointment window ${minutesToTime(aptBlockedStart)}-${minutesToTime(aptBlockedEnd)}`);
          return false;
        }
      }

      // Check for conflicts with staff blocked times using full window logic
      if (staff.blockedTimes && staff.blockedTimes.length > 0) {
        const dateString = date.toISOString().split('T')[0];

        for (const blocked of staff.blockedTimes) {
          const blockedDateString = blocked.date instanceof Date ? 
            blocked.date.toISOString().split('T')[0] : 
            new Date(blocked.date).toISOString().split('T')[0];
          
          if (blockedDateString === dateString) {
            const blockStart = timeToMinutes(blocked.startTime);
            const blockEnd = timeToMinutes(blocked.endTime);

            if (slotTotalStart < blockEnd && slotTotalEnd > blockStart) {
              console.log(`Slot window conflicts with blocked time ${blocked.startTime}-${blocked.endTime}`);
              return false;
            }
          }
        }
      }
    } // End of for loop for each staff member

    return true; // Slot is valid for all staff members
  } catch (error) {
    console.error('Error validating wedding package slot:', error);
    return false;
  }
}

export default {
  generateFreshaLikeSlots,
  generateAnyStaffSlots,
  generateWeddingPackageSlots
};