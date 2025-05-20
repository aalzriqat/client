import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAdminAnalyticsThunk,
  selectAdminDashboardData,
  selectIsAdminAnalyticsLoading,
  selectAdminAnalyticsError,
  clearAdminAnalyticsError,
} from '../../store/slices/analyticsSlice';
import LoadingMessage from '../common/LoadingMessage';
import ErrorMessage from '../common/ErrorMessage';
import styles from './AdminAnalyticsDashboard.module.css'; // Import CSS Module

const AdminAnalyticsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const adminData = useAppSelector(selectAdminDashboardData);
  const isLoading = useAppSelector(selectIsAdminAnalyticsLoading);
  const error = useAppSelector(selectAdminAnalyticsError);

  useEffect(() => {
    dispatch(fetchAdminAnalyticsThunk());
    return () => {
      dispatch(clearAdminAnalyticsError());
    };
  }, [dispatch]);

  if (isLoading) {
    return <LoadingMessage message="Loading admin analytics dashboard..." />;
  }

  if (error) {
    return <ErrorMessage className={styles.note} message={`Error fetching admin analytics: ${error}`} />;
  }

  if (!adminData) {
    return <p className={styles.note}>No admin analytics data available.</p>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.pageTitle}>Admin Analytics Dashboard</h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Schedule Adherence</h3>
        <p className={styles.dataPoint}><strong>Total Shifts:</strong> {adminData.scheduleAdherence.totalShifts}</p>
        <p className={styles.dataPoint}><strong>On-Time Percentage:</strong> {adminData.scheduleAdherence.onTimePercentage}%</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Swap Request Trends</h3>
        <p className={styles.dataPoint}><strong>Total Requests:</strong> {adminData.swapRequestTrends.totalRequests}</p>
        <p className={styles.dataPoint}><strong>Approved Percentage:</strong> {adminData.swapRequestTrends.approvedPercentage}%</p>
        <p className={styles.dataPoint}><strong>Average Time to Approve:</strong> {adminData.swapRequestTrends.averageTimeToApprove}</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Leave Trends</h3>
        <p className={styles.dataPoint}><strong>Total Requests:</strong> {adminData.leaveTrends.totalRequests}</p>
        <p className={styles.dataPoint}><strong>Common Leave Types:</strong></p>
        <ul className={styles.list}>
          {adminData.leaveTrends.commonLeaveTypes.map(lt => (
            <li key={lt.type} className={styles.listItem}>{lt.type}: {lt.count}</li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Schedule Heatmap (Intensity)</h3>
        {/* A proper heatmap would require a charting library or custom SVG rendering.
            This is a simplified textual representation. */}
        <ul className={styles.list}>
          {adminData.scheduleHeatmap.map(hm => (
            <li key={hm.date} className={styles.listItem}>{hm.date}: {hm.intensity}</li>
          ))}
        </ul>
        <p className={styles.note}><small>(Note: Heatmap data is currently mocked in apiService.ts)</small></p>
      </div>
      <p className={styles.note}><small>(All analytics data is currently mocked in apiService.ts and needs backend implementation.)</small></p>
    </div>
  );
};

export default AdminAnalyticsDashboard;