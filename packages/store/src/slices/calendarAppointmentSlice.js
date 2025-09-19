import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

// Initial state
const initialState = {
  appointments: [],
  selectedAppointment: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  total: 0,
  page: 1,
  pageSize: 10,
  filters: {},
};

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'calendarAppointments/fetchAppointments',
  async (params = {}, { getState }) => {
    const { page, pageSize, ...filters } = params;
    const response = await glowvitaApi.endpoints.getAppointments.initiate({
      page: page || getState().calendarAppointments.page,
      pageSize: pageSize || getState().calendarAppointments.pageSize,
      ...filters,
    });
    return response.data;
  }
);

export const createAppointment = createAsyncThunk(
  'calendarAppointments/createAppointment',
  async (appointmentData, { dispatch }) => {
    const response = await dispatch(
      glowvitaApi.endpoints.createAppointment.initiate(appointmentData)
    ).unwrap();
    return response.data;
  }
);

export const updateAppointment = createAsyncThunk(
  'calendarAppointments/updateAppointment',
  async ({ id, ...updates }, { dispatch }) => {
    const response = await dispatch(
      glowvitaApi.endpoints.updateAppointment.initiate({ _id: id, ...updates })
    ).unwrap();
    return response.data;
  }
);

export const deleteAppointment = createAsyncThunk(
  'calendarAppointments/deleteAppointment',
  async (id, { dispatch }) => {
    await dispatch(glowvitaApi.endpoints.deleteAppointment.initiate(id)).unwrap();
    return id;
  }
);

const calendarAppointmentSlice = createSlice({
  name: 'calendarAppointments',
  initialState,
  reducers: {
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to first page when filters change
    },
    resetFilters: (state) => {
      state.filters = {};
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch appointments
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload.data || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Create appointment
    builder
      .addCase(createAppointment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Update appointment
    builder
      .addCase(updateAppointment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.appointments.findIndex(
          (appt) => appt._id === action.payload._id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Delete appointment
    builder
      .addCase(deleteAppointment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = state.appointments.filter(
          (appt) => appt._id !== action.payload
        );
        state.total = Math.max(0, state.total - 1);
        if (state.selectedAppointment?._id === action.payload) {
          state.selectedAppointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Export actions
export const {
  setSelectedAppointment,
  clearSelectedAppointment,
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
} = calendarAppointmentSlice.actions;

// Selectors
export const selectAllAppointments = (state) => state.calendarAppointments.appointments;
export const selectAppointmentById = (state, appointmentId) =>
  state.calendarAppointments.appointments.find(appt => appt._id === appointmentId);
export const selectSelectedAppointment = (state) =>
  state.calendarAppointments.selectedAppointment;
export const selectAppointmentsStatus = (state) => state.calendarAppointments.status;
export const selectAppointmentsError = (state) => state.calendarAppointments.error;
export const selectAppointmentsPagination = (state) => ({
  page: state.calendarAppointments.page,
  pageSize: state.calendarAppointments.pageSize,
  total: state.calendarAppointments.total,
});
export const selectAppointmentsFilters = (state) => state.calendarAppointments.filters;

export default calendarAppointmentSlice.reducer;
