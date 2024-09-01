import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSwaps, updateSwapStatus } from '../../redux/modules/admin';
import * as XLSX from 'xlsx';

const AllSwapRequests = () => {
  const dispatch = useDispatch();
  const swaps = useSelector((state) => state.admin.swaps.all);
  const loading = useSelector((state) => state.admin.loading.allSwaps);
  const error = useSelector((state) => state.admin.error);

  const [searchQuery, setSearchQuery] = useState('');
  const [requesterFilter, setRequesterFilter] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('');
  const [requesterScheduleFilter, setRequesterScheduleFilter] = useState('');
  const [recipientScheduleFilter, setRecipientScheduleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [updatedSwaps, setUpdatedSwaps] = useState([]);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchSwaps());
      } catch (err) {
        console.error('Error fetching swaps:', err);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    setUpdatedSwaps(swaps);
  }, [swaps]);

  const getUniqueValues = (key) => {
    const values = swaps.map((swap) => {
      const keys = key.split('.');
      let value = swap;
      for (const k of keys) {
        value = value ? value[k] : 'N/A';
      }
      return value || 'N/A';
    });
    return [...new Set(values)];
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching swaps: {error}</div>;
  }

  const handleAccept = async (id) => {
    try {
      await dispatch(updateSwapStatus(id, 'approved', 'Swap has been approved by the WFM', 'admin', 'approved'));
      setUpdatedSwaps((prevSwaps) =>
        prevSwaps.map((swap) =>
          swap._id === id ? { ...swap, status: 'accepted', adminApproval: 'accepted' } : swap
        )
      );
    } catch (err) {
      setActionError('Error approving swap');
      console.error('Error approving swap:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await dispatch(updateSwapStatus(id, 'declined', 'Swap has been rejected by the WFM', 'admin', 'declined'));
      setUpdatedSwaps((prevSwaps) =>
        prevSwaps.map((swap) =>
          swap._id === id ? { ...swap, status: 'rejected', adminApproval: 'rejected' } : swap
        )
      );
    } catch (err) {
      setActionError('Error rejecting swap');
      console.error('Error rejecting swap:', err);
    }
  };

  const searchQueryLower = searchQuery.toLowerCase();

  const filteredSwaps = updatedSwaps.filter((swap) => {
    const requesterSchedule = `${swap.requesterSchedule.workingHours} (Week ${swap.requesterSchedule.week})`;
    const recipientSchedule = `${swap.recipientSchedule.workingHours} (Week ${swap.recipientSchedule.week})`;

    return (
      swap.status !== 'pending' &&
      (swap.requester?.username?.toLowerCase().includes(searchQueryLower) ||
        swap.recipient?.username?.toLowerCase().includes(searchQueryLower) ||
        requesterSchedule.toLowerCase().includes(searchQueryLower) ||
        recipientSchedule.toLowerCase().includes(searchQueryLower) ||
        swap.status?.toLowerCase().includes(searchQueryLower) ||
        swap.adminApproval?.toLowerCase().includes(searchQueryLower)) &&
      (requesterFilter === '' || swap.requester?.username === requesterFilter) &&
      (recipientFilter === '' || swap.recipient?.username === recipientFilter) &&
      (requesterScheduleFilter === '' || requesterSchedule === requesterScheduleFilter) &&
      (recipientScheduleFilter === '' || recipientSchedule === recipientScheduleFilter) &&
      (statusFilter === '' || swap.status === statusFilter) &&
      (approvalFilter === '' || swap.adminApproval === approvalFilter)
    );
  });

  const exportToExcel = () => {
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
  };

  return (
    <div className="main">
      <h2 className="form-title">Swap Requests</h2>
      <input
        type="text"
        placeholder="Search by username, working hours, off days, or week..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-input"
      />
      <button className="btn-primary"
        onClick={exportToExcel}>Download as Excel</button>
      {actionError && <div className="error">{actionError}</div>}
      <table>
        <thead>
          <tr>
            <th>
              Requester
              <select
                value={requesterFilter}
                onChange={(e) => setRequesterFilter(e.target.value)}
              >
                <option value="">All</option>
                {getUniqueValues('requester.username').map((value, index) => (
                  <option key={`${value}-${index}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </th>
            <th>
              Recipient
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
              >
                <option value="">All</option>
                {getUniqueValues('recipient.username').map((value, index) => (
                  <option key={`${value}-${index}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </th>
            <th>
              Requester Schedule
              <select
                value={requesterScheduleFilter}
                onChange={(e) => setRequesterScheduleFilter(e.target.value)}
              >
                <option value="">All</option>
                {getUniqueValues('requesterSchedule.workingHours').map((value, index) => (
                  <option key={`${value}-${index}`} value={value}>
                    {value}
                  </option>
                ))}
                {getUniqueValues('requesterSchedule.week').map((value, index) => (
                  <option key={`Week ${value}-${index}`} value={`Week ${value}`}>
                    Week {value}
                  </option>
                ))}
              </select>
            </th>
            <th>
              Recipient Schedule
              <select
                value={recipientScheduleFilter}
                onChange={(e) => setRecipientScheduleFilter(e.target.value)}
              >
                <option value="">All</option>
                {getUniqueValues('recipientSchedule.workingHours').map((value, index) => (
                  <option key={`${value}-${index}`} value={value}>
                    {value}
                  </option>
                ))}
                {getUniqueValues('recipientSchedule.week').map((value, index) => (
                  <option key={`Week ${value}-${index}`} value={`Week ${value}`}>
                    Week {value}
                  </option>
                ))}
              </select>
            </th>
            <th>
              Status
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                {getUniqueValues('status').map((value, index) => (
                  <option key={`${value}-${index}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </th>
            <th>
              Approval
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
              >
                <option value="">All</option>
                {getUniqueValues('adminApproval').map((value, index) => (
                  <option key={`${value}-${index}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </th>
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
                      <button onClick={() => handleAccept(swap._id)}>Accept</button>
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