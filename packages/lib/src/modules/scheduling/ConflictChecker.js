import AppointmentModel from '../../models/Appointment/Appointment.model.js';

/**
 * Convert time string (HH:MM) to minutes from midnight
 * @param {string} timeStr 
 * @returns {number}
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.trim().split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Checks for overlapping appointments for a specific staff member
 * @param {Object} params 
 * @param {string} params.vendorId
 * @param {string} params.staffId
 * @param {Date} params.date
 * @param {string} params.startTime
 * @param {string} params.endTime
 * @param {string} [params.excludeAppointmentId] - Optional ID to exclude (e.g., when updating)
 * @returns {Promise<Object|null>} - The conflicting appointment if found, null otherwise
 */
export async function checkStaffConflict({
  vendorId,
  staffId,
  date,
  startTime,
  endTime,
  excludeAppointmentId = null
}) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Query for existing appointments for this staff on this day
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
      status: { $in: ['scheduled', 'confirmed', 'checked-in', 'temp-locked'] },
      _id: { $ne: excludeAppointmentId }
    }).lean();

    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime);

    for (const apt of existingAppointments) {
      const aptStart = timeToMinutes(apt.startTime);
      const aptEnd = timeToMinutes(apt.endTime);

      // Overlap condition: (start1 < end2) && (end1 > start2)
      if (reqStart < aptEnd && reqEnd > aptStart) {
        return apt;
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking staff conflict:', error);
    throw error;
  }
}

/**
 * Checks for conflicts for all service items in an appointment
 * @param {string} vendorId 
 * @param {Date} date 
 * @param {Array} serviceItems 
 * @param {string} [excludeAppointmentId]
 * @returns {Promise<Object|null>}
 */
export async function checkMultiServiceConflict(vendorId, date, serviceItems, excludeAppointmentId = null) {
  for (const item of serviceItems) {
    if (item.staff && item.staff !== 'any') {
      const conflict = await checkStaffConflict({
        vendorId,
        staffId: item.staff,
        date,
        startTime: item.startTime,
        endTime: item.endTime,
        excludeAppointmentId
      });
      if (conflict) return conflict;
    }
  }
  return null;
}
