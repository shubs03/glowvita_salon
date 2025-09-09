import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// Helper function to create date with time
const getDateWithTime = (date, timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

// Thunks for async operations
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (params, { dispatch }) => {
    try {
      const response = await dispatch(
        api.endpoints.getAppointments.initiate(params)
      ).unwrap();
      return response;
    } catch (error) {
      throw error;
    }
  }
);

export const createNewAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { dispatch }) => {
    try {
      const response = await dispatch(
        api.endpoints.createAppointment.initiate(appointmentData)
      ).unwrap();
      return response.appointment;
    } catch (error) {
      throw error;
    }
  }
);

export const updateExistingAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, ...updates }, { dispatch }) => {
    try {
      const response = await dispatch(
        api.endpoints.updateAppointment.initiate({ id, ...updates })
      ).unwrap();
      return response.appointment;
    } catch (error) {
      throw error;
    }
  }
);

export const removeAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id, { dispatch }) => {
    try {
      await dispatch(api.endpoints.deleteAppointment.initiate(id)).unwrap();
      return id;
    } catch (error) {
      throw error;
    }
  }
);

const initialState = {
  appointments: [],
  status: 'idle',
  error: null,
  selectedAppointment: null
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
    
    // Update appointment status
    updateAppointmentStatus: (state, action) => {
      const { id, status } = action.payload;
      const appointment = state.appointments.find(appt => appt.id === id);
      if (appointment) {
        appointment.status = status;
      }
    },
    
    // Add payment to an appointment
    addPayment: (state, action) => {
      const { id, payment } = action.payload;
      const appointment = state.appointments.find(appt => appt.id === id);
      if (appointment) {
        appointment.payment = {
          ...appointment.payment,
          ...payment,
          paymentStatus: payment.amount >= appointment.payment?.total ? 'paid' : 'partial'
        };
      }
    },
    
    // Reset the state
    resetAppointments: () => initialState
  },
  extraReducers: (builder) => {
    // Fetch appointments
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload.map(appt => ({
          ...appt,
          date: new Date(appt.date)
        }));
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Create appointment
      .addCase(createNewAppointment.fulfilled, (state, action) => {
        state.appointments.push({
          ...action.payload,
          date: new Date(action.payload.date)
        });
      })
      
      // Update appointment
      .addCase(updateExistingAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          appt => appt.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = {
            ...state.appointments[index],
            ...action.payload,
            date: new Date(action.payload.date)
          };
        }
      })
      
      // Delete appointment
      .addCase(removeAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(
          appt => appt.id !== action.payload
        );
      });
  }
});

// Export actions
export const { setSelectedAppointment } = appointmentSlice.actions;

// Selectors
export const selectAllAppointments = (state) => state.appointments.appointments;

export const selectAppointmentById = (state, appointmentId) =>
  state.appointments.appointments.find(appt => appt.id === appointmentId);

export const selectSelectedAppointment = state => state.appointments.selectedAppointment;

export const selectAppointmentsStatus = state => state.appointments.status;

export const selectAppointmentsError = state => state.appointments.error;

// Export the reducer
export default appointmentSlice.reducer;
