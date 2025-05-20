import React, { useState } from 'react'; // Added useState
import { Routes, Route } from 'react-router-dom';
import styles from './AdminDashboard.module.css'; // Import CSS Module
// TODO: Import a way to get sidebar state, e.g., from a context or global state
// For now, we'll use a local state to simulate this for styling purposes.
// import { useSidebarState } from '../common/Sidebar/SidebarContext'; // Example
import UploadSchedule from './UploadSchedule';
import AllSchedules from './AllSchedules';
import Sidebar from '../common/Sidebar';
import AllSwapRequests from './AllSwapRequests';
import AllPreferences from './AllPreferences';
import LeaveRequests from './LeaveRequests';
import AdminNewsPage from './AdminNewsPage'; // Import AdminNewsPage

const AdminDashboard: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSidebarToggle = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar onToggle={handleSidebarToggle} />
      <div
        className={`
          ${styles.mainContent}
          ${!isSidebarExpanded ? styles.mainContentCollapsed : ''}
        `}
      >
        {/* Example: <h1 className={styles.pageTitle}>Dashboard Overview</h1> */}
        <Routes>
          <Route path="upload-schedule" element={<UploadSchedule />} />
          <Route path="swap-request" element={<AllSwapRequests />} />
          <Route path="all-schedules" element={<AllSchedules />} />
          <Route path="all-preferences" element={<AllPreferences />} />
          <Route path="leave-requests" element={<LeaveRequests />} />
          <Route path="BreakingNews-manager" element={<AdminNewsPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;