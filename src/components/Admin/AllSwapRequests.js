import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSwaps, updateSwapStatus } from '../../redux/modules/admin';
import { cancelAllSwaps } from '../../redux/modules/swap';
import * as XLSX from 'xlsx';
import usePersistedState from '../hooks/usePersistedState'; // Import the custom hook

const AllSwapRequests = () => {
  const dispatch = useDispatch();
  const swaps = useSelector((state) => state.admin.swaps.all || []); // Ensure initial state is an array
  const loading = useSelector((state) => state.admin.loading.allSwaps);
  const error = useSelector((state) => state.admin.error);

  const [actionError, setActionError] = usePersistedState('actionError', null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchSwaps());
      } catch (err) {
        console.error('Error fetching swaps:', err);
      }
    };
    fetchData();
  }, [dispatch]); // Empty dependency array ensures this runs on mount



  const getUniqueValues = useCallback((key) => {
    const values = swaps.flatMap((swap) => {
      const keys = key.split('.');
      let value = swap;
      for (const k of keys) {
        value = value ? value[k] : 'N/A';
      }
      return Array.isArray(value) ? value : value || 'N/A';
    });
    return [...new Set(values)];
  }, [swaps]);

  const handleAccept = async (id, requesterId, recipientId, week) => {
    try {
      await dispatch(updateSwapStatus(id, 'approved', 'Swap has been approved by the WFM', 'admin', 'approved'));
      await dispatch(cancelAllSwaps(requesterId, recipientId, week));
      dispatch(fetchSwaps());
    } catch (err) {
      setActionError('Error approving swap');
      console.error('Error approving swap:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await dispatch(updateSwapStatus(id, 'declined', 'Swap has been rejected by the WFM', 'admin', 'declined'));
      dispatch(fetchSwaps());
    } catch (err) {
      setActionError('Error rejecting swap');
      console.error('Error rejecting swap:', err);
    }
  };

  const filteredSwaps = useMemo(() => {
    try {
      return swaps;
    } catch (error) {
      console.error('Error filtering swaps:', error);
      return [];
    }
  }, [swaps]);

  const exportToExcel = useCallback(() => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredSwaps.map(swap => ({
        Requester: swap.requester?.username || 'N/A',
        Recipient: swap.recipient?.username || 'N/A',
        'Requester Schedule': `${swap.requesterSchedule.workingHours} (Week ${swap.requesterSchedule.week})` || 'N/A',
        'Recipient Schedule': `${swap.recipientSchedule.workingHours} (Week ${swap.recipientSchedule.week})` || 'N/A',
        Status: swap.status || 'N/A',
        Approval: swap.adminApproval || 'N/A'
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Swaps');
      XLSX.writeFile(workbook, 'FilteredSwaps.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('An error occurred while exporting to Excel. Please try again.');
    }
  }, [filteredSwaps]);

  const handleRefresh = () => {
    dispatch(fetchSwaps());
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching swaps: {JSON.stringify(error)}</div>; // Convert error object to string
  }

  return (
    <div className="main">
      <h2 className="form-title">Swap Requests</h2>
      <button className="btn-primary" onClick={exportToExcel}>Download as Excel</button>
      <button className="btn-secondary" onClick={handleRefresh}>Refresh</button>
      <table>
        <thead>
          <tr>
            <th>Requester</th>
            <th>Recipient</th>
            <th>Requester Schedule</th>
            <th>Recipient Schedule</th>
            <th>Status</th>
            <th>Approval</th>
          </tr>
        </thead>
        <tbody>
          {filteredSwaps.length > 0 ? (
            filteredSwaps.map((swap) => (
              <tr key={swap._id}>
                <td>{swap.requester.username}</td>
                <td>{swap.recipient.username}</td>
                <td>{`${swap.requesterSchedule.workingHours} (Week ${swap.requesterSchedule.week})`}</td>
                <td>{`${swap.recipientSchedule.workingHours} (Week ${swap.recipientSchedule.week})`}</td>
                <td>{swap.status}</td>
                <td>
                  {swap.status === 'pending' ? (
                    <>
                      <button onClick={() => handleAccept(swap._id, swap.requester._id, swap.recipient._id, swap.requesterSchedule.week)}>Accept</button>
                      <button onClick={() => handleReject(swap._id)}>Reject</button>
                    </>
                  ) : (
                    <span>{swap.adminApproval}</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No swaps found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllSwapRequests;