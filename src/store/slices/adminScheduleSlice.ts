import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { APISchedule } from '../../apiServiceTypes'; 
import { getAllSchedulesAdmin, uploadScheduleDataAdmin } from '../../apiService'; 
import { RootState } from '../store';

export interface AdminScheduleState {
  allSchedules: APISchedule[]; 
  isLoading: boolean;
  error: string | null;
  isUploading: boolean;
  uploadError: string | null;
  lastUploadSuccess: boolean;
}

const initialState: AdminScheduleState = {
  allSchedules: [],
  isLoading: false,
  error: null,
  isUploading: false,
  uploadError: null,
  lastUploadSuccess: false,
};

export const fetchAllSchedules = createAsyncThunk<
  APISchedule[], 
  void, 
  { rejectValue: string }
>(
  'adminSchedule/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllSchedulesAdmin(); 
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch all schedules');
    }
  }
);

export const uploadScheduleThunk = createAsyncThunk<
  { message: string, newSchedules?: APISchedule[] }, 
  FormData, // Changed from File to FormData
  { rejectValue: string }
>(
  'adminSchedule/upload',
  async (formData, { rejectWithValue }) => { // Changed parameter name for clarity
    try {
      const data = await uploadScheduleDataAdmin(formData); // Pass FormData directly
      return data as { message: string, newSchedules?: APISchedule[] }; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to upload schedule data');
    }
  }
);

const adminScheduleSlice = createSlice({
  name: 'adminSchedule',
  initialState,
  reducers: {
    clearAdminScheduleError(state) {
      state.error = null;
      state.uploadError = null; 
    },
    resetAdminScheduleUploadStatus(state) {
        state.isUploading = false;
        state.uploadError = null;
        state.lastUploadSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSchedules.fulfilled, (state, action: PayloadAction<APISchedule[]>) => { 
        state.isLoading = false;
        state.allSchedules = action.payload;
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch all schedules';
      })
      .addCase(uploadScheduleThunk.pending, (state) => {
        state.isUploading = true;
        state.uploadError = null;
        state.lastUploadSuccess = false;
      })
      .addCase(uploadScheduleThunk.fulfilled, (state, action: PayloadAction<{ message: string, newSchedules?: APISchedule[] }>) => {
        state.isUploading = false;
        state.lastUploadSuccess = true;
        if (action.payload.newSchedules) {
          // state.allSchedules = action.payload.newSchedules; 
        }
      })
      .addCase(uploadScheduleThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadError = action.payload ?? 'Failed to upload schedule';
      });
  },
});

export const { clearAdminScheduleError, resetAdminScheduleUploadStatus } = adminScheduleSlice.actions;

export default adminScheduleSlice.reducer;

// Selectors
export const selectAllSchedulesForAdmin = (state: RootState) => state.adminSchedule.allSchedules;
export const selectAdminScheduleLoading = (state: RootState) => state.adminSchedule.isLoading;
export const selectAdminScheduleError = (state: RootState) => state.adminSchedule.error;
export const selectIsUploadingSchedule = (state: RootState) => state.adminSchedule.isUploading;
export const selectScheduleUploadError = (state: RootState) => state.adminSchedule.uploadError;
export const selectLastScheduleUploadSuccess = (state: RootState) => state.adminSchedule.lastUploadSuccess;