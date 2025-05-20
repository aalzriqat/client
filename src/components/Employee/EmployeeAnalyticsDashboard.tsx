import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchEmployeeAnalyticsThunk,
  selectEmployeePersonalAnalyticsData,
  selectIsEmployeeAnalyticsLoading,
  selectEmployeeAnalyticsError,
  clearEmployeeAnalyticsError,
} from '../../store/slices/analyticsSlice';
import { selectCurrentUser } from '../../store/slices/authSlice'; // To ensure user context if API needs it implicitly
import LoadingMessage from '../common/LoadingMessage';
import ErrorMessage from '../common/ErrorMessage';
import styles from './EmployeeAnalyticsDashboard.module.css'; // Import CSS Module

const EmployeeAnalyticsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const employeeData = useAppSelector(selectEmployeePersonalAnalyticsData);
  const isLoading = useAppSelector(selectIsEmployeeAnalyticsLoading);
  const error = useAppSelector(selectEmployeeAnalyticsError);
  const currentUser = useAppSelector(selectCurrentUser); // In case API needs user context

  useEffect(() => {
    // The thunk currently takes no arguments, assuming API infers user from token
    // If API required userId, it would be: dispatch(fetchEmployeeAnalyticsThunk(currentUser._id));
    if (currentUser?._id) { // Fetch only if user is identified
        dispatch(fetchEmployeeAnalyticsThunk());
    }
    return () => {
      dispatch(clearEmployeeAnalyticsError());
    };
  }, [dispatch, currentUser?._id]);

  if (isLoading) {
    return <LoadingMessage message="Loading your personal analytics..." />;
  }

  if (error) {
    return <ErrorMessage className={styles.note} message={`Error fetching your analytics: ${error}`} />;
  }

  if (!employeeData) {
    return <p className={styles.note}>No personal analytics data available at the moment.</p>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.pageTitle}>My Personal Analytics</h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Performance Overview</h3>
        <p className={styles.dataPoint}><strong>Shifts Completed:</strong> {employeeData.shiftsCompleted}</p>
        <p className={styles.dataPoint}><strong>Punctuality:</strong> {employeeData.punctualityPercentage}%</p>
        <p className={styles.dataPoint}><strong>Hours Worked (Current Period):</strong> {employeeData.hoursWorkedThisPeriod}</p>
      </div>
      
      <p className={styles.note}><small>(Note: Personal analytics data is currently mocked in apiService.ts and needs backend implementation.)</small></p>
    </div>
  );
};

export default EmployeeAnalyticsDashboard;