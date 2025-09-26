// slices/blockTimeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

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
  status: STATUS.IDLE,
  error: null
};

// Helper function to ensure proper date serialization
const serializeBlockTimeData = (data) => {
  // Handle both string and Date objects
  let dateValue = data.date;
  if (dateValue instanceof Date) {
    dateValue = dateValue.toISOString().split('T')[0];
  } else if (typeof dateValue === 'string' && dateValue.includes('T')) {
    dateValue = dateValue.split('T')[0];
  }
  
  return {
    ...data,
    date: dateValue,
    // Ensure other date/time fields are also strings
    startTime: data.startTime || '',
    endTime: data.endTime || '',
  };
};

// Mock data storage (temporary for frontend development)
let mockBlockTimes = [
  {
    id: 'block-1',
    staffMember: 'Jane Doe',
    date: new Date().toISOString().split('T')[0], // Today's date
    startTime: '10:00',
    endTime: '11:30',
    description: 'Team Meeting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'block-2',
    staffMember: 'Jane Doe',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    startTime: '14:00',
    endTime: '15:30',
    description: 'Training',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'block-3',
    staffMember: 'John Smith',
    date: new Date().toISOString().split('T')[0], // Today's date
    startTime: '13:00',
    endTime: '14:30',
    description: 'Lunch Break',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Async thunk with mock implementation
export const saveBlockTime = createAsyncThunk(
  'blockTime/saveBlockTime',
  async (blockTimeData, { rejectWithValue }) => {
    try {
      const serializedData = serializeBlockTimeData(blockTimeData);
      
      // Mock API response for frontend development
      return new Promise((resolve) => {
        setTimeout(() => {
          // Generate a mock ID for the new block time
          const newBlockTime = {
            id: `mock-${Date.now()}`,
            ...serializedData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Store in mock data
          mockBlockTimes.push(newBlockTime);
          
          console.log('Mock block time saved:', newBlockTime);
          resolve({ success: true, data: newBlockTime });
        }, 500); // Simulate network delay
      });
      
      // Uncomment this when backend is ready
      /*
      const response = await fetch('http://localhost:3001/api/block-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serializedData),
      });

      const responseData = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Failed to save block time';
        try {
          const errorData = JSON.parse(responseData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseData || errorMessage;
        }
        return rejectWithValue(errorMessage);
      }

      try {
        return responseData ? JSON.parse(responseData) : { success: true };
      } catch (e) {
        return { success: true };
      }
      */
    } catch (error) {
      console.error('Block time save error:', error);
      return rejectWithValue(error.message || 'An error occurred while saving block time');
    }
  }
);

// Add a function to get all block times (for frontend use)
export const fetchBlockTimes = createAsyncThunk(
  'blockTime/fetchBlockTimes',
  async (_, { rejectWithValue }) => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: [...mockBlockTimes] });
        }, 300);
      });
    } catch (error) {
      console.error('Failed to fetch block times:', error);
      return rejectWithValue('Failed to fetch block times');
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
    reset: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveBlockTime.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveBlockTime.fulfilled, (state) => {
        state.status = 'succeeded';
        // Reset form on success
        state.date = '';
        state.staffMember = '';
        state.startTime = '';
        state.endTime = '';
        state.description = '';
      })
      .addCase(saveBlockTime.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to save block time';
      })
      .addCase(fetchBlockTimes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBlockTimes.fulfilled, (state) => {
        state.status = 'succeeded';
        // Store the fetched block times in state if needed
      });
  },
});

// Selectors
export const selectBlockTimeForm = (state) => ({
  date: state.blockTime.date,
  staffMember: state.blockTime.staffMember,
  startTime: state.blockTime.startTime,
  endTime: state.blockTime.endTime,
  description: state.blockTime.description,
});

// Selector to get all blocked times for a specific staff member and date
export const selectBlockedTimes = (state, { staffName, date }) => {
  if (!staffName || !date) return [];
  
  const targetDate = new Date(date).toISOString().split('T')[0];
  return mockBlockTimes.filter(block => 
    block.staffMember === staffName && 
    block.date === targetDate
  );
};

export const selectBlockTimeStatus = (state) => state.blockTime.status;
export const selectBlockTimeError = (state) => state.blockTime.error;

// Export actions
export const blockTimeActions = blockTimeSlice.actions;

// Export individual action creators for convenience
export const { 
  setDate, 
  setStaffMember, 
  setStartTime, 
  setEndTime, 
  setDescription, 
  reset 
} = blockTimeSlice.actions;

// Export the reducer
export default blockTimeSlice.reducer;
