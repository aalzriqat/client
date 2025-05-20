import React, { useEffect, useState, FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
    selectCurrentUser, 
    updateUserProfileThunk, 
    selectIsUpdatingProfile, 
    selectProfileUpdateError, 
    resetProfileUpdateStatus, 
    selectLastProfileUpdateSuccess 
} from '../../store/slices/authSlice';
import { 
    fetchNotificationsThunk, 
    selectAllNotifications, 
    selectUnreadNotificationCount, 
    selectNotificationsLoading, 
    selectNotificationsError,
    markNotificationsReadThunk,
    deleteNotificationThunk,
    deleteAllMyNotificationsThunk,
    selectIsUpdatingNotifications,
    selectNotificationUpdateError,
    clearNotificationError
} from '../../store/slices/notificationSlice';
import { Notification as NotificationType, UpdateProfilePayload, BackendUser } from '../../apiServiceTypes';
import LoadingMessage from '../common/LoadingMessage';
import ErrorMessage from '../common/ErrorMessage';
// import styles from './MyAccountPage.module.css'; 

// Define a local state type for the form that allows empty strings for selects
interface ProfileFormState {
    username: string;
    email: string;
    name?: string;
    skill: BackendUser['skill'] | ""; // Allow "" for "Select..." option
    marketPlace: BackendUser['marketPlace'] | ""; // Allow "" for "Select..." option
    currentPassword?: string;
    newPassword?: string;
}

const MyAccountPage: React.FC = () => {
    const dispatch = useAppDispatch();
    
    const currentUser = useAppSelector(selectCurrentUser);
    const isUpdatingProfile = useAppSelector(selectIsUpdatingProfile);
    const profileUpdateError = useAppSelector(selectProfileUpdateError);
    const profileUpdateSuccess = useAppSelector(selectLastProfileUpdateSuccess);

    const notifications = useAppSelector(selectAllNotifications);
    const unreadCount = useAppSelector(selectUnreadNotificationCount);
    const isLoadingNotifications = useAppSelector(selectNotificationsLoading);
    const notificationsError = useAppSelector(selectNotificationsError);
    const isUpdatingNotifications = useAppSelector(selectIsUpdatingNotifications);
    const notificationUpdateError = useAppSelector(selectNotificationUpdateError);

    const [profileData, setProfileData] = useState<ProfileFormState>({
        username: currentUser?.username || '',
        email: currentUser?.email || '',
        name: currentUser?.name || '',
        skill: currentUser?.skill || "", // Initialize with "" if not present for form
        marketPlace: currentUser?.marketPlace || "", // Initialize with "" if not present for form
        currentPassword: '',
        newPassword: '',
    });
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    useEffect(() => {
        dispatch(fetchNotificationsThunk());
        if (currentUser) {
            setProfileData({ // Reset form data when currentUser changes
                username: currentUser.username,
                email: currentUser.email,
                name: currentUser.name || '',
                skill: currentUser.skill || "",
                marketPlace: currentUser.marketPlace || "",
                currentPassword: '', // Clear password fields
                newPassword: ''
            });
        }
        return () => {
            dispatch(clearNotificationError());
            dispatch(resetProfileUpdateStatus());
        }
    }, [dispatch, currentUser]); // currentUser is the dependency to re-initialize form

    const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ 
            ...prev, 
            [name]: value 
        } as ProfileFormState )); // Cast to ProfileFormState
    };

    const handleProfileSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const payload: UpdateProfilePayload = {
            name: profileData.name || undefined, // Ensure undefined if empty
            username: profileData.username, 
            email: profileData.email,
            skill: profileData.skill === "" ? undefined : profileData.skill, 
            marketPlace: profileData.marketPlace === "" ? undefined : profileData.marketPlace, 
        };
        if (showPasswordFields && profileData.currentPassword && profileData.newPassword) {
            payload.currentPassword = profileData.currentPassword;
            payload.newPassword = profileData.newPassword;
        } else { // Ensure these are not sent if password fields are hidden or empty
            delete payload.currentPassword;
            delete payload.newPassword;
        }
        dispatch(updateUserProfileThunk(payload));
    };

    const handleMarkAsRead = (notificationId: string) => {
        dispatch(markNotificationsReadThunk([notificationId]));
    };

    const handleMarkAllAsRead = () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
        if (unreadIds.length > 0) {
            dispatch(markNotificationsReadThunk(unreadIds));
        }
    };

    const handleDeleteNotification = (notificationId: string) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            dispatch(deleteNotificationThunk(notificationId));
        }
    };

    const handleDeleteAllNotifications = () => {
        if (window.confirm('Are you sure you want to delete ALL your notifications? This cannot be undone.')) {
            dispatch(deleteAllMyNotificationsThunk());
        }
    };
    
    // These are for populating the dropdowns, excluding undefined for the actual options
    const availableSkillsForSelect = ["phoneOnly", "Email", "PhoneMU", "MuOnly", "Specialty", "General", "Other"] as const;
    const availableMarketPlacesForSelect = ["AE", "SA", "EG", "UK", "Specialty"] as const;

    return (
        <div className="my-account-page" style={{ padding: '20px' }}> 
            <h1>My Account</h1>

            <section className="profile-section" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc' }}>
                <h2>My Profile</h2>
                {profileUpdateError && <ErrorMessage message={`Profile Update Failed: ${profileUpdateError}`} />}
                {profileUpdateSuccess && <p style={{color: 'green'}}>Profile updated successfully!</p>}
                <form onSubmit={handleProfileSubmit}>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" value={profileData.username} onChange={handleProfileInputChange} required />
                    </div>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" value={profileData.email} onChange={handleProfileInputChange} required />
                    </div>
                    <div>
                        <label htmlFor="name">Full Name (Optional):</label>
                        <input type="text" id="name" name="name" value={profileData.name || ''} onChange={handleProfileInputChange} />
                    </div>
                    <div>
                        <label htmlFor="skill">Skill:</label>
                        <select name="skill" id="skill" value={profileData.skill} onChange={handleProfileInputChange}>
                            <option value="">Select Skill</option>
                            {availableSkillsForSelect.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="marketPlace">Market/OU:</label>
                        <select name="marketPlace" id="marketPlace" value={profileData.marketPlace} onChange={handleProfileInputChange}>
                            <option value="">Select Market/OU</option>
                            {availableMarketPlacesForSelect.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    
                    <button type="button" onClick={() => setShowPasswordFields(!showPasswordFields)} style={{margin: '10px 0'}}>
                        {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                    </button>

                    {showPasswordFields && (
                        <>
                            <div>
                                <label htmlFor="currentPassword">Current Password:</label>
                                <input type="password" id="currentPassword" name="currentPassword" value={profileData.currentPassword || ''} onChange={handleProfileInputChange} required={showPasswordFields} />
                            </div>
                            <div>
                                <label htmlFor="newPassword">New Password:</label>
                                <input type="password" id="newPassword" name="newPassword" value={profileData.newPassword || ''} onChange={handleProfileInputChange} required={showPasswordFields} />
                            </div>
                        </>
                    )}
                    <button type="submit" disabled={isUpdatingProfile} style={{marginTop: '10px'}}>
                        {isUpdatingProfile ? 'Updating Profile...' : 'Save Profile Changes'}
                    </button>
                </form>
            </section>

            <section className="notifications-section" style={{ padding: '20px', border: '1px solid #ccc' }}>
                <h2>Notifications ({unreadCount} unread)</h2>
                {isLoadingNotifications && <LoadingMessage message="Loading notifications..." />}
                {notificationsError && <ErrorMessage message={`Error loading notifications: ${notificationsError}`} />}
                {notificationUpdateError && <ErrorMessage message={`Error updating notifications: ${notificationUpdateError}`} />}

                {notifications.length > 0 && (
                    <div style={{marginBottom: '10px'}}>
                        <button onClick={handleMarkAllAsRead} disabled={isUpdatingNotifications || unreadCount === 0}>Mark All as Read</button>
                        <button onClick={handleDeleteAllNotifications} disabled={isUpdatingNotifications} style={{marginLeft: '10px'}}>Delete All Notifications</button>
                    </div>
                )}

                {notifications.length === 0 && !isLoadingNotifications && <p>No notifications.</p>}
                
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {notifications.map((notification: NotificationType) => (
                        <li key={notification._id} style={{ borderBottom: '1px solid #eee', padding: '10px', backgroundColor: notification.isRead ? '#f9f9f9' : '#eef' }}>
                            <p><strong>{notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> ({new Date(notification.createdAt).toLocaleString()})</p>
                            <p>{notification.message}</p>
                            {!notification.isRead && (
                                <button onClick={() => handleMarkAsRead(notification._id)} disabled={isUpdatingNotifications} style={{marginRight: '5px'}}>Mark as Read</button>
                            )}
                            <button onClick={() => handleDeleteNotification(notification._id)} disabled={isUpdatingNotifications}>Delete</button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default MyAccountPage;