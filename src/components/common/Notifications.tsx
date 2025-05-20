import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchNotificationsThunk,
  selectAllNotifications,
  selectUnreadNotificationCount,
  selectNotificationsLoading,
  selectNotificationsError,
  clearNotificationError,
  // markAsRead, // If implementing mark as read action
} from '../../store/slices/notificationSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { Notification as NotificationType } from '../../apiServiceTypes'; // Updated import path

// Inline styles object removed, classes will be used from App.css

const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const notifications = useAppSelector(selectAllNotifications);
  const unreadCount = useAppSelector(selectUnreadNotificationCount); // Can be used for a badge
  const isLoading = useAppSelector(selectNotificationsLoading);
  const error = useAppSelector(selectNotificationsError);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchNotificationsThunk()); // Removed argument
    }
    return () => {
      dispatch(clearNotificationError());
    };
  }, [dispatch, currentUser?._id]);

  // const handleMarkAsRead = (notificationId: string) => {
  //   // dispatch(markNotificationAsReadThunk(notificationId)); // If using API
  //   // dispatch(markAsRead(notificationId)); // If handling locally or after API success
  // };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short'});
  };

  if (isLoading && notifications.length === 0) {
    return <div className="notifications-loading-message">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notifications-error-message">Error fetching notifications: {error}</div>;
  }

  return (
    <div className="notifications-container">
      <h3>Notifications ({unreadCount} unread)</h3>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul>
          {notifications.map((notif: NotificationType) => (
            <li
              key={notif._id}
              className={`notifications-item ${!notif.isRead ? 'notifications-item-unread' : ''}`}
              // onClick={() => !notif.isRead && handleMarkAsRead(notif._id)} // Example: mark as read on click
            >
              <p>{notif.message}</p>
              <small>{formatDate(notif.createdAt)} - Type: {notif.type}</small>
              {/* Optionally, link to relatedEntity if present */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;