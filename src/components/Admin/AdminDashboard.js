import React,{useEffect} from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import UploadSchedule from './UploadSchedule';
import AllSchedules from './AllSchedules';
import Sidebar from '../common/Sidebar';
import AllSwapRequests from './AllSwapRequests';
import AllPreferences from './AllPreferences';
import LeaveRequests from './LeaveRequests';
import AdminNewsPage from './AdminNewsPage'; // Import AdminNewsPage
import useLocalStorage from '../hooks/useLocalStorage'; // Import the custom hook

const AdminDashboard = () => {
  const [selectedRoute, setSelectedRoute] = useLocalStorage('selectedRoute', 'upload-schedule');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate(selectedRoute);
    } else {
      setSelectedRoute(location.pathname);
    }
  }, [location, navigate, selectedRoute, setSelectedRoute]);

  return (
    <div className='dashboard'>
      <Sidebar />
      <div className='main-content'>
        <Routes>
          <Route path="upload-schedule" element={<UploadSchedule />} />
          <Route path="swap-request" element={<AllSwapRequests />} />
          <Route path="all-schedules" element={<AllSchedules />} />
          <Route path="all-preferences" element={<AllPreferences />} />
          <Route path="leave-requests" element={<LeaveRequests />} />
          <Route path="BreakingNews-manager" element={<AdminNewsPage />} /> {/* Update route to use AdminNewsPage */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;