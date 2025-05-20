import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { APISchedule } from '../../apiServiceTypes'; // Changed from BackendShift to APISchedule
import { getEmployeeSchedule, updateShiftSwapAvailability } from '../../apiService'; 
import { RootState } from '../store';

export interface EmployeeScheduleState {
  schedules: APISchedule[]; // Changed to APISchedule[]
  isLoading: boolean;
  error: string | null;
  isUpdatingSwapAvailability: boolean;
  updateSwapError: string | null;
}

const initialState: EmployeeScheduleState = {
  schedules: [],
  isLoading: false,
  error: null,
  isUpdatingSwapAvailability: false,
  updateSwapError: null,
};

// Async thunk for fetching employee schedule
export const fetchEmployeeSchedule = createAsyncThunk<
  APISchedule[], // Return type updated to APISchedule[]
  string, 
  { rejectValue: string } 
>(
  'employeeSchedule/fetchSchedule',
  async (employeeId, { rejectWithValue }) => {
    try {
      const data = await getEmployeeSchedule(employeeId); // API returns APISchedule[]
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch schedule');
    }
  }
);

// Async thunk for updating shift swap availability on a specific schedule document
export const toggleScheduleSwapAvailability = createAsyncThunk<
  APISchedule, // Return type updated to APISchedule
  { scheduleId: string; isAvailableForSwap: boolean }, 
  { rejectValue: string }
>(
  'employeeSchedule/toggleScheduleSwapAvailability', // Renamed for clarity
  async ({ scheduleId, isAvailableForSwap }, { rejectWithValue }) => {
    try {
      const data = await updateShiftSwapAvailability(scheduleId, isAvailableForSwap); // API returns APISchedule
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to update swap availability');
    }
  }
);
// Note: Toggling swap availability for an individual *shift* within an APISchedule
// would require a different API endpoint and thunk. This thunk updates the schedule-level flag.

const employeeScheduleSlice = createSlice({
  name: 'employeeSchedule',
  initialState,
  reducers: {
    clearScheduleError(state) {
      state.error = null;
      state.updateSwapError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch schedule
      .addCase(fetchEmployeeSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeSchedule.fulfilled, (state, action: PayloadAction<APISchedule[]>) => { // Updated payload type
        state.isLoading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchEmployeeSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch schedule';
      })
      // Toggle schedule swap availability
      .addCase(toggleScheduleSwapAvailability.pending, (state) => { // Updated thunk name
        state.isUpdatingSwapAvailability = true;
        state.updateSwapError = null;
      })
      .addCase(toggleScheduleSwapAvailability.fulfilled, (state, action: PayloadAction<APISchedule>) => { // Updated payload type and thunk name
        state.isUpdatingSwapAvailability = false;
        const index = state.schedules.findIndex((s: APISchedule) => s._id === action.payload._id); // Typed 's'
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      .addCase(toggleScheduleSwapAvailability.rejected, (state, action) => { // Updated thunk name
        state.isUpdatingSwapAvailability = false;
        state.updateSwapError = action.payload ?? 'Failed to update swap availability';
      });
  },
});

export const { clearScheduleError } = employeeScheduleSlice.actions;

export default employeeScheduleSlice.reducer;

// Selectors
export const selectEmployeeSchedules = (state: RootState) => state.employeeSchedule.schedules;
export const selectEmployeeScheduleLoading = (state: RootState) => state.employeeSchedule.isLoading;
export const selectEmployeeScheduleError = (state: RootState) => state.employeeSchedule.error;
export const selectIsUpdatingSwap = (state: RootState) => state.employeeSchedule.isUpdatingSwapAvailability; // Name can remain if it's understood to be schedule-level
export const selectUpdateSwapError = (state: RootState) => state.employeeSchedule.updateSwapError;