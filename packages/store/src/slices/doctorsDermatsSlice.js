import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  doctors: [],
  loading: false,
  error: null,
  currentDoctor: null,
  status: 'idle',
};

// Async thunk to fetch doctors list
export const fetchDoctorsDermats = createAsyncThunk(
  'doctorsDermats/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Replace with actual API call
      const response = await fetch('/api/doctors-dermats');
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch doctors');
    }
  }
);

// Async thunk to update doctor status
export const updateDoctorStatus = createAsyncThunk(
  'doctorsDermats/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/doctors-dermats/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update doctor status');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update doctor status');
    }
  }
);

const doctorsDermatsSlice = createSlice({
  name: 'doctorsDermats',
  initialState,
  reducers: {
    setCurrentDoctor: (state, action) => {
      state.currentDoctor = action.payload;
    },
    clearCurrentDoctor: (state) => {
      state.currentDoctor = null;
    },
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch doctors
    builder
      .addCase(fetchDoctorsDermats.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(fetchDoctorsDermats.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.doctors = action.payload;
      })
      .addCase(fetchDoctorsDermats.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      });

    // Update doctor status
    builder
      .addCase(updateDoctorStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateDoctorStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedDoctor = action.payload;
        state.doctors = state.doctors.map((doctor) =>
          doctor.id === updatedDoctor.id ? updatedDoctor : doctor
        );
        if (state.currentDoctor?.id === updatedDoctor.id) {
          state.currentDoctor = updatedDoctor;
        }
      })
      .addCase(updateDoctorStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setCurrentDoctor, clearCurrentDoctor, resetStatus } = doctorsDermatsSlice.actions;

export default doctorsDermatsSlice.reducer;
