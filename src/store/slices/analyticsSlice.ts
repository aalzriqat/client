import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getAdminAnalyticsDashboard, 
    getMyPersonalAnalyticsData,
    // Re-define interfaces here if not globally available or to avoid circular dependency with apiService if it imports from store
} from '../../apiService';
import { RootState } from '../store';

// Interfaces for Analytics Data (matching those in apiService.ts or defined here)
export interface AdminAnalyticsData {
  scheduleAdherence: { totalShifts: number; onTimePercentage: number };
  swapRequestTrends: { totalRequests: number; approvedPercentage: number; averageTimeToApprove: string };
  leaveTrends: { totalRequests: number; commonLeaveTypes: {type: string, count: number}[] };
  scheduleHeatmap: { date: string; intensity: number }[];
}

export interface EmployeePersonalAnalytics {
  shiftsCompleted: number;
  punctualityPercentage: number;
  hoursWorkedThisPeriod: number;
}

export interface AnalyticsState {
  adminDashboardData: AdminAnalyticsData | null;
  isAdminLoading: boolean;
  adminError: string | null;
  
  employeePersonalData: EmployeePersonalAnalytics | null;
  isEmployeeLoading: boolean;
  employeeError: string | null;
}

const initialState: AnalyticsState = {
  adminDashboardData: null,
  isAdminLoading: false,
  adminError: null,
  
  employeePersonalData: null,
  isEmployeeLoading: false,
  employeeError: null,
};

// Async thunk for fetching Admin Analytics Dashboard data
export const fetchAdminAnalyticsThunk = createAsyncThunk<
  AdminAnalyticsData,
  void, // No argument
  { rejectValue: string }
>(
  'analytics/fetchAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAdminAnalyticsDashboard();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch admin analytics');
    }
  }
);

// Async thunk for fetching Employee Personal Analytics data
export const fetchEmployeeAnalyticsThunk = createAsyncThunk<
  EmployeePersonalAnalytics, // Return type
  void,                      // Argument type (void for no argument)
  { rejectValue: string }    // ThunkAPI config
>(
  'analytics/fetchEmployeePersonal',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMyPersonalAnalyticsData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch employee analytics');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAdminAnalyticsError(state) {
      state.adminError = null;
    },
    clearEmployeeAnalyticsError(state) {
      state.employeeError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Admin Analytics
      .addCase(fetchAdminAnalyticsThunk.pending, (state) => {
        state.isAdminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminAnalyticsThunk.fulfilled, (state, action: PayloadAction<AdminAnalyticsData>) => {
        state.isAdminLoading = false;
        state.adminDashboardData = action.payload;
      })
      .addCase(fetchAdminAnalyticsThunk.rejected, (state, action) => {
        state.isAdminLoading = false;
        state.adminError = action.payload ?? 'Failed to load admin analytics';
      })
      // Employee Personal Analytics
      .addCase(fetchEmployeeAnalyticsThunk.pending, (state) => {
        state.isEmployeeLoading = true;
        state.employeeError = null;
      })
      .addCase(fetchEmployeeAnalyticsThunk.fulfilled, (state, action: PayloadAction<EmployeePersonalAnalytics>) => {
        state.isEmployeeLoading = false;
        state.employeePersonalData = action.payload;
      })
      .addCase(fetchEmployeeAnalyticsThunk.rejected, (state, action) => {
        state.isEmployeeLoading = false;
        state.employeeError = action.payload ?? 'Failed to load employee analytics';
      });
  },
});

export const { clearAdminAnalyticsError, clearEmployeeAnalyticsError } = analyticsSlice.actions;

export default analyticsSlice.reducer;

// Selectors
export const selectAdminDashboardData = (state: RootState) => state.analytics.adminDashboardData;
export const selectIsAdminAnalyticsLoading = (state: RootState) => state.analytics.isAdminLoading;
export const selectAdminAnalyticsError = (state: RootState) => state.analytics.adminError;

export const selectEmployeePersonalAnalyticsData = (state: RootState) => state.analytics.employeePersonalData;
export const selectIsEmployeeAnalyticsLoading = (state: RootState) => state.analytics.isEmployeeLoading;
export const selectEmployeeAnalyticsError = (state: RootState) => state.analytics.employeeError;