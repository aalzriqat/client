import React, { Fragment, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; 
import styles from './Navbar.module.css';
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
} from "../../store/slices/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faBell, faSignOutAlt, faUsersCog, faExchangeAlt, faUserCircle, faTools } from "@fortawesome/free-solid-svg-icons"; // Added faTools
import ClientReportForm from "../ReportIssues/ReportIssuesForm";
import ThemeSelector from "./ThemeSelector/ThemeSelector"; 

import { fetchNotificationsThunk, selectUnreadNotificationCount } from "../../store/slices/notificationSlice";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); 

  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false); 
  const [showReportIssueForm, setShowReportIssueForm] = useState(false); 

  useEffect(() => {
    if (isAuthenticated && currentUser?._id) {
      dispatch(fetchNotificationsThunk()); 
    }
  }, [dispatch, isAuthenticated, currentUser?._id]); 

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login'); 
  };

  const handleNotificationsClick = () => {
    navigate('/employee/notifications'); 
  };

  const toggleReportIssueForm = () => {
    setShowReportIssueForm(!showReportIssueForm);
  };
  
  const unreadNotifications = useAppSelector(selectUnreadNotificationCount);

  return (
    <nav className={styles.navbar}>
      <Link
        className={styles.logoLink}
        to={isAuthenticated ? (currentUser?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard') : "/"}
      >
        Scheduler App
      </Link>

      <div className={styles.navItemsContainer}>
        {currentUser && <span className={styles.username}>Hello, {currentUser.username}!</span>}
        
        <ThemeSelector /> 

        <ul className={styles.navLinks}>
          {isAuthenticated && currentUser?.role === "employee" && (
            <>
              <li>
                <NavLink
                  to="/employee/my-account" 
                  className={({isActive}) => isActive ? `${styles.navLinkItem} ${styles.active}` : styles.navLinkItem}
                  title="My Account"
                >
                  <FontAwesomeIcon icon={faUserCircle} className={styles.icon} />
                  My Account
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/employee/suggestions"
                  className={({isActive}) => isActive ? `${styles.navLinkItem} ${styles.active}` : styles.navLinkItem}
                  title="Suggested Swaps"
                >
                  <FontAwesomeIcon icon={faExchangeAlt} className={styles.icon} />
                  Suggested Swaps
                </NavLink>
              </li>
              <li>
                <NavLink // Added link for Dev Actions
                  to="/employee/dev-actions"
                  className={({isActive}) => isActive ? `${styles.navLinkItem} ${styles.active}` : styles.navLinkItem}
                  title="Developer Actions"
                >
                  <FontAwesomeIcon icon={faTools} className={styles.icon} />
                  Dev Actions
                </NavLink>
              </li>
              <li>
                <button onClick={toggleReportIssueForm} className={styles.navActionItem} title="Report an issue">
                  <FontAwesomeIcon icon={faExclamationCircle} className={styles.icon} />
                  <span className="u-sr-only">Report an issue</span> 
                </button>
                {showReportIssueForm && (
                  <div className={styles.popupForm}>
                    <ClientReportForm />
                  </div>
                )}
              </li>
              <li className={styles.notifications} onClick={handleNotificationsClick}>
                <button className={styles.navActionItem} title="Notifications">
                  <FontAwesomeIcon icon={faBell} className={styles.icon} />
                  <span className="u-sr-only">Notifications</span>
                  {unreadNotifications > 0 && (
                    <span className={styles.notificationCount}>
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </li>
            </>
          )}
           {isAuthenticated && currentUser?.role === "admin" && (
             <li>
                <NavLink
                  to="/admin/dashboard" 
                  className={({isActive}) => isActive ? `${styles.navLinkItem} ${styles.active}` : styles.navLinkItem}
                  title="Admin Dashboard"
                >
                  <FontAwesomeIcon icon={faUsersCog} className={styles.icon} />
                  Admin
                </NavLink>
              </li>
           )}
          <li>
            {isAuthenticated ? (
              <button onClick={handleLogout} className={styles.navActionItem}>
                Logout
                <FontAwesomeIcon icon={faSignOutAlt} className={`${styles.icon} ${styles.logoutIcon}`} />
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({isActive}) => isActive ? `${styles.navLinkItem} ${styles.active}` : styles.navLinkItem}
              >
                Login
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
