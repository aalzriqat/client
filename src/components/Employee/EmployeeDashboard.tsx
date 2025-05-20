import React, { useState } from 'react'; // Added useState
import { Routes, Route } from 'react-router-dom';
import styles from './EmployeeDashboard.module.css'; // Import CSS Module
// TODO: Import a way to get sidebar state, e.g., from a context or global state
// For now, we'll use a local state to simulate this for styling purposes.
// import { useSidebarState } from '../common/Sidebar/SidebarContext'; // Example
import Sidebar from '../common/Sidebar';
import SwapRequestForm from './SwapRequestForm';
import SentReceivedSwaps from './SentReceivedSwaps';
import PreferenceForm from './PreferenceForm';
import ManageLeaveRequests from './ManageLeaveRequests';
import NewsListClient from './NewsListClient'; // Import NewsListClient
import EmployeeScheduleView from './EmployeeScheduleView'; // Added import

const EmployeeDashboard: React.FC = () => {
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
        {/* Example: <h1 className={styles.pageTitle}>My Dashboard</h1> */}
        <Routes>
          <Route path="my-schedule" element={<EmployeeScheduleView />} />
          <Route path="swap-request-form" element={<SwapRequestForm />} />
          <Route path="employee-swap-requests" element={<SentReceivedSwaps />} />
          <Route path="preferences" element={<PreferenceForm />} />
          <Route path="employee-leave-requests" element={<ManageLeaveRequests />} />
          <Route path="BreakingNews" element={<NewsListClient />} />
        </Routes>
      </div>
    </div>
  );
};

export default EmployeeDashboard;