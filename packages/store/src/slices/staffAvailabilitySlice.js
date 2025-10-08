import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { format, isSameDay, getDay } from 'date-fns';
import { glowvitaApi } from '@repo/store/api';

// Types
const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
};

// Initial state
const initialState = {
  staffAvailability: [],
  workingHours: null,
  status: STATUS.IDLE,
  error: null
};

// Helper functions
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Async thunks
export const fetchStaffAvailability = createAsyncThunk(
  'staffAvailability/fetchStaffAvailability',
  async ({ date, staffList }, { dispatch, rejectWithValue }) => {
    try {
      if (!date || !staffList?.length) {
        return [];
      }

      // Get working hours for the date
      const workingHoursResponse = await dispatch(
        glowvitaApi.endpoints.getWorkingHours.initiate(format(date, 'yyyy-MM-dd'))
      ).unwrap();

      // Get blocked times for the date
      const blockedTimesResponse = await dispatch(
        glowvitaApi.endpoints.getBlockedTimes.initiate({
          date: format(date, 'yyyy-MM-dd')
        })
      ).unwrap();

      const dayOfWeek = format(date, 'EEEE').toLowerCase();
      const workingHours = workingHoursResponse?.workingHours?.find(
        wh => wh.day.toLowerCase() === dayOfWeek
      );

      if (!workingHours?.isOpen) {
        return staffList.map(staff => ({
          staffId: staff._id,
          staffName: staff.fullName,
          isAvailable: false,
          availableSlots: [],
          blockedSlots: [],
          reason: 'Shop closed'
        }));
      }

      // Calculate availability for each staff member
      const availability = staffList.map(staff => {
        // Check if staff is on leave
        const isOnLeave = staff.leaveDates?.some(leave =>
          isSameDay(new Date(leave.date), date)
        );

        if (isOnLeave) {
          return {
            staffId: staff._id,
            staffName: staff.fullName,
            isAvailable: false,
            availableSlots: [],
            blockedSlots: [],
            reason: 'On leave'
          };
        }

        // Get staff's weekly schedule for this day
        const dayAvailabilityMap = {
          sunday: { available: staff.sundayAvailable, slots: staff.sundaySlots },
          monday: { available: staff.mondayAvailable, slots: staff.mondaySlots },
          tuesday: { available: staff.tuesdayAvailable, slots: staff.tuesdaySlots },
          wednesday: { available: staff.wednesdayAvailable, slots: staff.wednesdaySlots },
          thursday: { available: staff.thursdayAvailable, slots: staff.thursdaySlots },
          friday: { available: staff.fridayAvailable, slots: staff.fridaySlots },
          saturday: { available: staff.saturdayAvailable, slots: staff.saturdaySlots }
        };

        const dayConfig = dayAvailabilityMap[dayOfWeek];
        if (!dayConfig?.available || !dayConfig.slots?.length) {
          return {
            staffId: staff._id,
            staffName: staff.fullName,
            isAvailable: false,
            availableSlots: [],
            blockedSlots: [],
            reason: 'Staff not scheduled'
          };
        }

        // Get blocked times for this staff member
        const staffBlockedTimes = blockedTimesResponse?.filter(block =>
          block.staffId === staff._id && isSameDay(new Date(block.date), date)
        ) || [];

        // Calculate available slots
        const availableSlots = calculateAvailableSlots(
          dayConfig.slots,
          staffBlockedTimes,
          workingHours
        );

        return {
          staffId: staff._id,
          staffName: staff.fullName,
          isAvailable: availableSlots.length > 0,
          availableSlots,
          blockedSlots: staffBlockedTimes,
          reason: availableSlots.length === 0 ? 'No available slots' : null
        };
      });

      return availability;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const blockStaffTime = createAsyncThunk(
  'staffAvailability/blockStaffTime',
  async (blockData, { dispatch, rejectWithValue }) => {
    try {
      const response = await dispatch(
        glowvitaApi.endpoints.blockStaffTime.initiate(blockData)
      ).unwrap();

      // Refresh staff availability
      await dispatch(fetchStaffAvailability({
        date: blockData.date,
        staffList: [] // This should be passed from component
      }));

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unblockStaffTime = createAsyncThunk(
  'staffAvailability/unblockStaffTime',
  async ({ blockId, date, staffId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await dispatch(
        glowvitaApi.endpoints.unblockStaffTime.initiate(blockId)
      ).unwrap();

      // Refresh staff availability
      await dispatch(fetchStaffAvailability({ date, staffList: [] }));

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to calculate available slots
const calculateAvailableSlots = (staffSlots, blockedTimes, workingHours) => {
  if (!staffSlots?.length) return [];

  const availableSlots = [];

  for (const staffSlot of staffSlots) {
    const slotStart = timeToMinutes(staffSlot.startTime);
    const slotEnd = timeToMinutes(staffSlot.endTime);
    const vendorStart = timeToMinutes(workingHours.startTime);
    const vendorEnd = timeToMinutes(workingHours.endTime);

    // Find overlapping blocked times
    const overlappingBlocks = blockedTimes.filter(block => {
      const blockStart = timeToMinutes(block.startTime);
      const blockEnd = timeToMinutes(block.endTime);
      return blockStart < slotEnd && blockEnd > slotStart;
    });

    if (overlappingBlocks.length === 0) {
      // No blocks, entire slot is available
      availableSlots.push(staffSlot);
    } else {
      // Calculate available portions around blocks
      let currentStart = Math.max(slotStart, vendorStart);

      for (const block of overlappingBlocks.sort((a, b) =>
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      )) {
        const blockStart = Math.max(timeToMinutes(block.startTime), vendorStart);
        const blockEnd = Math.min(timeToMinutes(block.endTime), vendorEnd);

        if (currentStart < blockStart) {
          availableSlots.push({
            startTime: minutesToTime(currentStart),
            endTime: minutesToTime(blockStart)
          });
        }

        currentStart = Math.max(currentStart, blockEnd);
      }

      // Add remaining portion if any
      if (currentStart < Math.min(slotEnd, vendorEnd)) {
        availableSlots.push({
          startTime: minutesToTime(currentStart),
          endTime: minutesToTime(Math.min(slotEnd, vendorEnd))
        });
      }
    }
  }

  return availableSlots;
};

const staffAvailabilitySlice = createSlice({
  name: 'staffAvailability',
  initialState,
  reducers: {
    setWorkingHours: (state, action) => {
      state.workingHours = action.payload;
    },
    clearAvailability: (state) => {
      state.staffAvailability = [];
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = STATUS.IDLE;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffAvailability.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchStaffAvailability.fulfilled, (state, action) => {
        state.status = STATUS.SUCCEEDED;
        state.staffAvailability = action.payload;
      })
      .addCase(fetchStaffAvailability.rejected, (state, action) => {
        state.status = STATUS.FAILED;
        state.error = action.payload;
      })
      .addCase(blockStaffTime.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(blockStaffTime.fulfilled, (state, action) => {
        state.status = STATUS.SUCCEEDED;
      })
      .addCase(blockStaffTime.rejected, (state, action) => {
        state.status = STATUS.FAILED;
        state.error = action.payload;
      })
      .addCase(unblockStaffTime.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(unblockStaffTime.fulfilled, (state, action) => {
        state.status = STATUS.SUCCEEDED;
      })
      .addCase(unblockStaffTime.rejected, (state, action) => {
        state.status = STATUS.FAILED;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectStaffAvailability = (state) => state.staffAvailability.staffAvailability;
export const selectStaffAvailabilityStatus = (state) => state.staffAvailability.status;
export const selectStaffAvailabilityError = (state) => state.staffAvailability.error;
export const selectWorkingHours = (state) => state.staffAvailability.workingHours;

// Get availability for specific staff member
export const selectStaffAvailabilityById = (state, staffId) =>
  state.staffAvailability.staffAvailability.find(
    availability => availability.staffId === staffId
  );

// Get available staff only
export const selectAvailableStaff = (state) =>
  state.staffAvailability.staffAvailability.filter(
    availability => availability.isAvailable
  );

// Actions
export const { setWorkingHours, clearAvailability, resetStatus } = staffAvailabilitySlice.actions;

// Reducer
export default staffAvailabilitySlice.reducer;
