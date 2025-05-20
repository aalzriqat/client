import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMySentRequests, 
  cancelMySwapRequest,  
  selectSentSwapRequests,
  selectIsLoadingMyRequests,
  selectLoadMyRequestsError, 
  selectIsCancellingSwap,
  clearSwapErrors,
} from "../../store/slices/swapSlice";
import { selectCurrentUser, selectIsAuthenticated } from "../../store/slices/authSlice";
import { APISwapRequest, APISchedule, APIShift, AdminApprovalStatusType, BackendUser } from "../../apiServiceTypes"; // Added BackendUser for type check
// import styles from './SwapRequestTable.module.css'; 

const SentSwapRequests: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const sentSwaps = useAppSelector(selectSentSwapRequests);
  const isLoading = useAppSelector(selectIsLoadingMyRequests);
  const error = useAppSelector(selectLoadMyRequestsError);
  const isCancelling = useAppSelector(selectIsCancellingSwap);

  useEffect(() => {
    if (isAuthenticated && currentUser?._id) {
      dispatch(fetchMySentRequests()); 
    }
    return () => {
      dispatch(clearSwapErrors());
    };
  }, [dispatch, isAuthenticated, currentUser?._id]);

  const handleCancel = (swapId: string) => {
    if (window.confirm('Are you sure you want to cancel this swap request?')) {
      dispatch(cancelMySwapRequest(swapId))
        .unwrap()
        .then(() => {
          if (currentUser?._id) dispatch(fetchMySentRequests()); 
        })
        .catch((err) => console.error("Failed to cancel swap:", err));
    }
  };

  const formatTime = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { timeZone: 'Asia/Amman', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  const getStatusStyle = (status?: APISwapRequest['status']): React.CSSProperties => {
    switch (status?.toLowerCase()) {
      case "queued":
      case "matching":
        return { backgroundColor: "lightblue", color: "black" };
      case "match_found_pending_confirmation":
      case "confirmed_by_one":
      case "admin_approval_pending":
        return { backgroundColor: "orange", color: "black" };
      case "approved":
        return { backgroundColor: "green", color: "white" };
      case "rejected_by_requester":
      case "rejected_by_match":
      case "declined_by_admin":
      case "cancelled_by_user":
      case "system_cancelled":
        return { backgroundColor: "red", color: "white" };
      default:
        return {};
    }
  };

  const getAdminApprovalStatusStyle = (status?: AdminApprovalStatusType): React.CSSProperties => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { color: "orange", fontWeight: "bold" };
      case "approved":
        return { color: "green" };
      case "declined":
        return { color: "red" };
      default:
        return {};
    }
  };

  const getShiftDisplay = (shiftDetail?: APIShift, schedule?: string | APISchedule): string => {
    if (!shiftDetail) return "Shift details N/A";
    let weekInfo = "";
    if (schedule && typeof schedule !== 'string' && schedule.week) {
        weekInfo = `(W${schedule.week % 100})`;
    }
    return `${shiftDetail.dayOfWeek} ${shiftDetail.startTime}-${shiftDetail.endTime} ${weekInfo}`;
  };

  const sortedSwaps = useMemo(() => {
    return [...sentSwaps].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sentSwaps]);

  if (!isAuthenticated) {
    return <p>You need to log in to view your sent swap requests.</p>;
  }

  if (isLoading) {
    return <p className="loading-message">Loading sent swap requests...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  const canBeCancelledByUser = (status?: APISwapRequest['status']): boolean => {
    if (!status) return false;
    return ["queued", "matching", "suggestion_available", "match_found_pending_confirmation", "confirmed_by_one"].includes(status);
  };

  const getRecipientUsername = (recipient?: string | BackendUser): string => {
    if (typeof recipient === 'object' && recipient !== null && recipient.username) {
      return recipient.username;
    }
    if (typeof recipient === 'string') {
      return `User ID: ${recipient.substring(0, 6)}...`; // Or fetch username if needed, for now just ID
    }
    return 'N/A (Queued)';
  };

  return (
    <div className="swap-table-container"> 
      <h2 className="table-title">My Sent Swap Requests</h2>
      {sortedSwaps.length > 0 ? (
        <table className="swap-table"> 
          <thead>
            <tr>
              <th>Your Offered Shift</th>
              <th>Matched With User</th>
              <th>Their Offered Shift (if matched)</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Admin Approval</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSwaps.map((swap: APISwapRequest) => (
              <tr key={swap._id}>
                <td>{getShiftDisplay(swap.offeredShiftDetail, swap.offeredShiftScheduleId)}</td>
                <td>{getRecipientUsername(swap.recipientUserId)}</td>
                <td>
                  {swap.matchedSwapRequestId ? 
                    getShiftDisplay(swap.recipientOfferedShiftDetail, swap.recipientOfferedShiftScheduleId) 
                    : 'N/A'}
                </td>
                <td>{formatTime(swap.createdAt)}</td>
                <td style={getStatusStyle(swap.status)}>{swap.status || "N/A"}</td>
                <td style={getAdminApprovalStatusStyle(swap.adminApprovalStatus)}>{swap.adminApprovalStatus || "N/A"}</td>
                <td>
                  {canBeCancelledByUser(swap.status) ? (
                    <button
                      className="custom-btn custom-btn-warning" 
                      onClick={() => handleCancel(swap._id)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  ) : (
                    <span>{swap.status === 'approved' ? 'Approved' : 'No actions'}</span> 
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No swap requests sent.</p>
      )}
    </div>
  );
};

export default SentSwapRequests;
