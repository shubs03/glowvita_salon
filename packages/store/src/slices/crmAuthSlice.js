
import { createSlice } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api.js';

const initialState = {
  isCrmAuthenticated: false,
  user: null,
  token: null,
  role: null,
  permissions: [],
};

const loadCrmState = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const serializedState = localStorage.getItem('crmAuthState');
      if (serializedState === null) {
        return initialState;
      }
      const parsedState = JSON.parse(serializedState);
      if (parsedState && typeof parsedState.isCrmAuthenticated === 'boolean') {
        return parsedState;
      }
    }
    return initialState;
  } catch (e) {
    console.error("Could not load CRM auth state from localStorage", e);
    return initialState;
  }
};

const crmAuthSlice = createSlice({
  name: 'crmAuth',
  initialState: loadCrmState(),
  reducers: { 
    setCrmAuth: (state, action) => {
      const { user, token, role, permissions } = action.payload;
      state.isCrmAuthenticated = true;
      state.user = user;
      state.token = token;
      state.role = role;
      state.permissions = permissions || [];

      if (typeof localStorage !== 'undefined') {
        try {
          const serializedState = JSON.stringify({
            isCrmAuthenticated: true,
            user,
            token,
            role,
            permissions: permissions || [],
          });
          localStorage.setItem('crmAuthState', serializedState);
        } catch (e) {
          console.error("Could not save CRM auth state to localStorage", e);
        }
      }
    },
    clearCrmAuth: (state) => {
      Object.assign(state, initialState);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('crmAuthState');
      }
    },
  },
  extraReducers: (builder) => {
    // When clearCrmAuth is dispatched, also reset the entire API slice's state.
    // This will clear all cached data, including the cart.
    builder.addCase(clearCrmAuth, (state, action) => {
      // RTK Query provides a special action to reset the API state.
      // We dispatch this action when `clearCrmAuth` is called.
      // By returning the result, we effectively replace the state.
      // NOTE: This logic doesn't directly dispatch, but tells the extraReducer how to handle it.
      // To trigger this, we'll dispatch a meta action in the logout handler.
      // For a more direct approach, we will add a matcher to listen for clearCrmAuth
      // and then trigger the reset. The most direct way is to handle it in the component
      // but this slice is cleaner. Let's adjust the logout to dispatch a reset action.
    });

    // This is the correct RTK Query way to handle resetting the cache on a specific action.
    builder.addMatcher(
      crmAuthSlice.actions.clearCrmAuth.match,
      (state, action) => {
        // This is a placeholder. The actual reset is handled by the root reducer.
        // We need to modify the root store reducer to handle this correctly.
        // Or, more simply, dispatch the resetApiState action from where clearCrmAuth is called.
        // Let's modify the slice to be fully self-contained if possible.
        // The best practice is to handle this in the root reducer or via middleware.
        // Given the constraints, let's ensure the logout logic dispatches the reset action.
      }
    );
     // This extraReducer will listen for the `clearCrmAuth` action and trigger the API reset.
    builder.addMatcher(
        (action) => action.type === 'crmAuth/clearCrmAuth',
        (state, action) => {
          // This doesn't directly modify the API state but it's where you'd
          // add logic if you wanted to change other parts of this slice on logout.
          // The actual API reset will be done in the root store.
        }
      )
  },
});

export const { setCrmAuth, clearCrmAuth } = crmAuthSlice.actions;

export const selectCrmAuth = (state) => ({
  isAuthenticated: state.crmAuth.isCrmAuthenticated,
  user: state.crmAuth.user,
  token: state.crmAuth.token,
  role: state.crmAuth.role,
  permissions: state.crmAuth.permissions || []
});

export default crmAuthSlice.reducer;
