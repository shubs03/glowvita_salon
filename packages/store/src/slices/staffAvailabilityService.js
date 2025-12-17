import { format, isSameDay, getDay } from 'date-fns';

export const StaffAvailability = {
  staffId: '',
  staffName: '',
  isAvailable: false,
  availableSlots: [],
  blockedSlots: [],
  reason: undefined
};

export const VendorWorkingHours = {};

export const StaffSchedule = {
  _id: '',
  fullName: '',
  status: 'Active',
  sundayAvailable: false,
  sundaySlots: [],
  mondayAvailable: false,
  mondaySlots: [],
  tuesdayAvailable: false,
  tuesdaySlots: [],
  wednesdayAvailable: false,
  wednesdaySlots: [],
  thursdayAvailable: false,
  thursdaySlots: [],
  fridayAvailable: false,
  fridaySlots: [],
  saturdayAvailable: false,
  saturdaySlots: [],
  blockedTimes: [],
  leaveDates: []
};

export class StaffAvailabilityService {
  constructor(vendorHours) {
    this.vendorHours = vendorHours;
  }

  /**
   * Get staff availability for a specific date with enhanced error handling
   */
  getStaffAvailability(staff, date) {
    try {
      const dayOfWeek = format(date, 'EEEE').toLowerCase();

      // Check if staff is on leave
      const isOnLeave = this.checkStaffLeave(staff, date);
      if (isOnLeave) {
        return {
          staffId: staff._id,
          staffName: staff.fullName,
          isAvailable: false,
          availableSlots: [],
          blockedSlots: [],
          reason: isOnLeave.reason
        };
      }

      // Check if vendor is closed on this day
      const vendorDayHours = this.vendorHours[dayOfWeek];
      if (!vendorDayHours?.isOpen) {
        return {
          staffId: staff._id,
          staffName: staff.fullName,
          isAvailable: false,
          availableSlots: [],
          blockedSlots: [],
          reason: 'Shop closed'
        };
      }

      // Get staff's weekly schedule for this day
      const staffSchedule = this.getStaffScheduleForDay(staff, dayOfWeek);
      if (!staffSchedule.isAvailable) {
        return {
          staffId: staff._id,
          staffName: staff.fullName,
          isAvailable: false,
          availableSlots: [],
          blockedSlots: [],
          reason: 'Staff not scheduled'
        };
      }

      // Get blocked times for this specific date
      const blockedTimes = this.getStaffBlockedTimes(staff, date);

      // Calculate available slots (staff schedule minus blocked times)
      const availableSlots = this.calculateAvailableSlots(
        staffSchedule.slots,
        blockedTimes,
        vendorDayHours
      );

      return {
        staffId: staff._id,
        staffName: staff.fullName,
        isAvailable: availableSlots.length > 0,
        availableSlots,
        blockedSlots: blockedTimes
      };
    } catch (error) {
      console.error(`Error calculating availability for staff ${staff.fullName}:`, error);
      return {
        staffId: staff._id,
        staffName: staff.fullName,
        isAvailable: false,
        availableSlots: [],
        blockedSlots: [],
        reason: 'Error calculating availability'
      };
    }
  }

  /**
   * Check if staff is on leave for a specific date
   */
  checkStaffLeave(staff, date) {
    if (!staff.leaveDates) return { isOnLeave: false };

    const leaveDate = staff.leaveDates.find(leave =>
      isSameDay(new Date(leave.date), date)
    );

    if (leaveDate) {
      return {
        isOnLeave: true,
        reason: leaveDate.reason || 'On leave'
      };
    }

    return { isOnLeave: false };
  }

  /**
   * Get staff's schedule for a specific day of the week
   */
  getStaffScheduleForDay(staff, dayOfWeek) {
    const dayAvailabilityMap = {
      sunday: { available: staff.sundayAvailable || false, slots: 'sundaySlots' },
      monday: { available: staff.mondayAvailable || false, slots: 'mondaySlots' },
      tuesday: { available: staff.tuesdayAvailable || false, slots: 'tuesdaySlots' },
      wednesday: { available: staff.wednesdayAvailable || false, slots: 'wednesdaySlots' },
      thursday: { available: staff.thursdayAvailable || false, slots: 'thursdaySlots' },
      friday: { available: staff.fridayAvailable || false, slots: 'fridaySlots' },
      saturday: { available: staff.saturdayAvailable || false, slots: 'saturdaySlots' }
    };

    const dayConfig = dayAvailabilityMap[dayOfWeek];
    if (!dayConfig.available) {
      return { isAvailable: false, slots: [] };
    }

    const slots = staff[dayConfig.slots] || [];
    return { isAvailable: true, slots };
  }

  /**
   * Get blocked times for a specific date
   */
  getStaffBlockedTimes(staff, date) {
    if (!staff.blockedTimes) return [];

    return staff.blockedTimes
      .filter(block => {
        const blockDate = new Date(block.date);
        return isSameDay(blockDate, date);
      })
      .map(block => ({
        startTime: block.startTime,
        endTime: block.endTime,
        reason: block.reason
      }));
  }

  /**
   * Calculate available slots by removing blocked times from staff schedule
   */
  calculateAvailableSlots(staffSlots, blockedTimes, vendorHours) {
    if (staffSlots.length === 0) return [];

    const availableSlots = [];

    for (const staffSlot of staffSlots) {
      const slotStart = this.timeToMinutes(staffSlot.startTime);
      const slotEnd = this.timeToMinutes(staffSlot.endTime);
      const vendorStart = this.timeToMinutes(vendorHours.startTime);
      const vendorEnd = this.timeToMinutes(vendorHours.endTime);

      // Find overlapping blocked times
      const overlappingBlocks = blockedTimes.filter(block => {
        const blockStart = this.timeToMinutes(block.startTime);
        const blockEnd = this.timeToMinutes(block.endTime);
        return blockStart < slotEnd && blockEnd > slotStart;
      });

      if (overlappingBlocks.length === 0) {
        // No blocks, entire slot is available
        availableSlots.push(staffSlot);
      } else {
        // Calculate available portions around blocks
        let currentStart = Math.max(slotStart, vendorStart);

        for (const block of overlappingBlocks.sort((a, b) =>
          this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
        )) {
          const blockStart = Math.max(this.timeToMinutes(block.startTime), vendorStart);
          const blockEnd = Math.min(this.timeToMinutes(block.endTime), vendorEnd);

          if (currentStart < blockStart) {
            availableSlots.push({
              startTime: this.minutesToTime(currentStart),
              endTime: this.minutesToTime(blockStart)
            });
          }

          currentStart = Math.max(currentStart, blockEnd);
        }

        // Add remaining portion if any
        if (currentStart < Math.min(slotEnd, vendorEnd)) {
          availableSlots.push({
            startTime: this.minutesToTime(currentStart),
            endTime: this.minutesToTime(Math.min(slotEnd, vendorEnd))
          });
        }
      }
    }

    return availableSlots;
  }

  /**
   * Convert time string (HH:MM) to minutes
   */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes to time string (HH:MM)
   */
  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Get all available staff for a specific date
   */
  getAvailableStaff(staffList, date) {
    return staffList
      .filter(staff => staff.status === 'Active')
      .map(staff => this.getStaffAvailability(staff, date))
      .filter(availability => availability.isAvailable);
  }

  /**
   * Get all staff (available and unavailable) for a specific date
   */
  getAllStaffAvailability(staffList, date) {
    return staffList
      .filter(staff => staff.status === 'Active')
      .map(staff => this.getStaffAvailability(staff, date));
  }
}

export default StaffAvailabilityService;
