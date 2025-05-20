import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Notification } from '../../apiServiceTypes'; 
import { 
    getNotificationsApi,
    markNotificationsReadApi,
    deleteNotificationApi,
    deleteAllMyNotificationsApi 
} from '../../apiService'; 
import { RootState } from '../store';

export interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number; 
  isUpdating: boolean; 
  updateError: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
  isUpdating: false,
  updateError: null,
};

export const fetchNotificationsThunk = createAsyncThunk<
  Notification[], 
  void, 
  { rejectValue: string }
>(
  'notifications/fetchByUser',
  async (_, { rejectWithValue }) => { 
    try {
      const data = await getNotificationsApi(); 
      return data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch notifications';
      return rejectWithValue(errorMessage);
    }
  }
);

export const markNotificationsReadThunk = createAsyncThunk<
  { updatedCount: number, notificationIds: string[] }, 
  string[], 
  { rejectValue: string }
>(
  'notifications/markAsRead',
  async (notificationIds, { rejectWithValue }) => {
    try {
      const data = await markNotificationsReadApi(notificationIds);
      return { ...data, notificationIds }; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to mark notifications as read');
    }
  }
);

export const deleteNotificationThunk = createAsyncThunk<
  { message: string; deletedNotificationId?: string }, // Corrected return type to match apiService
  string, 
  { rejectValue: string }
>(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const data = await deleteNotificationApi(notificationId);
      return data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete notification');
    }
  }
);

export const deleteAllMyNotificationsThunk = createAsyncThunk< // Corrected syntax starts here
  { message: string; deletedCount: number }, // Returned type
  void,                                     // ThunkArg (argument to the payload creator)
  { rejectValue: string }                   // ThunkApiConfig
>(                                          // Corrected syntax ends here
  'notifications/deleteAllMyNotifications', // typePrefix
  async (_, { rejectWithValue }) => {         // payloadCreator
    try {
      const data = await deleteAllMyNotificationsApi();
      return data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete all notifications');
    }
  }
);


const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError(state) {
      state.error = null;
      state.updateError = null;
    },
    addNotification(state, action: PayloadAction<Notification>) { 
        state.notifications.unshift(action.payload); 
        if (!action.payload.isRead) {
            state.unreadCount += 1;
        }
    },
    updateNotification(state, action: PayloadAction<Notification>) { 
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
            const oldReadStatus = state.notifications[index].isRead;
            state.notifications[index] = action.payload;
            if (oldReadStatus && !action.payload.isRead) state.unreadCount++;
            else if (!oldReadStatus && action.payload.isRead) state.unreadCount = Math.max(0, state.unreadCount -1);
        }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch notifications';
        state.notifications = []; 
        state.unreadCount = 0;
      })
      .addCase(markNotificationsReadThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(markNotificationsReadThunk.fulfilled, (state, action: PayloadAction<{ updatedCount: number, notificationIds: string[] }>) => {
        state.isUpdating = false;
        action.payload.notificationIds.forEach(id => {
            const notification = state.notifications.find(n => n._id === id);
            if (notification && !notification.isRead) {
                notification.isRead = true;
            }
        });
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      })
      .addCase(markNotificationsReadThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload ?? 'Failed to mark notifications as read';
      })
      .addCase(deleteNotificationThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(deleteNotificationThunk.fulfilled, (state, action: PayloadAction<{ message: string; deletedNotificationId?: string }>) => {
        state.isUpdating = false;
        if (action.payload.deletedNotificationId) {
            const deletedId = action.payload.deletedNotificationId;
            const index = state.notifications.findIndex(n => n._id === deletedId);
            if (index !== -1) {
                if (!state.notifications[index].isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications.splice(index, 1);
            }
        }
      })
      .addCase(deleteNotificationThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload ?? 'Failed to delete notification';
      })
      .addCase(deleteAllMyNotificationsThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(deleteAllMyNotificationsThunk.fulfilled, (state, action: PayloadAction<{ message: string; deletedCount: number }>) => {
        state.isUpdating = false;
        state.notifications = [];
        state.unreadCount = 0;
      })
      .addCase(deleteAllMyNotificationsThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload ?? 'Failed to delete all notifications';
      });
  },
});

export const { clearNotificationError, addNotification, updateNotification } = notificationSlice.actions;

export default notificationSlice.reducer;

// Selectors
export const selectAllNotifications = (state: RootState) => state.notifications.notifications;
export const selectUnreadNotificationCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: RootState) => state.notifications.isLoading;
export const selectNotificationsError = (state: RootState) => state.notifications.error;
export const selectIsUpdatingNotifications = (state: RootState) => state.notifications.isUpdating;
export const selectNotificationUpdateError = (state: RootState) => state.notifications.updateError;