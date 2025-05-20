import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { EmployeePreferenceRecord, EmployeePreferenceData, UpdateEmployeePreferencePayload } from '../../apiServiceTypes'; // Added UpdateEmployeePreferencePayload
import { getMyPreferences, submitMyPreferences, getAllEmployeePreferences, updateMyPreferences as apiUpdateMyPreferences } from '../../apiService'; // Added updateMyPreferences
import { RootState } from '../store';

export interface PreferenceState {
  myPreference: EmployeePreferenceRecord[]; // Changed to array
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  saveError: string | null;
  lastSaveSuccess: boolean; // To indicate a successful save

  // For Admin viewing all preferences
  allPreferences: EmployeePreferenceRecord[];
  isLoadingAll: boolean;
  allError: string | null;
}

const initialState: PreferenceState = {
  myPreference: [], // Changed to empty array
  isLoading: false,
  error: null,
  isSaving: false,
  saveError: null,
  lastSaveSuccess: false,

  // Admin
  allPreferences: [],
  isLoadingAll: false,
  allError: null,
};

// Async thunk for fetching current user's preferences
export const fetchMyPreferences = createAsyncThunk<
  EmployeePreferenceRecord[], // Return type changed to array
  void, // No argument
  { rejectValue: string }
>(
  'preferences/fetchMy',
  async (_, { rejectWithValue }) => { // No userId argument needed
    try {
      const data = await getMyPreferences(); // Call without arguments
      return data; // API service now returns EmployeePreferenceRecord[]
    } catch (error: any) {
      // Ensure a string is returned for rejectWithValue
      const errorMessage = error?.response?.data?.error || error.message || 'Failed to fetch preferences';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for submitting/updating current user's preferences
// Note: apiService.submitMyPreferences might need to handle create vs update, or separate thunks are needed.
// For now, this thunk will use submitMyPreferences which is noted to use POST /preferences/create.
export const saveMyPreferences = createAsyncThunk<
  EmployeePreferenceRecord, // Return type
  EmployeePreferenceData, // Argument: preference data
  { rejectValue: string }
>(
  'preferences/saveMy',
  async (preferenceData, { rejectWithValue }) => {
    try {
      const data = await submitMyPreferences(preferenceData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save preferences');
    }
  }
);

// Async thunk for fetching all employee preferences (Admin)
export const fetchAllEmployeePreferencesThunk = createAsyncThunk<
  EmployeePreferenceRecord[],
  void, // No argument
  { rejectValue: string }
>(
  'preferences/fetchAllAdmin',
  async (_, { rejectWithValue }) => {
    try {
      // getAllEmployeePreferences is now directly imported
      const data = await getAllEmployeePreferences();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch all preferences');
    }
  }
);

export const updateMyPreferencesThunk = createAsyncThunk<
  EmployeePreferenceRecord, // Return type
  { preferenceId: string; preferenceData: UpdateEmployeePreferencePayload }, // Argument type
  { rejectValue: string }
>(
  'preferences/updateMy',
  async ({ preferenceId, preferenceData }, { rejectWithValue }) => {
    try {
      const data = await apiUpdateMyPreferences(preferenceId, preferenceData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update preferences');
    }
  }
);

const preferenceSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    clearPreferenceError(state) {
      state.error = null;
      state.saveError = null;
      state.allError = null; // Clear admin fetch error too
    },
    resetPreferenceSaveStatus(state) {
        state.isSaving = false;
        state.saveError = null;
        state.lastSaveSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Preferences (Employee)
      .addCase(fetchMyPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastSaveSuccess = false;
      })
      .addCase(fetchMyPreferences.fulfilled, (state, action: PayloadAction<EmployeePreferenceRecord[]>) => { // Expect array
        state.isLoading = false;
        state.myPreference = action.payload; // Store the array of preferences
      })
      .addCase(fetchMyPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch preferences'; // Provide fallback
      })
      // Save My Preferences (Employee)
      .addCase(saveMyPreferences.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
        state.lastSaveSuccess = false;
      })
      .addCase(saveMyPreferences.fulfilled, (state, action: PayloadAction<EmployeePreferenceRecord>) => {
        state.isSaving = false;
        // Add the new preference to the array.
        // To prevent duplicates if a fetch hasn't happened yet, consider checking existence by week.
        // For simplicity now, just adding. If fetchMyPreferences runs after, it will get the source of truth.
        const newPreferenceUser = typeof action.payload.user === 'string' ? action.payload.user : action.payload.user?._id;
        const existingIndex = state.myPreference.findIndex(p => {
            const pUser = typeof p.user === 'string' ? p.user : p.user?._id;
            return p.week === action.payload.week && pUser === newPreferenceUser;
        });

        if (existingIndex !== -1) {
            state.myPreference[existingIndex] = action.payload; // Replace if somehow exists by week (e.g., rapid saves)
        } else {
            state.myPreference.push(action.payload);
        }
        state.myPreference.sort((a, b) => a.week - b.week); // Keep sorted by week
        state.lastSaveSuccess = true;
      })
      .addCase(saveMyPreferences.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload ?? 'Failed to save my preferences';
      })
      // Update My Preferences
      .addCase(updateMyPreferencesThunk.pending, (state) => {
        state.isSaving = true; // Share saving state with create
        state.saveError = null;
        state.lastSaveSuccess = false;
      })
      .addCase(updateMyPreferencesThunk.fulfilled, (state, action: PayloadAction<EmployeePreferenceRecord>) => {
        state.isSaving = false;
        state.lastSaveSuccess = true;
        // Update the specific preference in the myPreference array
        const indexInMyPrefs = state.myPreference.findIndex(p => p._id === action.payload._id);
        if (indexInMyPrefs !== -1) {
          state.myPreference[indexInMyPrefs] = action.payload;
        } else {
          // If for some reason it wasn't in myPreference (e.g. fetched, then cleared, then updated), add it.
          // This case should be rare if data flow is consistent.
          state.myPreference.push(action.payload);
          state.myPreference.sort((a, b) => a.week - b.week); // Keep sorted
        }
        
        // Optionally update in allPreferences list if admin is viewing their own and it's there
        const index = state.allPreferences.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.allPreferences[index] = action.payload;
        }
      })
      .addCase(updateMyPreferencesThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload ?? 'Failed to update preferences';
      })
      // Fetch All Employee Preferences (Admin)
      .addCase(fetchAllEmployeePreferencesThunk.pending, (state) => {
        state.isLoadingAll = true;
        state.allError = null;
      })
      .addCase(fetchAllEmployeePreferencesThunk.fulfilled, (state, action: PayloadAction<EmployeePreferenceRecord[]>) => {
        state.isLoadingAll = false;
        state.allPreferences = action.payload;
      })
      .addCase(fetchAllEmployeePreferencesThunk.rejected, (state, action) => {
        state.isLoadingAll = false;
        state.allError = action.payload ?? 'Failed to fetch all preferences';
      });
  },
});

export const { clearPreferenceError, resetPreferenceSaveStatus } = preferenceSlice.actions;

export default preferenceSlice.reducer;

// Selectors
export const selectMyPreference = (state: RootState) => state.preferences.myPreference;
export const selectPreferenceLoading = (state: RootState) => state.preferences.isLoading; // For employee's own pref loading
export const selectPreferenceError = (state: RootState) => state.preferences.error; // For employee's own pref error
export const selectPreferenceIsSaving = (state: RootState) => state.preferences.isSaving;
export const selectPreferenceSaveError = (state: RootState) => state.preferences.saveError;
export const selectPreferenceLastSaveSuccess = (state: RootState) => state.preferences.lastSaveSuccess;

// Admin Selectors for all preferences
export const selectAllEmployeePreferences = (state: RootState) => state.preferences.allPreferences;
export const selectAllPreferencesLoading = (state: RootState) => state.preferences.isLoadingAll;
export const selectAllPreferencesError = (state: RootState) => state.preferences.allError;