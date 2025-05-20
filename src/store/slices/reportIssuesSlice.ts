import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { BackendUser } from '../../apiServiceTypes'; // Added for Issue.reportedBy if it becomes BackendUser object
// API functions will be defined in apiService.ts once backend endpoints are ready
// For now, we'll define interfaces and thunk structures.

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: 'bug' | 'feature_request' | 'ui_ux' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string | BackendUser; // User ID or populated BackendUser object
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubmitIssuePayload {
  title: string;
  description: string;
  category: 'bug' | 'feature_request' | 'ui_ux' | 'other';
  // reportedBy will be added by backend from token
}

export interface UpdateIssueStatusPayload {
  issueId: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
}

export interface ReportIssuesState {
  issuesList: Issue[]; // For admin view
  myReportedIssues: Issue[]; // For user's own reported issues
  isLoadingList: boolean;
  listError: string | null;
  isLoadingMyList: boolean;
  myListError: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  lastSubmitSuccess: boolean;
  isUpdatingStatus: boolean; // For admin updating status
  updateStatusError: string | null;
  lastUpdateStatusSuccess: boolean;
}

const initialState: ReportIssuesState = {
  issuesList: [],
  myReportedIssues: [],
  isLoadingList: false,
  listError: null,
  isLoadingMyList: false,
  myListError: null,
  isSubmitting: false,
  submitError: null,
  lastSubmitSuccess: false,
  isUpdatingStatus: false,
  updateStatusError: null,
  lastUpdateStatusSuccess: false,
};

// Placeholder API functions - these would call actual functions in apiService.ts
const submitNewIssueApi = async (payload: SubmitIssuePayload): Promise<Issue> => {
  console.warn("submitNewIssueApi: API endpoint not implemented yet.");
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return { _id: Date.now().toString(), ...payload, reportedBy: 'mockUserId', status: 'open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Issue;
};
const fetchAllIssuesAdminApi = async (): Promise<Issue[]> => {
  console.warn("fetchAllIssuesAdminApi: API endpoint not implemented yet.");
  await new Promise(resolve => setTimeout(resolve, 500));
  return [];
};
const fetchMyIssuesApi = async (userId: string): Promise<Issue[]> => {
  console.warn("fetchMyIssuesApi: API endpoint not implemented yet for userId:", userId);
  await new Promise(resolve => setTimeout(resolve, 500));
  return [];
};
const updateIssueStatusAdminApi = async (payload: UpdateIssueStatusPayload): Promise<Issue> => {
  console.warn("updateIssueStatusAdminApi: API endpoint not implemented yet.");
  await new Promise(resolve => setTimeout(resolve, 500));
  const mockIssue: Partial<Issue> = { _id: payload.issueId, status: payload.status, adminNotes: payload.adminNotes, updatedAt: new Date().toISOString() };
  return mockIssue as Issue; // This would be the full updated issue from backend
};


export const submitNewIssueThunk = createAsyncThunk<Issue, SubmitIssuePayload, { rejectValue: string }>(
  'reportIssues/submitNew', async (payload, { rejectWithValue }) => {
    try { return await submitNewIssueApi(payload); }
    catch (error: any) { return rejectWithValue(error.message || 'Failed to submit issue'); }
  }
);

export const fetchAllIssuesAdminThunk = createAsyncThunk<Issue[], void, { rejectValue: string }>(
  'reportIssues/fetchAllAdmin', async (_, { rejectWithValue }) => {
    try { return await fetchAllIssuesAdminApi(); }
    catch (error: any) { return rejectWithValue(error.message || 'Failed to fetch issues for admin'); }
  }
);

export const fetchMyIssuesThunk = createAsyncThunk<Issue[], string, { rejectValue: string }>(
  'reportIssues/fetchMy', async (userId, { rejectWithValue }) => {
    try { return await fetchMyIssuesApi(userId); }
    catch (error: any) { return rejectWithValue(error.message || 'Failed to fetch my issues'); }
  }
);

export const updateIssueStatusAdminThunk = createAsyncThunk<Issue, UpdateIssueStatusPayload, { rejectValue: string }>(
  'reportIssues/updateStatusAdmin', async (payload, { rejectWithValue }) => {
    try { return await updateIssueStatusAdminApi(payload); }
    catch (error: any) { return rejectWithValue(error.message || 'Failed to update issue status'); }
  }
);

const reportIssuesSlice = createSlice({
  name: 'reportIssues',
  initialState,
  reducers: {
    clearReportIssuesErrors(state) {
      state.listError = null;
      state.myListError = null;
      state.submitError = null;
      state.updateStatusError = null;
    },
    resetSubmitStatus(state) {
      state.isSubmitting = false;
      state.submitError = null;
      state.lastSubmitSuccess = false;
    },
    resetUpdateStatusAdminStatus(state) {
        state.isUpdatingStatus = false;
        state.updateStatusError = null;
        state.lastUpdateStatusSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit New Issue
      .addCase(submitNewIssueThunk.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
        state.lastSubmitSuccess = false;
      })
      .addCase(submitNewIssueThunk.fulfilled, (state, action: PayloadAction<Issue>) => {
        state.isSubmitting = false;
        state.lastSubmitSuccess = true;
        state.myReportedIssues.unshift(action.payload); // Add to user's list
        // Optionally add to admin list if admin is submitting, or re-fetch admin list
      })
      .addCase(submitNewIssueThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload ?? 'Failed to submit issue.';
      })
      // Fetch All Issues (Admin)
      .addCase(fetchAllIssuesAdminThunk.pending, (state) => {
        state.isLoadingList = true;
        state.listError = null;
      })
      .addCase(fetchAllIssuesAdminThunk.fulfilled, (state, action: PayloadAction<Issue[]>) => {
        state.isLoadingList = false;
        state.issuesList = action.payload;
      })
      .addCase(fetchAllIssuesAdminThunk.rejected, (state, action) => {
        state.isLoadingList = false;
        state.listError = action.payload ?? 'Failed to fetch admin issues.';
      })
      // Fetch My Issues (User)
      .addCase(fetchMyIssuesThunk.pending, (state) => {
        state.isLoadingMyList = true;
        state.myListError = null;
      })
      .addCase(fetchMyIssuesThunk.fulfilled, (state, action: PayloadAction<Issue[]>) => {
        state.isLoadingMyList = false;
        state.myReportedIssues = action.payload;
      })
      .addCase(fetchMyIssuesThunk.rejected, (state, action) => {
        state.isLoadingMyList = false;
        state.myListError = action.payload ?? 'Failed to fetch my issues.';
      })
      // Update Issue Status (Admin)
      .addCase(updateIssueStatusAdminThunk.pending, (state) => {
        state.isUpdatingStatus = true;
        state.updateStatusError = null;
        state.lastUpdateStatusSuccess = false;
      })
      .addCase(updateIssueStatusAdminThunk.fulfilled, (state, action: PayloadAction<Issue>) => {
        state.isUpdatingStatus = false;
        state.lastUpdateStatusSuccess = true;
        state.issuesList = state.issuesList.map(issue => issue._id === action.payload._id ? action.payload : issue);
        state.myReportedIssues = state.myReportedIssues.map(issue => issue._id === action.payload._id ? action.payload : issue);
      })
      .addCase(updateIssueStatusAdminThunk.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.updateStatusError = action.payload ?? 'Failed to update issue status.';
      });
  },
});

export const { clearReportIssuesErrors, resetSubmitStatus, resetUpdateStatusAdminStatus } = reportIssuesSlice.actions;

export default reportIssuesSlice.reducer;

// Selectors
export const selectAllAdminIssues = (state: RootState) => state.reportIssues.issuesList;
export const selectIsLoadingAdminIssues = (state: RootState) => state.reportIssues.isLoadingList;
export const selectAdminIssuesError = (state: RootState) => state.reportIssues.listError;

export const selectMyReportedIssues = (state: RootState) => state.reportIssues.myReportedIssues;
export const selectIsLoadingMyIssues = (state: RootState) => state.reportIssues.isLoadingMyList;
export const selectMyIssuesError = (state: RootState) => state.reportIssues.myListError;

export const selectIsSubmittingIssue = (state: RootState) => state.reportIssues.isSubmitting;
export const selectSubmitIssueError = (state: RootState) => state.reportIssues.submitError;
export const selectLastIssueSubmitSuccess = (state: RootState) => state.reportIssues.lastSubmitSuccess;

export const selectIsUpdatingIssueStatus = (state: RootState) => state.reportIssues.isUpdatingStatus;
export const selectUpdateIssueStatusError = (state: RootState) => state.reportIssues.updateStatusError;
export const selectLastIssueStatusUpdateSuccess = (state: RootState) => state.reportIssues.lastUpdateStatusSuccess;