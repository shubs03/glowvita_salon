import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patients: [],
  status: 'idle',
  error: null,
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setPatients(state, action) {
      state.patients = action.payload;
    },
    addPatient(state, action) {
      state.patients.push(action.payload);
    },
    updatePatient(state, action) {
      const { id, updatedPatient } = action.payload;
      const index = state.patients.findIndex(p => p.id === id);
      if (index !== -1) {
        state.patients[index] = { ...state.patients[index], ...updatedPatient };
      }
    },
    deletePatient(state, action) {
      const id = action.payload;
      state.patients = state.patients.filter(p => p.id !== id);
    },
  },
});

export const { setPatients, addPatient, updatePatient, deletePatient } = patientSlice.actions;

export default patientSlice.reducer;