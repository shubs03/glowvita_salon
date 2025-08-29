import { createSlice } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

// Helper function to create date with time
const getDateWithTime = (date, timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

const createMockAppointments = () => {
  // Create today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Create day after tomorrow
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  return [
    {
      id: '1',
      clientName: 'John Doe',
      service: 'Haircut',
      staffName: 'Jane Doe',
      date: getDateWithTime(today, '10:00'),
      startTime: '10:00',
      endTime: '11:00',
      status: 'confirmed',
      notes: 'Regular haircut'
    },
    {
      id: '2',
      clientName: 'Alice Smith',
      service: 'Hair Coloring',
      staffName: 'John Smith',
      date: getDateWithTime(tomorrow, '14:00'),
      startTime: '14:00',
      endTime: '16:00',
      status: 'pending',
      notes: 'Full highlights'
    },
    {
      id: '3',
      clientName: 'Bob Johnson',
      service: 'Beard Trim',
      staffName: 'Emily White',
      date: getDateWithTime(dayAfterTomorrow, '11:30'),
      startTime: '11:30',
      endTime: '12:00',
      status: 'confirmed',
      notes: 'Just a trim'
    }
  ];
};

const initialState = {
  appointments: createMockAppointments(),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedAppointment: null
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    // Add a new appointment
    addAppointment: (state, action) => {
      state.appointments.push({
        id: Date.now().toString(),
        status: 'pending',
        ...action.payload
      });
    },
    
    // Update an existing appointment
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(appt => appt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = {
          ...state.appointments[index],
          ...action.payload.updates
        };
      }
    },
    
    // Delete an appointment
    deleteAppointment: (state, action) => {
      state.appointments = state.appointments.filter(appt => appt.id !== action.payload);
    },
    
    // Set the currently selected appointment
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
  }
});

// Export actions
export const {
  addAppointment,
  updateAppointment,
  deleteAppointment,
  setSelectedAppointment,
  updateAppointmentStatus,
  addPayment,
  resetAppointments
} = appointmentSlice.actions;

// Selectors
export const selectAllAppointments = state => state.appointments.appointments;
export const selectAppointmentById = (state, appointmentId) => 
  state.appointments.appointments.find(appt => appt.id === appointmentId);
export const selectSelectedAppointment = state => state.appointments.selectedAppointment;

// Hook that provides appointment actions
export const useAppointmentActions = () => {
  const dispatch = useDispatch();

  return {
    addNewAppointment: (appointmentData) => {
      dispatch(addAppointment(appointmentData));
    },
    updateExistingAppointment: (id, updates) => {
      dispatch(updateAppointment({ id, updates }));
    },
    removeAppointment: (id) => {
      dispatch(deleteAppointment(id));
    },
    selectAppointment: (appointment) => {
      dispatch(setSelectedAppointment(appointment));
    },
    changeAppointmentStatus: (id, status) => {
      dispatch(updateAppointmentStatus({ id, status }));
    },
    addPaymentToAppointment: (id, paymentData) => {
      dispatch(addPayment({ id, paymentData }));
    },
    resetAppointments: () => {
      dispatch(resetAppointments());
    }
  };
};

export default appointmentSlice.reducer;
