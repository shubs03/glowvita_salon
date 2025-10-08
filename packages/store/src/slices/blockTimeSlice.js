// slices/blockTimeSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

// Types
const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
};

// Helper function to normalize date to YYYY-MM-DD format
const normalizeDate = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error normalizing date:', error);
    return '';
  }
};

// Initial state
const initialState = {
  date: '',
  staffId: '',
  staffName: '',
  startTime: '',
  endTime: '',
  reason: '',
  blockedTimes: [], // Initialize as empty array
  status: STATUS.IDLE,
  error: null
};

// Helper function to check time overlap
const hasTimeOverlap = (existingBlock, newBlock) => {
  if (existingBlock.date !== newBlock.date) return false;
  if (existingBlock.staffId && newBlock.staffId && 
      existingBlock.staffId !== 'all' && newBlock.staffId !== 'all' &&
      existingBlock.staffId !== newBlock.staffId) return false;
  
  const existingStart = parseInt(existingBlock.startTime.replace(':', ''));
  const existingEnd = parseInt(existingBlock.endTime.replace(':', ''));
  const newStart = parseInt(newBlock.startTime.replace(':', ''));
  const newEnd = parseInt(newBlock.endTime.replace(':', ''));
  
  return newStart < existingEnd && newEnd > existingStart;
};

// Async thunks
export const fetchBlockTimes = createAsyncThunk(
  'blockTime/fetchBlockTimes',
  async (staffId, { rejectWithValue, dispatch }) => {
    try {
      if (!staffId) {
        throw new Error('Staff ID is required');
      }
      
      // Get the staff member's data
      const { data: staff } = await dispatch(
        glowvitaApi.endpoints.getStaff.initiate(staffId)
      ).unwrap();
      
      if (!staff) {
        throw new Error('Staff member not found');
      }
      
      // Return the staff's blockedTimes array, or an empty array if it doesn't exist
      return staff.blockedTimes || [];
      
    } catch (error) {
      console.error('Error in fetchBlockTimes:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to fetch blocked times';
      return rejectWithValue(errorMessage);
    }
  }
);

export const addBlockTime = createAsyncThunk(
  'blockTime/addBlockTime',
  async (blockTimeData, { rejectWithValue, dispatch, getState }) => {
    try {
      const { date, startTime, endTime, staffId, staffName, reason } = blockTimeData;
      
      // Validate required fields
      if (!date || !startTime || !endTime || !staffId) {
        const error = new Error('Missing required fields');
        console.error('Validation error:', { date, startTime, endTime, staffId });
        throw error;
      }
      
      // Create the block time data object
      const newBlockTime = {
        id: `block-${Date.now()}`,
        date: normalizeDate(date),
        startTime,
        endTime,
        staffId,
        staffName: staffName || 'Unknown Staff',
        reason: reason || 'Blocked time',
        isRecurring: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Creating block time:', newBlockTime);
      
      // Get the current staff member
      console.log('Fetching staff with ID:', staffId);
      let staff;
      try {
        const result = await dispatch(
          glowvitaApi.endpoints.getStaff.initiate(staffId)
        );
        
        console.log('Staff fetch result:', result);
        
        if (result.error) {
          console.error('Error fetching staff:', result.error);
          throw new Error(result.error.data?.message || 'Failed to fetch staff');
        }
        
        staff = result.data;
      } catch (error) {
        console.error('Exception when fetching staff:', error);
        throw new Error(`Failed to fetch staff: ${error.message}`);
      }
      
      if (!staff) {
        console.error('Staff not found with ID:', staffId);
        throw new Error(`Staff member with ID ${staffId} not found`);
      }
      
      // Create a clean staff object with only the fields we want to update
      const staffUpdate = {
        _id: staffId,  // Use _id for MongoDB
        blockedTimes: [
          ...(staff.blockedTimes || []),
          newBlockTime
        ]
      };
      
      console.log('Updating staff with data:', staffUpdate);
      
      // Save the updated staff document
      const result = await dispatch(
        glowvitaApi.endpoints.updateStaff.initiate(staffUpdate)
      );
      
      console.log('Update result:', result);
      
      if (result.error) {
        console.error('Error updating staff:', result.error);
        throw new Error(result.error.data?.message || 'Failed to update staff');
      }
      
      console.log('Block time created successfully:', newBlockTime);
      return newBlockTime;
      
    } catch (error) {
      console.error('Error in addBlockTime:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to block time';
      return rejectWithValue(errorMessage);
    }
  }
);

export const removeBlockTime = createAsyncThunk(
  'blockTime/removeBlockTime',
  async ({ blockTimeId, staffId }, { rejectWithValue, dispatch }) => {
    try {
      if (!blockTimeId || !staffId) {
        throw new Error('Missing blockTimeId or staffId');
      }
      
      // Get the current staff member
      const { data: staff } = await dispatch(
        glowvitaApi.endpoints.getStaff.initiate(staffId)
      ).unwrap();
      
      if (!staff) {
        throw new Error('Staff member not found');
      }
      
      // Filter out the blocked time
      const updatedBlockedTimes = (staff.blockedTimes || []).filter(
        block => block.id !== blockTimeId && block._id !== blockTimeId
      );
      
      // Update the staff's blockedTimes array
      const updatedStaff = {
        ...staff,
        blockedTimes: updatedBlockedTimes
      };
      
      // Save the updated staff document
      const result = await dispatch(
        glowvitaApi.endpoints.updateStaff.initiate({
          id: staffId,
          ...updatedStaff
        })
      );
      
      if (result.error) {
        throw new Error(result.error.data?.message || 'Failed to update staff');
      }
      
      console.log('Block time removed successfully:', blockTimeId);
      return blockTimeId;
      
    } catch (error) {
      console.error('Error in removeBlockTime:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to remove blocked time';
      return rejectWithValue(errorMessage);
    }
  }
);

const blockTimeSlice = createSlice({
  name: 'blockTime',
  initialState,
  reducers: {
    setDate: (state, action) => {
      state.date = normalizeDate(action.payload);
    },
    setStaff: (state, action) => {
      state.staffId = action.payload.id;
      state.staffName = action.payload.name;
    },
    setStartTime: (state, action) => {
      state.startTime = action.payload;
    },
    setEndTime: (state, action) => {
      state.endTime = action.payload;
    },
    setReason: (state, action) => {
      state.reason = action.payload;
    },
    resetBlockTime: (state) => {
      state.date = '';
      state.staffId = '';
      state.staffName = '';
      state.startTime = '';
      state.endTime = '';
      state.reason = '';
      state.error = null;
      state.status = STATUS.IDLE;
    },
    addBlockedTime: (state, action) => {
      // Ensure blockedTimes is an array
      if (!Array.isArray(state.blockedTimes)) {
        state.blockedTimes = [];
      }
      const newBlockTime = {
        id: `block-${Date.now()}`,
        ...action.payload,
        createdAt: new Date().toISOString()
      };
      state.blockedTimes = [...(state.blockedTimes || []), newBlockTime];
    },
    removeBlockedTime: (state, action) => {
      if (Array.isArray(state.blockedTimes)) {
        state.blockedTimes = state.blockedTimes.filter(bt => bt && bt.id !== action.payload);
      } else {
        state.blockedTimes = [];
      }
    },
    // Add reset alias for backward compatibility
    reset: (state) => {
      state.date = '';
      state.staffId = '';
      state.staffName = '';
      state.startTime = '';
      state.endTime = '';
      state.reason = '';
      state.error = null;
      state.status = STATUS.IDLE;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlockTimes.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(fetchBlockTimes.fulfilled, (state, action) => {
        state.status = STATUS.SUCCEEDED;
        // Ensure we're setting an array, default to empty array if payload is invalid
        state.blockedTimes = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchBlockTimes.rejected, (state, action) => {
        state.status = STATUS.FAILED;
        state.error = action.payload;
      })
      .addCase(addBlockTime.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(addBlockTime.fulfilled, (state, action) => {
        state.status = STATUS.SUCCEEDED;
        // Ensure blockedTimes is an array before pushing
        if (!Array.isArray(state.blockedTimes)) {
          state.blockedTimes = [];
        }
        // Safely add the new blocked time
        if (action.payload) {
          state.blockedTimes = [...(state.blockedTimes || []), action.payload];
        }
        state.error = null;
        // Reset form fields
        state.date = '';
        state.staffId = '';
        state.staffName = '';
        state.startTime = '';
        state.endTime = '';
      })
      .addCase(addBlockTime.rejected, (state, action) => {
        state.status = STATUS.FAILED;
        state.error = action.payload;
      })
      .addCase(removeBlockTime.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(removeBlockTime.fulfilled, (state, action) => {
        state.status = STATUS.SUCCEEDED;
        state.blockedTimes = state.blockedTimes.filter(
          block => block.id !== action.payload && block._id !== action.payload
        );
        state.error = null;
      })
      .addCase(removeBlockTime.rejected, (state, action) => {
        state.status = STATUS.FAILED;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectBlockTimeForm = (state) => ({
  date: state.blockTime.date,
  staffId: state.blockTime.staffId,
  staffName: state.blockTime.staffName,
  startTime: state.blockTime.startTime,
  endTime: state.blockTime.endTime,
  reason: state.blockTime.reason,
});

export const selectBlockedTimes = (state) => state.blockTime.blockedTimes;

export const selectBlockedTimesByStaffAndDate = createSelector(
  [selectBlockedTimes, (_, { staffId, date }) => ({ 
    staffId, 
    date: date ? normalizeDate(date) : '' 
  })],
  (blockedTimes = [], { staffId, date }) => {
    if (!blockedTimes || !Array.isArray(blockedTimes)) {
      return [];
    }
    
    return blockedTimes.filter(block => {
      if (!block) return false;
      
      const matchesStaff = !staffId || block.staffId === staffId || block.staffId === 'all';
      const matchesDate = !date || block.date === date;
      return matchesStaff && matchesDate && block.isActive !== false;
    });
  }
);

export const selectIsTimeBlocked = createSelector(
  [selectBlockedTimes, (_, { staffId, date, startTime, endTime }) => ({
    staffId, 
    date: date ? normalizeDate(date) : '',
    startTime: startTime || '',
    endTime: endTime || ''
  })],
  (blockedTimes = [], { staffId, date, startTime, endTime }) => {
    // Return false if any required parameter is missing
    if (!date || !startTime || !endTime) return false;
    
    // Return false if blockedTimes is not an array
    if (!Array.isArray(blockedTimes)) return false;
    
    const normalizedDate = normalizeDate(date);
    
    // Parse times safely
    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return (hours * 100) + (minutes || 0);
    };
    
    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    
    // If we couldn't parse the times, return false
    if (isNaN(startMinutes) || isNaN(endMinutes)) return false;
    
    return blockedTimes.some(block => {
      // Skip if block is invalid
      if (!block || typeof block !== 'object') return false;
      
      // Check date and staff match
      if (block.date !== normalizedDate) return false;
      if (staffId && block.staffId && block.staffId !== 'all' && block.staffId !== staffId) return false;
      
      // Parse block times safely
      const blockStart = parseTime(block.startTime);
      const blockEnd = parseTime(block.endTime);
      
      // Check for time overlap
      return startMinutes < blockEnd && endMinutes > blockStart && block.isActive !== false;
    });
  }
);

export const selectBlockTimeStatus = (state) => state.blockTime.status;
export const selectBlockTimeError = (state) => state.blockTime.error;

// Export actions with both named and default exports
export const { 
  setDate,
  setStaff,
  setStartTime,
  setEndTime,
  setReason,
  resetBlockTime,
  addBlockedTime,
  removeBlockedTime,
  reset
} = blockTimeSlice.actions;

export const blockTimeActions = {
  ...blockTimeSlice.actions,
  fetchBlockTimes,
  removeBlockTime
};

export default blockTimeSlice.reducer;