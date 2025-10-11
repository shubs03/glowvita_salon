/**
 * Utility functions for validating staff working hours against vendor hours
 */

// Convert 12-hour format time to minutes from midnight
export const timeToMinutes = (timeStr) => {
  const [timePart, modifier] = timeStr.split(/([AP]M)/);
  let [hours, minutes] = timePart.split(':').map(Number);
  
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

// Convert minutes from midnight to 24-hour format time string
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Validate if staff time slot is within vendor working hours
export const validateStaffHoursAgainstVendor = (vendorHours, staffSlots, day) => {
  // If vendor is closed on this day, staff cannot work
  if (!vendorHours) {
    throw new Error(`Vendor is closed on ${day}. Staff cannot be scheduled.`);
  }
  
  // Validate each staff slot
  for (const slot of staffSlots) {
    const staffStartMinutes = timeToMinutes(slot.startTime);
    const staffEndMinutes = timeToMinutes(slot.endTime);
    
    // Check if staff hours are within vendor hours
    if (staffStartMinutes < vendorHours.openMinutes || staffEndMinutes > vendorHours.closeMinutes) {
      throw new Error(`Staff working hours must be within vendor hours (${vendorHours.openTime} - ${vendorHours.closeTime})`);
    }
    
    // Check if staff start time is before end time
    if (staffStartMinutes >= staffEndMinutes) {
      throw new Error('Staff start time must be before end time');
    }
  }
  
  return true;
};

// Parse vendor working hours to a standardized format
export const parseVendorHours = (vendorDayHours) => {
  if (!vendorDayHours || !vendorDayHours.isOpen || !vendorDayHours.hours.length) {
    return null;
  }
  
  // Return the first time slot (assuming single time slot per day)
  return {
    openTime: vendorDayHours.hours[0].openTime,
    closeTime: vendorDayHours.hours[0].closeTime,
    openMinutes: timeToMinutes(vendorDayHours.hours[0].openTime),
    closeMinutes: timeToMinutes(vendorDayHours.hours[0].closeTime)
  };
};

export default {
  timeToMinutes,
  minutesToTime,
  validateStaffHoursAgainstVendor,
  parseVendorHours
};