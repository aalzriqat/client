import React, { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllLeaveRequestsAdminThunk,
  updateLeaveStatusAdminThunk,
  selectAllLeaveRequestsAdmin,
  selectIsLoadingAllLeaveAdmin,
  selectAllLeaveErrorAdmin,
  selectIsUpdatingLeaveStatusAdmin,
  clearLeaveErrors,
  resetLeaveStatusFlags,
} from '../../store/slices/leaveSlice';
import LoadingMessage from '../common/LoadingMessage';
import ErrorMessage from '../common/ErrorMessage';
import SelectFilter from '../common/SelectFilter';
import * as XLSX from 'xlsx';
import { LeaveRequest as LeaveRequestType } from '../../apiServiceTypes';

const LeaveRequestsAdmin: React.FC = () => {
  const dispatch = useAppDispatch();
  const allLeaveRequests = useAppSelector(selectAllLeaveRequestsAdmin);
  const isLoading = useAppSelector(selectIsLoadingAllLeaveAdmin);
  const error = useAppSelector(selectAllLeaveErrorAdmin);
  const isUpdatingStatus = useAppSelector(selectIsUpdatingLeaveStatusAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState(''); // Added for filtering by leave type
  const [actionMessage, setActionMessage] = useState<string | null>(null);


  useEffect(() => {
    dispatch(fetchAllLeaveRequestsAdminThunk());
    return () => {
        dispatch(clearLeaveErrors());
        dispatch(resetLeaveStatusFlags());
    }
  }, [dispatch]);

  const getUniqueValues = useCallback((path: string) => {
    const values = allLeaveRequests.map((item) => {
        const keys = path.split('.');
        let value: any = item;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }
        return String(value ?? 'N/A');
    });
    return [...new Set(values)].sort();
  }, [allLeaveRequests]);

  const uniqueUsernames = useMemo(() => getUniqueValues('user.username'), [getUniqueValues]);
  const uniqueLeaveTypes = useMemo(() => getUniqueValues('leaveType'), [getUniqueValues]);
  const uniqueStatuses = useMemo(() => getUniqueValues('status'), [getUniqueValues]);

  const handleUpdateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    setActionMessage(null);
    dispatch(updateLeaveStatusAdminThunk({ leaveId: id, status: newStatus, adminNotes: `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} by Admin` }))
        .unwrap()
        .then(() => {
            setActionMessage(`Request ${id} ${newStatus} successfully.`);
            dispatch(fetchAllLeaveRequestsAdminThunk()); // Re-fetch
        })
        .catch(err => setActionMessage(`Failed to ${newStatus} request ${id}: ${err.message || err}`));
  };

  const filteredLeaveRequests = useMemo(() => {
    return allLeaveRequests.filter((request: LeaveRequestType) => {
      const username = typeof request.user === 'object' ? request.user?.username?.toLowerCase() || 'n/a' : String(request.user).toLowerCase();
      const reason = request.reason?.toLowerCase() || 'n/a';
      const status = request.status?.toLowerCase() || 'n/a';
      const leaveType = request.leaveType?.toLowerCase() || 'n/a';
      const searchQueryLower = searchQuery.toLowerCase();

      return (
        (searchQueryLower === '' ||
          username.includes(searchQueryLower) ||
          reason.includes(searchQueryLower) ||
          status.includes(searchQueryLower) ||
          leaveType.includes(searchQueryLower)
        ) &&
        (usernameFilter === '' || (typeof request.user === 'object' && request.user?.username === usernameFilter) || String(request.user) === usernameFilter) &&
        (statusFilter === '' || request.status === statusFilter) &&
        (leaveTypeFilter === '' || request.leaveType === leaveTypeFilter)
      );
    });
  }, [allLeaveRequests, searchQuery, usernameFilter, statusFilter, leaveTypeFilter]);

  const exportDataToExcel = () => {
    try {
        const formattedData = filteredLeaveRequests.map(request => ({
            Username: typeof request.user === 'object' ? request.user.username : String(request.user),
            'Leave Type': request.leaveType,
            'From Date': request.fromDate ? new Date(request.fromDate).toLocaleDateString() : 'N/A',
            'To Date': Array.isArray(request.toDate) ? request.toDate.join(', ') : String(request.toDate), // Handle array or string
            Reason: request.reason,
            Status: request.status,
            'Admin Notes': request.adminNotes || 'N/A',
            'Created At': request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A',
        }));
        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "LeaveRequests");
        XLSX.writeFile(wb, `AllLeaveRequests.xlsx`);
    } catch (err) {
        console.error('Error exporting to Excel:', err);
        alert('An error occurred while exporting to Excel. Please try again.');
    }
  };

  if (isLoading) return <LoadingMessage message="Loading leave requests..." />;
  if (error) return <ErrorMessage message={`Error fetching leave requests: ${error}`} />;

  return (
    <div className='main all-leave-requests-container'>
      <h2 className='form-title'>All Employee Leave Requests</h2>
      {actionMessage && <p style={{ color: actionMessage.startsWith("Failed") ? 'red' : 'green', margin: '10px 0' }}>{actionMessage}</p>}
      <div className="controls-bar" style={{display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap'}}>
        <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{padding: '8px', minWidth: '200px'}}
        />
        <SelectFilter label="Username:" value={usernameFilter} onChange={(e) => setUsernameFilter(e.target.value)} options={uniqueUsernames} />
        <SelectFilter label="Leave Type:" value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)} options={uniqueLeaveTypes} />
        <SelectFilter label="Status:" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={uniqueStatuses} />
        <button className='btn btn-primary' onClick={exportDataToExcel} style={{marginLeft: 'auto'}}>Download as Excel</button>
      </div>

      {filteredLeaveRequests.length === 0 && !isLoading && <p>No leave requests found matching your criteria.</p>}
      {filteredLeaveRequests.length > 0 && (
        <table className="leave-requests-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Admin Notes</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaveRequests.map((request: LeaveRequestType) => (
              <tr key={request._id}>
                <td>{typeof request.user === 'object' ? request.user.username : String(request.user)}</td>
                <td>{request.leaveType}</td>
                <td>{new Date(request.fromDate).toLocaleDateString()}</td>
                <td>{Array.isArray(request.toDate) ? request.toDate.join(', ') : String(request.toDate)}</td>
                <td>{request.reason}</td>
                <td>{request.status}</td>
                <td>{request.adminNotes || 'N/A'}</td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                <td>
                  {request.status === 'pending' && (
                    <>
                      <button 
                        className='btn btn-success btn-sm' 
                        onClick={() => handleUpdateStatus(request._id, 'approved')}
                        disabled={isUpdatingStatus}
                        style={{marginRight: '5px'}}
                      >
                        {isUpdatingStatus ? '...' : 'Approve'}
                      </button>
                      <button 
                        className='btn btn-danger btn-sm' 
                        onClick={() => handleUpdateStatus(request._id, 'rejected')}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? '...' : 'Reject'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveRequestsAdmin;