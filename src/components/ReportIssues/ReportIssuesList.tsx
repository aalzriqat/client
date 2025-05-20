import React, { useEffect, useState, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMyIssuesThunk,
  fetchAllIssuesAdminThunk,
  updateIssueStatusAdminThunk,
  selectMyReportedIssues,
  selectAllAdminIssues,
  selectIsLoadingMyIssues,
  selectIsLoadingAdminIssues,
  selectMyIssuesError,
  selectAdminIssuesError,
  selectIsUpdatingIssueStatus,
  // selectUpdateIssueStatusError, // For specific error display
  resetUpdateStatusAdminStatus,
  clearReportIssuesErrors,
  Issue as IssueType, // Renamed to avoid conflict
  UpdateIssueStatusPayload
} from '../../store/slices/reportIssuesSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import LoadingMessage from '../common/LoadingMessage';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button/Button'; // Import Button component
import styles from './ReportIssuesList.module.css'; // Import CSS Module

const ReportIssuesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  
  const myIssues = useAppSelector(selectMyReportedIssues);
  const isLoadingMyIssues = useAppSelector(selectIsLoadingMyIssues);
  const myIssuesError = useAppSelector(selectMyIssuesError);

  const allAdminIssues = useAppSelector(selectAllAdminIssues);
  const isLoadingAdminIssues = useAppSelector(selectIsLoadingAdminIssues);
  const adminIssuesError = useAppSelector(selectAdminIssuesError);

  const isUpdatingStatus = useAppSelector(selectIsUpdatingIssueStatus);
  // const updateStatusError = useAppSelector(selectUpdateIssueStatusError); // For specific update errors

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  // For admin to change status of a specific issue
  const [selectedStatus, setSelectedStatus] = useState<Record<string, IssueType['status']>>({});


  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAllIssuesAdminThunk());
    } else if (currentUser?._id) {
      dispatch(fetchMyIssuesThunk(currentUser._id));
    }
    return () => {
        dispatch(clearReportIssuesErrors());
        dispatch(resetUpdateStatusAdminStatus());
    }
  }, [dispatch, isAdmin, currentUser?._id]);

  const handleStatusChange = (issueId: string, event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(prev => ({ ...prev, [issueId]: event.target.value as IssueType['status'] }));
  };

  const handleUpdateStatus = async (issueId: string) => {
    const newStatus = selectedStatus[issueId];
    if (!newStatus) {
      setActionMessage("Please select a new status.");
      return;
    }
    setActionMessage(null);
    try {
      await dispatch(updateIssueStatusAdminThunk({ issueId, status: newStatus })).unwrap();
      setActionMessage(`Status for issue ${issueId} updated successfully.`);
      // Optionally re-fetch or rely on slice update
      if (isAdmin) dispatch(fetchAllIssuesAdminThunk());
    } catch (err: any) {
      setActionMessage(`Failed to update status for issue ${issueId}: ${err.message || 'Unknown error'}`);
    }
  };
  
  const formatDate = (dateString?: string): string => { // Make dateString optional
    if (!dateString) return 'N/A'; // Handle undefined or empty string
    return new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short'});
  };

  const issuesToDisplay = isAdmin ? allAdminIssues : myIssues;
  const isLoading = isAdmin ? isLoadingAdminIssues : isLoadingMyIssues;
  const error = isAdmin ? adminIssuesError : myIssuesError;

  if (isLoading) {
    // Use a class for loading message if specific styling is needed beyond a simple p tag
    return <LoadingMessage message="Loading issues..." />;
  }

  if (error) {
    return <ErrorMessage className={styles.messageError} message={`Error loading issues: ${error}`} />;
  }
  
  const getStatusClass = (status: IssueType['status']) => {
    switch (status) {
      case 'open': return styles.statusOpen;
      case 'in_progress': return styles.statusInProgress;
      case 'resolved': return styles.statusResolved;
      case 'closed': return styles.statusClosed;
      default: return '';
    }
  };

  return (
    <div className={styles.listContainer}>
      <h2 className={styles.title}>{isAdmin ? 'All Reported Issues' : 'My Reported Issues'}</h2>
      {actionMessage && (
        <p className={`${actionMessage.startsWith("Failed") ? styles.messageError : styles.messageSuccess}`}>
          {actionMessage}
        </p>
      )}
      {issuesToDisplay.length === 0 ? (
        <p className={styles.noIssuesMessage}>No issues found.</p>
      ) : (
        issuesToDisplay.map((issue: IssueType) => (
          <div key={issue._id} className={styles.listItem}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>{issue.title}</span>
              <span className={`${styles.itemStatus} ${getStatusClass(issue.status)}`}>
                {issue.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className={styles.itemMeta}>
              Category: {issue.category} | Reported By: {typeof issue.reportedBy === 'string' ? 'User ID ' + issue.reportedBy : issue.reportedBy?.username || 'N/A'}
            </p>
            <p className={styles.itemMeta}>
              Reported: {formatDate(issue.createdAt)} | Last Updated: {formatDate(issue.updatedAt)}
            </p>
            <p className={styles.itemDescription}>{issue.description}</p>
            {issue.adminNotes && <p className={styles.adminNotes}>Admin Notes: {issue.adminNotes}</p>}

            {isAdmin && issue.status !== 'closed' && issue.status !== 'resolved' && (
              <div className={styles.adminActions}>
                <span className={styles.adminActionsLabel}>Change Status:</span>
                <select
                  className={styles.statusSelect}
                  value={selectedStatus[issue._id] || issue.status}
                  onChange={(e) => handleStatusChange(issue._id, e)}
                  disabled={isUpdatingStatus}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <Button
                  variant="primary"
                  size="small"
                  className={styles.updateStatusButton}
                  onClick={() => handleUpdateStatus(issue._id)}
                  disabled={isUpdatingStatus || !selectedStatus[issue._id] || selectedStatus[issue._id] === issue.status}
                >
                  {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReportIssuesList;