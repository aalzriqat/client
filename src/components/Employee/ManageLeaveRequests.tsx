import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMyLeaveRequestsThunk,
  submitLeaveRequestThunk,
  cancelLeaveRequestThunk,
  selectMyLeaveRequests,
  selectLeaveIsLoading,
  selectLeaveError,
  selectLeaveIsSubmitting,
  // selectLeaveSubmitError, // Removed as it's not used directly
  selectLeaveLastSubmitSuccess,
  selectLeaveIsCancelling,
  // selectLeaveCancelError, // For specific cancel error display
  selectLeaveLastCancelSuccess,
  resetLeaveStatusFlags,
  clearLeaveErrors,
} from '../../store/slices/leaveSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { LeaveRequestPayload, LeaveRequest as LeaveRequestType } from '../../apiServiceTypes'; // Updated import path

interface LeaveFormData {
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  OU?: string; // Added OU to form data
}

const initialFormData: LeaveFormData = {
  startDate: '',
  endDate: '',
  reason: '',
  leaveType: 'Annual',
  OU: '', // Default OU, or make it selectable. For now, an empty string.
};

const ManageLeaveRequests: React.FC = () => {
  const [formData, setFormData] = useState<LeaveFormData>(initialFormData);
  // const [isEditing, setIsEditing] = useState<boolean>(false); // Removed as edit is not implemented
  // const [currentRequestId, setCurrentRequestId] = useState<string | null>(null); // Removed
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const myLeaveRequests = useAppSelector(selectMyLeaveRequests);
  const currentUser = useAppSelector(selectCurrentUser);
  
  const isLoading = useAppSelector(selectLeaveIsLoading);
  const error = useAppSelector(selectLeaveError);
  const isSubmitting = useAppSelector(selectLeaveIsSubmitting);
  // const submitError = useAppSelector(selectLeaveSubmitError); // Can be used for specific submit error message
  const lastSubmitSuccess = useAppSelector(selectLeaveLastSubmitSuccess);
  const isCancelling = useAppSelector(selectLeaveIsCancelling);
  // const cancelError = useAppSelector(selectLeaveCancelError);
  const lastCancelSuccess = useAppSelector(selectLeaveLastCancelSuccess);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchMyLeaveRequestsThunk()); // Removed argument
    }
    return () => { // Cleanup
        dispatch(resetLeaveStatusFlags());
        dispatch(clearLeaveErrors());
    }
  }, [dispatch, currentUser?._id]);

  useEffect(() => {
    if (lastSubmitSuccess) {
      setSubmissionMessage("Leave request submitted successfully!");
      setIsFormVisible(false); // Hide form on success
      setFormData(initialFormData); // Reset form
      dispatch(resetLeaveStatusFlags()); // Reset success flag
      if (currentUser?._id) dispatch(fetchMyLeaveRequestsThunk()); // Re-fetch, removed argument
    }
  }, [lastSubmitSuccess, dispatch, currentUser?._id]);

  useEffect(() => {
    if (lastCancelSuccess) {
      setSubmissionMessage("Leave request cancelled successfully!");
      dispatch(resetLeaveStatusFlags());
      if (currentUser?._id) dispatch(fetchMyLeaveRequestsThunk()); // Re-fetch, removed argument
    }
  }, [lastCancelSuccess, dispatch, currentUser?._id]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmissionMessage(null); // Clear message on new input
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser?._id) {
      setSubmissionMessage("Cannot submit: User not identified.");
      return;
    }
    // Basic validation
    if (!formData.startDate || !formData.endDate || !formData.reason || !formData.leaveType) {
        setSubmissionMessage("Please fill in all required fields: Start Date, End Date, Reason, and Leave Type.");
        return;
    }

    const payload: LeaveRequestPayload = {
      // user: currentUser._id, // Removed: user ID will be derived by backend from auth token
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      leaveType: formData.leaveType,
      ...(formData.OU && formData.OU !== "" && { OU: formData.OU }),
    };
    // Note: Edit logic is not implemented.
    dispatch(submitLeaveRequestThunk(payload));
  };

  // Edit functionality removed for now.
  // const handleEdit = ... (Removed)

  const handleCancelRequest = (requestId: string) => {
    if (window.confirm("Are you sure you want to cancel this leave request?")) {
      dispatch(cancelLeaveRequestThunk(requestId));
    }
  };

  const handleCreateNew = () => {
    setFormData(initialFormData);
    // setIsEditing(false); // Removed
    // setCurrentRequestId(null); // Removed
    setIsFormVisible(true);
    setSubmissionMessage(null);
    dispatch(resetLeaveStatusFlags());
  };

  const closeModal = () => {
    setIsFormVisible(false);
    setFormData(initialFormData); // Reset form when closing modal
    // setIsEditing(false); // Removed
    // setCurrentRequestId(null); // Removed
    dispatch(resetLeaveStatusFlags()); // Clear any submission state
  };
  
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // Assuming dateString is 'YYYY-MM-DD' from input type="date"
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`; // DD/MM/YYYY
  };


  if (isLoading) {
    return <div className="manage-leave-loading-message">Loading leave requests...</div>;
  }

  // Show general fetch error if it occurs and no requests are loaded
  if (error && myLeaveRequests.length === 0) {
    return <div className="manage-leave-error-message" style={{color: 'red'}}>Error fetching leave requests: {error}</div>;
  }

  return (
    <div className="main manage-leave-main">
      <h2 className="manage-leave-form-title">Manage My Leave Requests</h2>
      <button className="manage-leave-btn manage-leave-btn-primary" onClick={handleCreateNew} style={{marginBottom: '20px'}}>
        Submit New Leave Request
      </button>

      {submissionMessage && <p style={{ color: lastSubmitSuccess || lastCancelSuccess ? 'green' : 'red', margin: '10px 0' }}>{submissionMessage}</p>}

      {isFormVisible && (
        <div className="modal"> {/* Basic modal styling needed */}
          <div className="modal-content">
            <span className="close" onClick={closeModal} style={{cursor: 'pointer', float: 'right', fontSize: '28px'}}>&times;</span>
            <h3>Submit New Leave Request</h3> {/* Simplified title as edit is removed */}
            <form className="form1" onSubmit={handleSubmit}> {/* Ensure .form1 styles are appropriate */}
              <label htmlFor="leaveType">Leave Type:</label>
              <select id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleChange} required>
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Emergency">Emergency</option>
                <option value="Other">Other</option>
              </select>

              <label htmlFor="startDate">Start Date:</label>
              <input id="startDate" className="input-text" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
              
              <label htmlFor="endDate">End Date:</label>
              <input id="endDate" className="input-text" type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
              
              <label htmlFor="reason">Reason:</label>
              <textarea id="reason" className="input-text" name="reason" value={formData.reason} onChange={handleChange} placeholder="Reason for leave" required rows={3} />
              
              <label htmlFor="OU">OU (Operational Unit - Optional):</label>
              <select id="OU" className="input-text" name="OU" value={formData.OU || ''} onChange={handleChange}>
                <option value="">Select OU</option>
                <option value="AE">AE</option>
                <option value="SA">SA</option>
                <option value="EG">EG</option>
                <option value="specialty">Specialty</option>
              </select>
              
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{marginTop: '10px'}}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      <h3 className="manage-leave-form-title" style={{marginTop: '20px'}}>My Submitted Requests</h3>
      {myLeaveRequests.length === 0 && !isLoading && <p>No leave requests found.</p>}
      {myLeaveRequests.length > 0 && (
        <table className="manage-leave-requests-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date / Duration</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{/* Ensure no whitespace before/after this map and before/after tr within map */}
            {myLeaveRequests.map((request: LeaveRequestType) => (
              <tr key={request._id}>{/* Ensure no whitespace after tr or before td */}
                <td>{request.leaveType}</td>
                <td>{formatDisplayDate(request.fromDate)}</td>
                <td>{formatDisplayDate(request.toDate)}</td> {/* Changed to use formatDisplayDate */}
                <td>{request.reason}</td>
                <td style={{ fontWeight: request.status === 'pending' ? 'bold' : 'normal' }}>{request.status}</td>
                <td>
                  {request.status === 'pending' && (
                    <button 
                      className="manage-leave-btn manage-leave-btn-danger" 
                      onClick={() => handleCancelRequest(request._id)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                  {/* Edit button removed for now, as update logic for PENDING requests needs clarification from backend capabilities */}
                </td>
              </tr> // Ensure no whitespace after tr
            ))}
          </tbody>{/* Ensure no whitespace before end tag */}
        </table>
      )}
    </div>
  );
};

export default ManageLeaveRequests;