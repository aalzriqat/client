import React, { useState, useEffect } from 'react'; // Added useEffect
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload, faExchangeAlt, faCalendarAlt, faTasks,
  faUserClock, faNewspaper, faChartBar, faBars, faCalendarCheck,
  faClipboardList, faUserEdit, faEnvelopeOpenText, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons'; // Added more icons
import { useAppSelector } from '../../store/hooks';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';

interface SidebarProps {
  onToggle?: (isExpanded: boolean) => void; // Callback to inform parent of toggle state
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const userRole = currentUser?.role;

  const toggleSidebar = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (onToggle) {
      onToggle(newExpandedState);
    }
  };
  
  // Effect to call onToggle when component mounts with initial state
  useEffect(() => {
    if (onToggle) {
      onToggle(isExpanded);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount to communicate initial state


  if (!isAuthenticated) {
    return null; // Don't render sidebar if not authenticated
  }

  // iconStyle object removed, styles moved to App.css

  return (
    <section
      id="sidebar"
      className={`${styles.sidebar} ${isExpanded ? styles.sidebarExpanded : styles.sidebarCollapsed}`}
      aria-label="Main sidebar"
    >
      <button
        className={styles.sidebarToggleBtn}
        onClick={toggleSidebar}
        aria-expanded={isExpanded}
        aria-controls="sidebar-menu"
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
      </button>
      <ul className={styles.sidebarMenu} id="sidebar-menu">
        {userRole === 'admin' && (
          <>
            <li><NavLink to="upload-schedule" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faUpload} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>Upload Schedule</span></NavLink></li>
            <li><NavLink to="swap-request" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faExchangeAlt} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>All Swap Requests</span></NavLink></li>
            <li><NavLink to="all-schedules" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faCalendarAlt} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>View All Schedules</span></NavLink></li>
            <li><NavLink to="all-preferences" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faTasks} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>View All Preferences</span></NavLink></li>
            <li><NavLink to="leave-requests" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faUserClock} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>All Leave Requests</span></NavLink></li>
            <li><NavLink to="BreakingNews-manager" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faNewspaper} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>Manage News</span></NavLink></li>
            {/* <li><NavLink to="admin-analytics" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faChartBar} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>Admin Analytics</span></NavLink></li> */}
          </>
        )}
        {userRole === 'employee' && (
          <>
            <li><NavLink to="my-schedule" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faCalendarCheck} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>My Schedule</span></NavLink></li>
            <li><NavLink to="swap-request-form" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faExchangeAlt} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>Request Swap</span></NavLink></li>
            <li><NavLink to="employee-swap-requests" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faClipboardList} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>My Swaps Status</span></NavLink></li>
            <li><NavLink to="preferences" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faUserEdit} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>My Preferences</span></NavLink></li>
            <li><NavLink to="employee-leave-requests" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faEnvelopeOpenText} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>My Leave Requests</span></NavLink></li>
            <li><NavLink to="BreakingNews" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faNewspaper} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>View News</span></NavLink></li>
            {/* <li><NavLink to="my-analytics" className={({isActive}) => isActive ? `${styles.sidebarLink} ${styles.sidebarLinkActive}` : styles.sidebarLink }><FontAwesomeIcon icon={faChartBar} className={styles.sidebarIcon} fixedWidth /><span className={styles.sidebarLinkText}>My Analytics</span></NavLink></li> */}
          </>
        )}
      </ul>
    </section>
  );
};

export default Sidebar;