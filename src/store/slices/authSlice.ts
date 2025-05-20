import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { BackendUser, LoginResponse, UpdateProfilePayload, UpdateProfileResponse } from '../../apiServiceTypes'; // Added UpdateProfileResponse back
import { updateUserProfile as apiUpdateUserProfile, getCurrentUserApi } from '../../apiService';
import { RootState } from '../store'; 

export interface AuthState {
  user: BackendUser | null;
  token: string | null;
  isLoading: boolean; 
  error: string | null; 
  isAuthenticated: boolean;
  
  isRegistering: boolean;
  registrationSuccess: boolean;
  registrationError: string | null;

  isUpdatingProfile: boolean;
  profileUpdateError: string | null;
  lastProfileUpdateSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('userToken'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('userToken'),
  
  isRegistering: false,
  registrationSuccess: false,
  registrationError: null,

  isUpdatingProfile: false,
  profileUpdateError: null,
  lastProfileUpdateSuccess: false,
};

// Async Thunk for updating user profile
export const updateUserProfileThunk = createAsyncThunk<
  BackendUser, 
  UpdateProfilePayload,
  { rejectValue: string }
>(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await apiUpdateUserProfile(profileData); // response is UpdateProfileResponse
      if (response.user) { // Access user directly
        return response.user; 
      }
      // If backend doesn't return user on update, we might need to fetch it again or handle differently
      throw new Error(response.message || "Profile updated, but no user data returned."); // Access message directly
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to update profile');
    }
  }
);

export const fetchCurrentUserThunk = createAsyncThunk<
  BackendUser, 
  void,        
  { rejectValue: string; state: RootState }
>(
  'auth/fetchCurrentUser',
  async (_, { dispatch, rejectWithValue, getState }) => {
    const token = getState().auth.token; 
    if (!token) {
      return rejectWithValue('No token found, cannot fetch user.');
    }
    try {
      const user = await getCurrentUserApi();
      dispatch(setUser(user)); 
      return user; 
    } catch (error: any) {
      dispatch(logout()); 
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch current user.');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      console.log('[authSlice] loginStart');
      state.isLoading = true;
      state.error = null;
      state.registrationError = null;
      state.profileUpdateError = null;
    },
    loginSuccess(state, action: PayloadAction<LoginResponse>) {
      console.log('[authSlice] loginSuccess, payload:', action.payload);
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('userToken', action.payload.token);
    },
    loginFailure(state, action: PayloadAction<string>) {
      console.log('[authSlice] loginFailure, error:', action.payload);
      state.isLoading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('userToken');
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.registrationError = null;
      state.registrationSuccess = false;
      state.profileUpdateError = null;
      state.lastProfileUpdateSuccess = false;
      localStorage.removeItem('userToken');
    },
    setUser(state, action: PayloadAction<BackendUser | null>) { 
        state.user = action.payload;
        if (action.payload) { 
            state.isAuthenticated = true; 
        } else { 
            state.isAuthenticated = false;
            state.user = null; 
            state.token = null; 
            localStorage.removeItem('userToken');
        }
    },
    clearAuthError(state) { 
        state.error = null;
        state.registrationError = null;
        state.profileUpdateError = null;
    },
    registerStart(state) {
      state.isRegistering = true;
      state.registrationError = null;
      state.registrationSuccess = false;
    },
    registerSuccess(state) {
      state.isRegistering = false;
      state.registrationSuccess = true;
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.isRegistering = false;
      state.registrationError = action.payload;
    },
    resetProfileUpdateStatus(state){ 
        state.isUpdatingProfile = false;
        state.profileUpdateError = null;
        state.lastProfileUpdateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
        .addCase(updateUserProfileThunk.pending, (state) => {
            state.isUpdatingProfile = true;
            state.profileUpdateError = null;
            state.lastProfileUpdateSuccess = false;
        })
        .addCase(updateUserProfileThunk.fulfilled, (state, action: PayloadAction<BackendUser>) => {
            state.isUpdatingProfile = false;
            state.user = action.payload; 
            state.lastProfileUpdateSuccess = true;
        })
        .addCase(updateUserProfileThunk.rejected, (state, action) => {
            state.isUpdatingProfile = false;
            state.profileUpdateError = action.payload ?? "Failed to update profile.";
        })
        .addCase(fetchCurrentUserThunk.pending, (state) => {
            state.isLoading = true; 
            state.error = null;
        })
        .addCase(fetchCurrentUserThunk.fulfilled, (state, action: PayloadAction<BackendUser>) => {
            state.isLoading = false;
            // state.user is set by dispatch(setUser(user)) in thunk
        })
        .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload ?? "Failed to fetch user.";
        });
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
  clearAuthError, 
  registerStart,
  registerSuccess,
  registerFailure,
  resetProfileUpdateStatus, 
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthIsLoading = (state: RootState) => state.auth.isLoading; 
export const selectAuthError = (state: RootState) => state.auth.error; 

export const selectIsRegistering = (state: RootState) => state.auth.isRegistering;
export const selectRegistrationSuccess = (state: RootState) => state.auth.registrationSuccess;
export const selectRegistrationError = (state: RootState) => state.auth.registrationError;

export const selectIsUpdatingProfile = (state: RootState) => state.auth.isUpdatingProfile;
export const selectProfileUpdateError = (state: RootState) => state.auth.profileUpdateError;
export const selectLastProfileUpdateSuccess = (state: RootState) => state.auth.lastProfileUpdateSuccess;