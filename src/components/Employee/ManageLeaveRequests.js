import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLeaveRequestsByUserId,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
} from '../../redux/modules/leaves';
import usePersistedState from '../hooks/usePersistedState';

const ManageLeaveRequests = () => {
  const [formData, setFormData] = usePersistedState('formData', {
    fromDate: '',
    toDate: '',
    reason: '',
    OU: '',
  });
  const [isEditing, setIsEditing] = usePersistedState('isEditing', false);
  const [currentRequestId, setCurrentRequestId] = usePersistedState('currentRequestId', null);
  const [isFormVisible, setIsFormVisible] = usePersistedState('isFormVisible', false);

  const dispatch = useDispatch();
  const leaveRequests = useSelector((state) => state.leaves.leaveRequests || []);
  const loggedInUser = useSelector((state) => state.users?.user?._id);
  const { status, error } = useSelector((state) => state.leaves || {});

  useEffect(() => {
    if (loggedInUser) {
      dispatch(fetchLeaveRequestsByUserId(loggedInUser));
    }
  }, [dispatch, loggedInUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestData = { ...formData, user: loggedInUser };
    if (isEditing) {
      dispatch(updateLeaveRequest(currentRequestId, requestData));
    } else {
      dispatch(createLeaveRequest(requestData));
    }
    setFormData({
      fromDate: '',
      toDate: '',
      reason: '',
      OU: '',
    });
    setIsEditing(false);
    setCurrentRequestId(null);
    setIsFormVisible(false); // Hide the form after submission
  };

  const handleEdit = (request) => {
    setFormData({
      fromDate: request.fromDate[0],
      toDate: request.toDate[0], // Assuming there's only one date in the array
      reason: request.reason,
      OU: request.OU,
    });
    setIsEditing(true);
    setCurrentRequestId(request._id);
    setIsFormVisible(true); // Show the form when editing
  };

  const handleDelete = (requestId) => {
    dispatch(deleteLeaveRequest(requestId));
  };

  const handleCreateNew = () => {
    setFormData({
      fromDate: '',
      toDate: '',
      reason: '',
      OU: '',
    });
    setIsEditing(false);
    setCurrentRequestId(null);
    setIsFormVisible(true); // Show the form for creating a new request
  };

  const closeModal = () => {
    setIsFormVisible(false);
  };

  if (status === 'loading') {
    return <div className="manage-leave-loading-message">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="manage-leave-error-message">Error: {error}</div>;
  }

  // Check if there is at least one pending request
  const hasPendingRequests = leaveRequests.some(request => request.status === 'pending');


  return (
    <div className="main manage-leave-main">
      <h2 className="manage-leave-form-title">Manage Leave Requests</h2>
      <button className="manage-leave-btn manage-leave-btn-primary" onClick={handleCreateNew}>Create New Leave Request</button>
      {isFormVisible && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h3>{isEditing ? 'Edit Leave Request' : 'Create New Leave Request'}</h3> {/* Title for the form */}
            <form className="form1" onSubmit={handleSubmit}>
              <input
                className="input-text"
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                required
              />
              <input
                className="input-text"
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                required
              />
              <input
                className="input-text"
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Reason"
                required
              />
              <select
                className="input-text"
                name="OU"
                value={formData.OU}
                onChange={handleChange}
                required
              >
                <option value="">Select OU</option>
                <option value="AE">AE</option>
                <option value="SA">SA</option>
                <option value="EG">EG</option>
                <option value="specialty">Specialty</option>
              </select>
              <button align="center" type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                {isEditing ? 'Update Leave Request' : 'Create Leave Request'}
              </button>
              {status === 'failed' && <p className="error" align="center">Error: {error}</p>}
            </form>
          </div>
        </div>
      )}
      <h2 className="manage-leave-form-title">Submitted Leave Requests</h2>
      <table className="manage-leave-requests-table">
        <thead>
          <tr>
            <th>From Date</th>
            <th>To Date</th>
            <th>Reason</th>
            <th>Status</th>
            {hasPendingRequests && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {leaveRequests.length === 0 ? (
            <tr>
              <td colSpan={hasPendingRequests ? "5" : "4"} align="center">No leave requests found.</td>
            </tr>
          ) : (
            leaveRequests.map((request) => (
              <tr key={request._id}>
                <td>{new Date(request.fromDate).toLocaleDateString()}</td>
                <td>{request.toDate.join(', ')}</td>
                <td>{request.reason}</td>
                <td>{request.status}</td>
                {request.status === 'pending' && (
                  <td>
                    <button className="manage-leave-btn manage-leave-btn-secondary" onClick={() => handleEdit(request)}>Edit</button>
                    <button className="manage-leave-btn manage-leave-btn-danger" onClick={() => handleDelete(request._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageLeaveRequests;