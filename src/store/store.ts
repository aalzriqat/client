import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeScheduleReducer from './slices/employeeScheduleSlice';
import swapReducer from './slices/swapSlice';
import adminScheduleReducer from './slices/adminScheduleSlice';
import preferenceReducer from './slices/preferenceSlice';
import leaveReducer from './slices/leaveSlice';
import newsReducer from './slices/newsSlice';
import notificationReducer from './slices/notificationSlice';
import analyticsReducer from './slices/analyticsSlice';
import reportIssuesReducer from './slices/reportIssuesSlice';
import uiReducer from './slices/uiSlice'; // Added import
// Import other reducers here as they are created
// e.g., import scheduleReducer from './slices/scheduleSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employeeSchedule: employeeScheduleReducer,
    swap: swapReducer,
    adminSchedule: adminScheduleReducer,
    preferences: preferenceReducer,
    leave: leaveReducer,
    news: newsReducer,
    notifications: notificationReducer,
    analytics: analyticsReducer,
    reportIssues: reportIssuesReducer,
    ui: uiReducer, // Added reducer
    // Add other reducers here:
    // etc.
  },
  // Middleware can be added here if needed, Redux Toolkit includes thunk by default
  // devTools: process.env.NODE_ENV !== 'production', // Enable DevTools in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, ..., ui: UIState, ...}
export type AppDispatch = typeof store.dispatch;

export default store;