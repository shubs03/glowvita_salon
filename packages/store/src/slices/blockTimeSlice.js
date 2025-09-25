// slices/blockTimeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types
const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
};

// Initial state
const initialState = {
  date: '',
  staffMember: '',
  startTime: '',
  endTime: '',
  description: '',
  blockedTimes: [],
  status: STATUS.IDLE,
  error: null
};

// Helper function to ensure proper date serialization
const serializeBlockTimeData = (data) => {
  let dateValue = data.date;
  if (dateValue instanceof Date) {
    dateValue = dateValue.toISOString().split('T')[0];
  } else if (typeof dateValue === 'string' && dateValue.includes('T')) {
    dateValue = dateValue.split('T')[0];
  }
  
  return {
    ...data,
    date: dateValue,
    startTime: data.startTime || '',
    endTime: data.endTime || '',
  };
};

// Mock data storage
let mockBlockTimes = [];

// Async thunks
export const fetchBlockTimes = createAsyncThunk(
  'blockTime/fetchBlockTimes',
  async (_, { rejectWithValue }) => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockBlockTimes), 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addBlockTime = createAsyncThunk(
  'blockTime/addBlockTime',
  async (blockTimeData, { rejectWithValue }) => {
    try {
      const serializedData = serializeBlockTimeData(blockTimeData);
      const newBlockTime = {
        ...serializedData,
        id: `block-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      return new Promise((resolve) => {
        setTimeout(() => {
          mockBlockTimes.push(newBlockTime);
          resolve(newBlockTime);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeBlockTime = createAsyncThunk(
  'blockTime/removeBlockTime',
  async (blockTimeId, { rejectWithValue }) => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          mockBlockTimes = mockBlockTimes.filter(bt => bt.id !== blockTimeId);
          resolve(blockTimeId);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const blockTimeSlice = createSlice({
  name: 'blockTime',
  initialState,
  reducers: {
    setDate: (state, action) => {
      state.date = action.payload;
    },
    setStaffMember: (state, action) => {
      state.staffMember = action.payload;
    },
    setStartTime: (state, action) => {
      state.startTime = action.payload;
    },
    setEndTime: (state, action) => {
      state.endTime = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    resetBlockTime: (state) => {
      state.staffMember = '';
      state.startTime = '';
      state.endTime = '';
      state.description = '';
      state.date = '';
      state.status = STATUS.IDLE;
      state.error = null;
    },
    addBlockedTime: (state, action) => {
      const newBlockTime = {
        id: `block-${Date.now()}`,
        ...action.payload,
        createdAt: new Date().toISOString()
      };
      state.blockedTimes.push(newBlockTime);
    },
    removeBlockedTime: (state, action) => {
      state.blockedTimes = state.blockedTimes.filter(bt => bt.id !== action.payload);
    },
    // Add reset alias for backward compatibility
    reset: (state) => {
      state.staffMember = '';
      state.startTime = '';
      state.endTime = '';
      state.description = '';
      state.date = '';
      state.status = STATUS.IDLE;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlockTimes.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(fetchBlockTimes.fulfilled, (state, action) => {
        state.status = STATUS.SUCCEEDED;
        state.blockedTimes = action.payload;
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
        state.blockedTimes.push(action.payload);
        state.staffMember = '';
        state.startTime = '';
        state.endTime = '';
        state.description = '';
        state.date = '';
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
        state.blockedTimes = state.blockedTimes.filter(bt => bt.id !== action.payload);
      })
      .addCase(removeBlockTime.rejected, (state, action) => {
        state.status = STATUS.FAILED;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectBlockTimeForm = (state) => ({
  staffMember: state.blockTime.staffMember,
  startTime: state.blockTime.startTime,
  endTime: state.blockTime.endTime,
  description: state.blockTime.description,
  date: state.blockTime.date
});

export const selectBlockedTimes = (state) => state.blockTime.blockedTimes;

export const selectBlockedTimesByStaffAndDate = (state, { staffId, date }) => {
  return state.blockTime.blockedTimes.filter(bt => 
    (staffId === 'all' || bt.staffId === staffId) &&
    bt.date === date
  );
};

export const selectBlockTimeStatus = (state) => state.blockTime.status;
export const selectBlockTimeError = (state) => state.blockTime.error;

// Export actions with both named and default exports
export const { 
  setDate,
  setStaffMember,
  setStartTime,
  setEndTime,
  setDescription,
  resetBlockTime,
  addBlockedTime,
  removeBlockedTime,
  reset // Alias for resetBlockTime for backward compatibility
} = blockTimeSlice.actions;

export const blockTimeActions = {
  ...blockTimeSlice.actions,
  fetchBlockTimes,
  addBlockTime,
  removeBlockTime
};

export default blockTimeSlice.reducer;