import React, { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllSwapRequestsForAdmin, 
  updateSwapStatusByAdmin,    
  selectAllSwapRequestsForAdmin as selectAllSwaps, // Corrected: Use the actual selector name and alias if preferred
  selectIsLoadingAllSwapsAdmin as selectIsLoading, // Corrected
  selectAllSwapsErrorAdmin as selectError,       // Corrected
  selectIsUpdatingSwapStatusAdmin as selectIsUpdatingStatus, // Corrected
  clearSwapErrors, // Corrected
} from '../../store/slices/swapSlice';
import * as XLSX from 'xlsx';
import SelectFilter from '../common/SelectFilter'; 
import { APISwapRequest, APISchedule, APIShift, BackendUser } from '../../apiServiceTypes'; 

const AllSwapRequests: React.FC = () => {
  const dispatch = useAppDispatch();
  const allSwapsData = useAppSelector(selectAllSwaps); // Use the aliased or direct selector
  const isLoadingData = useAppSelector(selectIsLoading);
  const errorData = useAppSelector(selectError);
  const isUpdatingStatusData = useAppSelector(selectIsUpdatingStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [requesterFilter, setRequesterFilter] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); 
  const [adminApprovalFilter, setAdminApprovalFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAllSwapRequestsForAdmin()); 
    return () => {
        dispatch(clearSwapErrors());
    }
  }, [dispatch]);

  const getUniqueValues = useCallback((key: keyof APISwapRequest, subKey?: keyof BackendUser | keyof APISchedule) => {
    const values = allSwapsData.map((swap) => { // Use allSwapsData which should be correctly typed
      let value: any = swap[key];
      if (subKey && typeof value === 'object' && value !== null && subKey in value) {
        value = value[subKey];
      }
      return value || 'N/A';
    });
    return [...new Set(values as string[])].sort();
  }, [allSwapsData]);

  const uniqueRequesterUsernames = useMemo(() => getUniqueValues('requester', 'username'), [getUniqueValues]);
  const uniqueRecipientUsernames = useMemo(() => getUniqueValues('recipientUserId', 'username'), [getUniqueValues]); 
  const uniqueStatuses = useMemo(() => getUniqueValues('status'), [getUniqueValues]);
  const uniqueAdminApprovals = useMemo(() => getUniqueValues('adminApprovalStatus'), [getUniqueValues]); 


  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleApprove = async (swapId: string) => {
    dispatch(updateSwapStatusByAdmin({ swapId, adminApprovalStatus: 'approved', status: 'approved', message: 'Approved by Admin via All Requests' })) 
        .unwrap()
        .then(() => dispatch(fetchAllSwapRequestsForAdmin())) 
        .catch(err => console.error("Error approving swap:", err));
  };

  const handleReject = async (swapId: string) => {
    dispatch(updateSwapStatusByAdmin({ swapId, adminApprovalStatus: 'declined', status: 'declined_by_admin', message: 'Rejected by Admin via All Requests' })) 
        .unwrap()
        .then(() => dispatch(fetchAllSwapRequestsForAdmin()))
        .catch(err => console.error("Error rejecting swap:", err));
  };

  const getShiftDisplay = (shiftId?: string, schedule?: string | APISchedule): string => {
    if (!shiftId || !schedule || typeof schedule === 'string' || !schedule.shifts) return 'N/A';
    const shift = schedule.shifts.find((s: APIShift) => s._id === shiftId); // Typed s
    return shift ? `${shift.dayOfWeek} ${shift.startTime}-${shift.endTime} (W${schedule.week % 100})` : 'N/A';
  };


  const filteredSwaps = useMemo(() => {
    const searchQueryLower = searchQuery.toLowerCase();
    return allSwapsData.filter((swap: APISwapRequest) => { // Use allSwapsData
      const requesterUsername = typeof swap.requester === 'object' ? swap.requester?.username?.toLowerCase() || '' : '';
      const recipientUsername = typeof swap.recipientUserId === 'object' ? swap.recipientUserId?.username?.toLowerCase() || '' : ''; 
      
      const offeredShiftInfo = getShiftDisplay(swap.offeredShiftId, swap.offeredShiftScheduleId).toLowerCase();
      const recipientOfferedShiftInfo = swap.recipientOfferedShiftId && swap.recipientOfferedShiftScheduleId ? getShiftDisplay(swap.recipientOfferedShiftId, swap.recipientOfferedShiftScheduleId).toLowerCase() : '';

      return (
        (searchQueryLower === '' ||
          requesterUsername.includes(searchQueryLower) ||
          recipientUsername.includes(searchQueryLower) ||
          offeredShiftInfo.includes(searchQueryLower) ||
          recipientOfferedShiftInfo.includes(searchQueryLower) ||
          swap.status?.toLowerCase().includes(searchQueryLower) ||
          swap.adminApprovalStatus?.toLowerCase().includes(searchQueryLower)) && 
        (requesterFilter === '' || (typeof swap.requester === 'object' && swap.requester?.username === requesterFilter)) &&
        (recipientFilter === '' || (typeof swap.recipientUserId === 'object' && swap.recipientUserId?.username === recipientFilter)) && 
        (statusFilter === '' || swap.status === statusFilter) &&
        (adminApprovalFilter === '' || swap.adminApprovalStatus === adminApprovalFilter) 
      );
    });
  }, [allSwapsData, searchQuery, requesterFilter, recipientFilter, statusFilter, adminApprovalFilter]);

  const exportToExcel = () => {
    const worksheetData = filteredSwaps.map((swap: APISwapRequest) => ({ // Typed swap
      ID: swap._id,
      Requester: typeof swap.requester === 'object' ? swap.requester?.username : 'N/A',
      'Offered Shift': getShiftDisplay(swap.offeredShiftId, swap.offeredShiftScheduleId),
      Recipient: typeof swap.recipientUserId === 'object' ? swap.recipientUserId?.username : 'N/A', 
      'Recipient Offered Shift': swap.recipientOfferedShiftId && swap.recipientOfferedShiftScheduleId ? getShiftDisplay(swap.recipientOfferedShiftId, swap.recipientOfferedShiftScheduleId) : 'N/A',
      Status: swap.status || 'N/A',
      'Admin Approval': swap.adminApprovalStatus || 'N/A', 
      'Week Selection': swap.weekSelection,
      'Is Suggestion': swap.isSuggestion ? 'Yes' : 'No',
      Message: swap.message || '',
      'Created At': swap.createdAt ? new Date(swap.createdAt).toLocaleString() : 'N/A',
      'Updated At': swap.updatedAt ? new Date(swap.updatedAt).toLocaleString() : 'N/A',
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AllSwapRequests');
    XLSX.writeFile(workbook, 'AllSwapRequests.xlsx');
  };

  if (isLoadingData) { // Use themed variable
    return <div className="loading-message">Loading all swap requests...</div>;
  }

  if (errorData) { // Use themed variable
    return <div className="error-message" style={{color: 'red'}}>Error fetching swap requests: {String(errorData)}</div>; // Cast to string
  }

  return (
    <div className="main all-requests-container"> 
      <h2 className="form-title">All Swap Requests</h2>
      <div className="controls-bar" style={{display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center'}}>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input" 
          style={{padding: '8px', minWidth: '300px'}}
        />
        <SelectFilter label="Requester:" value={requesterFilter} onChange={(e) => setRequesterFilter(e.target.value)} options={uniqueRequesterUsernames} />
        <SelectFilter label="Recipient:" value={recipientFilter} onChange={(e) => setRecipientFilter(e.target.value)} options={uniqueRecipientUsernames} />
        <SelectFilter label="Status:" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={uniqueStatuses} />
        <SelectFilter label="Admin Approval:" value={adminApprovalFilter} onChange={(e) => setAdminApprovalFilter(e.target.value)} options={uniqueAdminApprovals} />
        <button className="btn btn-primary" onClick={exportToExcel} style={{marginLeft: 'auto'}}>Download as Excel</button>
      </div>
      
      <table className="requests-table"> 
        <thead>
          <tr>
            <th>Requester</th>
            <th>Offered Shift</th>
            <th>Recipient</th>
            <th>Recipient's Offered Shift</th>
            <th>Status</th>
            <th>Admin Approval</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSwaps.length > 0 ? (
            filteredSwaps.map((swap: APISwapRequest) => (
              <tr key={swap._id}>
                <td>{typeof swap.requester === 'object' ? swap.requester?.username : 'N/A'}</td>
                <td>{getShiftDisplay(swap.offeredShiftId, swap.offeredShiftScheduleId)}</td>
                <td>{typeof swap.recipientUserId === 'object' ? swap.recipientUserId?.username : 'N/A'}</td> 
                <td>{swap.recipientOfferedShiftId && swap.recipientOfferedShiftScheduleId ? getShiftDisplay(swap.recipientOfferedShiftId, swap.recipientOfferedShiftScheduleId) : 'N/A'}</td>
                <td style={{fontWeight: swap.status === 'queued' || swap.status === 'match_found_pending_confirmation' || swap.status === 'admin_approval_pending' ? 'bold' : 'normal'}}>{swap.status}</td>
                <td style={{fontWeight: swap.adminApprovalStatus === 'pending' ? 'bold' : 'normal'}}>{swap.adminApprovalStatus || 'N/A'}</td>
                <td>{swap.createdAt ? new Date(swap.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                  {swap.adminApprovalStatus === 'pending' && swap.status === 'admin_approval_pending' && ( 
                    <>
                      <button className="btn btn-success" style={{marginRight: '5px'}} onClick={() => handleApprove(swap._id)} disabled={isUpdatingStatusData}>
                        {isUpdatingStatusData ? 'Processing...' : 'Approve Suggestion'}
                      </button>
                      <button className="btn btn-danger" onClick={() => handleReject(swap._id)} disabled={isUpdatingStatusData}>
                        {isUpdatingStatusData ? 'Processing...' : 'Reject Suggestion'}
                      </button>
                    </>
                  )}
                   {swap.adminApprovalStatus && swap.adminApprovalStatus !== 'pending' && (
                    <span>{swap.adminApprovalStatus}</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{textAlign: 'center'}}>No swap requests match your filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllSwapRequests;