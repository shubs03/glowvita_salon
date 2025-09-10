import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

// Async thunks for API calls
export const fetchVendorProfile = createAsyncThunk(
  'vendorProfile/fetchVendorProfile',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await glowvitaApi.get(`/crm/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vendor profile');
    }
  }
);

export const updateVendorProfile = createAsyncThunk(
  'vendorProfile/updateVendorProfile',
  async ({ id, profileData }, { rejectWithValue }) => {
    try {
      const response = await glowvitaApi.put(`/crm/vendors/${id}`, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update vendor profile');
    }
  }
);

// Working Hours Thunks
export const fetchWorkingHours = createAsyncThunk(
  'vendorProfile/fetchWorkingHours',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await glowvitaApi.get('/crm/workinghours', {
        params: { vendorId }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch working hours');
    }
  }
);

export const updateWorkingHours = createAsyncThunk(
  'vendorProfile/updateWorkingHours',
  async ({ vendorId, workingHours, timezone = 'Asia/Kolkata' }, { rejectWithValue }) => {
    try {
      const response = await glowvitaApi.put('/crm/workinghours', {
        workingHours,
        timezone
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update working hours');
    }
  }
);

export const addSpecialHours = createAsyncThunk(
  'vendorProfile/addSpecialHours',
  async ({ vendorId, date, hours, isClosed = false }, { rejectWithValue }) => {
    try {
      const response = await glowvitaApi.post('/crm/workinghours/special', {
        date,
        hours,
        isClosed
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add special hours');
    }
  }
);

export const removeSpecialHours = createAsyncThunk(
  'vendorProfile/removeSpecialHours',
  async (specialHourId, { rejectWithValue }) => {
    try {
      await glowvitaApi.delete('/crm/workinghours', {
        params: { id: specialHourId }
      });
      return specialHourId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove special hours');
    }
  }
);

const initialState = {
  profile: {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    salonName: '',
    businessName: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      coordinates: {
        lat: null,
        lng: null
      }
    },
    contactPerson: {
      name: '',
      email: '',
      phone: ''
    },
    workingHours: {
    monday: { open: '09:00', close: '18:00', isOpen: true },
    tuesday: { open: '09:00', close: '18:00', isOpen: true },
    wednesday: { open: '09:00', close: '18:00', isOpen: true },
    thursday: { open: '09:00', close: '18:00', isOpen: true },
    friday: { open: '09:00', close: '18:00', isOpen: true },
    saturday: { open: '10:00', close: '16:00', isOpen: true },
    sunday: { open: '', close: '', isOpen: false },
    timezone: 'Asia/Kolkata'
  },
  specialHours: [],
    services: [],
    staff: [],
    gallery: [],
    documents: [],
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      website: ''
    },
    subscription: {
      plan: '',
      status: '',
      startDate: null,
      endDate: null
    },
    status: 'inactive',
    isVerified: false,
    rating: 0,
    totalReviews: 0,
    createdAt: '',
    updatedAt: ''
  },
  loading: false,
  error: null,
  message: '',
  workingHoursLoading: false,
  workingHoursError: null
};

const vendorProfileSlice = createSlice({
  name: 'vendorProfile',
  initialState,
  reducers: {
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      const fields = field.split('.');
      
      if (fields.length === 1) {
        state.profile[fields[0]] = value;
      } else if (fields.length === 2) {
        state.profile[fields[0]][fields[1]] = value;
      } else if (fields.length === 3) {
        state.profile[fields[0]][fields[1]][fields[2]] = value;
      }
    },
    updateWorkingHoursField: (state, action) => {
      const { day, field, value } = action.payload;
      if (day && field) {
        state.profile.workingHours[day][field] = value;
      }
    },
    updateWorkingHoursReducer: (state, action) => {
      const { workingHours, timezone } = action.payload;
      if (workingHours) {
        state.profile.workingHours = {
          ...state.profile.workingHours,
          ...workingHours
        };
      }
      if (timezone) {
        state.profile.workingHours.timezone = timezone;
      }
    },
    addSpecialHoursLocal: (state, action) => {
      state.profile.specialHours.push(action.payload);
    },
    removeSpecialHoursLocal: (state, action) => {
      state.profile.specialHours = state.profile.specialHours.filter(
        hours => hours.id !== action.payload
      );
    },
    updateSocialMedia: (state, action) => {
      const { platform, url } = action.payload;
      state.profile.socialMedia[platform] = url;
    },
    clearVendorProfile: (state) => {
      return { ...initialState };
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    clearMessage: (state) => {
      state.message = '';
      state.error = null;
    },
    setWorkingHoursLoading: (state, action) => {
      state.workingHoursLoading = action.payload;
    },
    setWorkingHoursError: (state, action) => {
      state.workingHoursError = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Vendor Profile
    builder.addCase(fetchVendorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase (fetchVendorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = { ...state.profile, ...action.payload };
    });
    builder.addCase(fetchVendorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Vendor Profile
    builder.addCase(updateVendorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateVendorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = { ...state.profile, ...action.payload };
      state.message = 'Profile updated successfully';
    });
    builder.addCase(updateVendorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Working Hours
    builder.addCase(fetchWorkingHours.pending, (state) => {
      state.workingHoursLoading = true;
      state.workingHoursError = null;
    });
    builder.addCase(fetchWorkingHours.fulfilled, (state, action) => {
      state.workingHoursLoading = false;
      if (action.payload.workingHours) {
        state.profile.workingHours = action.payload.workingHours;
      }
      if (action.payload.specialHours) {
        state.profile.specialHours = action.payload.specialHours;
      }
    });
    builder.addCase(fetchWorkingHours.rejected, (state, action) => {
      state.workingHoursLoading = false;
      state.workingHoursError = action.payload;
    });

    // Update Working Hours
    builder.addCase(updateWorkingHours.pending, (state) => {
      state.workingHoursLoading = true;
      state.workingHoursError = null;
    });
    builder.addCase(updateWorkingHours.fulfilled, (state, action) => {
      state.workingHoursLoading = false;
      state.profile.workingHours = {
        ...state.profile.workingHours,
        ...action.payload.workingHours
      };
      state.message = 'Working hours updated successfully';
    });
    builder.addCase(updateWorkingHours.rejected, (state, action) => {
      state.workingHoursLoading = false;
      state.workingHoursError = action.payload;
    });

    // Add Special Hours
    builder.addCase(addSpecialHours.fulfilled, (state, action) => {
      state.profile.specialHours = [
        ...state.profile.specialHours,
        action.payload
      ];
      state.message = 'Special hours added successfully';
    });
    builder.addCase(addSpecialHours.rejected, (state, action) => {
      state.workingHoursError = action.payload;
    });

    // Remove Special Hours
    builder.addCase(removeSpecialHours.fulfilled, (state, action) => {
      state.profile.specialHours = state.profile.specialHours.filter(
        hours => hours.id !== action.payload
      );
      state.message = 'Special hours removed successfully';
    });
    builder.addCase(removeSpecialHours.rejected, (state, action) => {
      state.workingHoursError = action.payload;
    });
  }
});

export const {
  updateProfileField,
  updateWorkingHoursField,
  updateWorkingHours: updateWorkingHoursReducer,
  addSpecialHoursLocal,
  removeSpecialHoursLocal,
  updateSocialMedia,
  clearVendorProfile,
  setMessage,
  clearMessage,
  setWorkingHoursLoading,
  setWorkingHoursError
} = vendorProfileSlice.actions;

// Selectors
export const selectVendorProfile = (state) => state.vendorProfile.profile;
export const selectVendorProfileLoading = (state) => state.vendorProfile.loading;
export const selectVendorProfileError = (state) => state.vendorProfile.error;
export const selectVendorProfileMessage = (state) => state.vendorProfile.message;

export const selectWorkingHours = (state) => state.vendorProfile.profile.workingHours;
export const selectSpecialHours = (state) => state.vendorProfile.profile.specialHours;
export const selectWorkingHoursLoading = (state) => state.vendorProfile.workingHoursLoading;
export const selectWorkingHoursError = (state) => state.vendorProfile.workingHoursError;

export default vendorProfileSlice.reducer;
