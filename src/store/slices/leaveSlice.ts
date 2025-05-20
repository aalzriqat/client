import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { LeaveRequest, LeaveRequestPayload } from '../../apiServiceTypes'; // Updated import path for types
import { getMyLeaveRequests, submitLeaveRequest, cancelLeaveRequestEmployee, getAllLeaveRequests, updateLeaveRequestStatusAdmin } from '../../apiService'; // API function imports remain
import { RootState } from '../store';

export interface LeaveState {
  myLeaveRequests: LeaveRequest[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  isCancelling: boolean;
  cancelError: string | null;
  lastSubmitSuccess: boolean;
  lastCancelSuccess: boolean;

  // For Admin
  allLeaveRequests: LeaveRequest[];
  isLoadingAllLeave: boolean;
  allLeaveError: string | null;
  isUpdatingStatusAdmin: boolean;
  updateStatusAdminError: string | null;
  lastAdminUpdateSuccess: boolean;
}

const initialState: LeaveState = {
  myLeaveRequests: [],
  isLoading: false,
  error: null,
  isSubmitting: false,
  submitError: null,
  isCancelling: false,
  cancelError: null,
  lastSubmitSuccess: false,
  lastCancelSuccess: false,

  // Admin
  allLeaveRequests: [],
  isLoadingAllLeave: false,
  allLeaveError: null,
  isUpdatingStatusAdmin: false,
  updateStatusAdminError: null,
  lastAdminUpdateSuccess: false,
};

// Async thunk for fetching current user's leave requests
export const fetchMyLeaveRequestsThunk = createAsyncThunk<
  LeaveRequest[], // Return type
  void, // No argument needed
  { rejectValue: string }
>(
  'leave/fetchMy',
  async (_, { rejectWithValue }) => { // Changed userId to _
    try {
      const data = await getMyLeaveRequests(); // Call without arguments
      return data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch leave requests';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for submitting a new leave request
export const submitLeaveRequestThunk = createAsyncThunk<
  LeaveRequest, // Return type
  LeaveRequestPayload, // Argument: leave data
  { rejectValue: string }
>(
  'leave/submitNew',
  async (leaveData, { rejectWithValue }) => {
    try {
      const data = await submitLeaveRequest(leaveData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit leave request');
    }
  }
);

// Async thunk for cancelling a leave request
export const cancelLeaveRequestThunk = createAsyncThunk<
  LeaveRequest, // Return type
  string, // Argument: leaveId
  { rejectValue: string }
>(
  'leave/cancelRequest',
  async (leaveId, { rejectWithValue }) => {
    try {
      const data = await cancelLeaveRequestEmployee(leaveId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel leave request');
    }
  }
);

// Async thunk for fetching ALL leave requests (Admin)
export const fetchAllLeaveRequestsAdminThunk = createAsyncThunk<
  LeaveRequest[],
  void, // No argument
  { rejectValue: string }
>(
  'leave/fetchAllAdmin',
  async (_, { rejectWithValue }) => {
    try {
      // getAllLeaveRequests is now directly imported
      const data = await getAllLeaveRequests();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch all leave requests for admin');
    }
  }
);

// Async thunk for Admin updating a leave request status
export const updateLeaveStatusAdminThunk = createAsyncThunk<
  LeaveRequest,
  { leaveId: string; status: 'approved' | 'rejected'; adminNotes?: string },
  { rejectValue: string }
>(
  'leave/updateStatusAdmin',
  async ({ leaveId, status, adminNotes }, { rejectWithValue }) => {
    try {
      // updateLeaveRequestStatusAdmin is now directly imported
      const data = await updateLeaveRequestStatusAdmin(leaveId, status, adminNotes);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update leave status by admin');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    clearLeaveErrors(state) {
      state.error = null;
      state.submitError = null;
      state.cancelError = null;
      state.allLeaveError = null; // Admin error
      state.updateStatusAdminError = null; // Admin error
    },
    resetLeaveStatusFlags(state) {
        state.isSubmitting = false;
        state.submitError = null;
        state.lastSubmitSuccess = false;
        state.isCancelling = false;
        state.cancelError = null;
        state.lastCancelSuccess = false;
        state.isUpdatingStatusAdmin = false; // Admin flag
        state.updateStatusAdminError = null; // Admin error
        state.lastAdminUpdateSuccess = false; // Admin flag
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Leave Requests (Employee)
      .addCase(fetchMyLeaveRequestsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyLeaveRequestsThunk.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
        state.isLoading = false;
        state.myLeaveRequests = action.payload;
      })
      .addCase(fetchMyLeaveRequestsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch my leave requests';
      })
      // Submit New Leave Request (Employee)
      .addCase(submitLeaveRequestThunk.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
        state.lastSubmitSuccess = false;
      })
      .addCase(submitLeaveRequestThunk.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        state.isSubmitting = false;
        state.myLeaveRequests.push(action.payload);
        state.lastSubmitSuccess = true;
      })
      .addCase(submitLeaveRequestThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload ?? 'Failed to submit leave request';
      })
      // Cancel Leave Request (Employee)
      .addCase(cancelLeaveRequestThunk.pending, (state) => {
        state.isCancelling = true;
        state.cancelError = null;
        state.lastCancelSuccess = false;
      })
      .addCase(cancelLeaveRequestThunk.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        state.isCancelling = false;
        state.myLeaveRequests = state.myLeaveRequests.map(req =>
          req._id === action.payload._id ? action.payload : req
        );
        state.lastCancelSuccess = true;
      })
      .addCase(cancelLeaveRequestThunk.rejected, (state, action) => {
        state.isCancelling = false;
        state.cancelError = action.payload ?? 'Failed to cancel leave request';
      })
      // Fetch All Leave Requests (Admin)
      .addCase(fetchAllLeaveRequestsAdminThunk.pending, (state) => {
        state.isLoadingAllLeave = true;
        state.allLeaveError = null;
      })
      .addCase(fetchAllLeaveRequestsAdminThunk.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
        state.isLoadingAllLeave = false;
        state.allLeaveRequests = action.payload;
      })
      .addCase(fetchAllLeaveRequestsAdminThunk.rejected, (state, action) => {
        state.isLoadingAllLeave = false;
        state.allLeaveError = action.payload ?? 'Failed to fetch all leave requests for admin';
      })
      // Update Leave Status (Admin)
      .addCase(updateLeaveStatusAdminThunk.pending, (state) => {
        state.isUpdatingStatusAdmin = true;
        state.updateStatusAdminError = null;
        state.lastAdminUpdateSuccess = false;
      })
      .addCase(updateLeaveStatusAdminThunk.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        state.isUpdatingStatusAdmin = false;
        state.allLeaveRequests = state.allLeaveRequests.map(req =>
          req._id === action.payload._id ? action.payload : req
        );
        // Also update in myLeaveRequests if the admin is also an employee viewing their own modified request
        state.myLeaveRequests = state.myLeaveRequests.map(req =>
            req._id === action.payload._id ? action.payload : req
        );
        state.lastAdminUpdateSuccess = true;
      })
      .addCase(updateLeaveStatusAdminThunk.rejected, (state, action) => {
        state.isUpdatingStatusAdmin = false;
        state.updateStatusAdminError = action.payload ?? 'Failed to update leave status by admin';
      });
  },
});

export const { clearLeaveErrors, resetLeaveStatusFlags } = leaveSlice.actions;

export default leaveSlice.reducer;

// Selectors
export const selectMyLeaveRequests = (state: RootState) => state.leave.myLeaveRequests;
export const selectLeaveIsLoading = (state: RootState) => state.leave.isLoading; // Employee's view loading
export const selectLeaveError = (state: RootState) => state.leave.error; // Employee's view error
export const selectLeaveIsSubmitting = (state: RootState) => state.leave.isSubmitting;
export const selectLeaveSubmitError = (state: RootState) => state.leave.submitError;
export const selectLeaveLastSubmitSuccess = (state: RootState) => state.leave.lastSubmitSuccess;
export const selectLeaveIsCancelling = (state: RootState) => state.leave.isCancelling;
export const selectLeaveCancelError = (state: RootState) => state.leave.cancelError;
export const selectLeaveLastCancelSuccess = (state: RootState) => state.leave.lastCancelSuccess;

// Admin Selectors
export const selectAllLeaveRequestsAdmin = (state: RootState) => state.leave.allLeaveRequests;
export const selectIsLoadingAllLeaveAdmin = (state: RootState) => state.leave.isLoadingAllLeave;
export const selectAllLeaveErrorAdmin = (state: RootState) => state.leave.allLeaveError;
export const selectIsUpdatingLeaveStatusAdmin = (state: RootState) => state.leave.isUpdatingStatusAdmin;
export const selectUpdateLeaveStatusAdminError = (state: RootState) => state.leave.updateStatusAdminError;
export const selectLastAdminLeaveUpdateSuccess = (state: RootState) => state.leave.lastAdminUpdateSuccess;