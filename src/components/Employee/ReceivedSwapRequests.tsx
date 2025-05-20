import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMyReceivedRequests, 
  selectReceivedSwapRequests,
  selectIsLoadingMyRequests,
  selectLoadMyRequestsError,
  clearSwapErrors,
} from "../../store/slices/swapSlice";
import { selectCurrentUser, selectIsAuthenticated } from "../../store/slices/authSlice";
import { APISwapRequest, APISchedule, APIShift } from "../../apiServiceTypes"; 
// import styles from './SwapRequestTable.module.css'; // Removed problematic import

const ReceivedSwapRequests: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const receivedSwaps = useAppSelector(selectReceivedSwapRequests);
  const isLoading = useAppSelector(selectIsLoadingMyRequests);
  const error = useAppSelector(selectLoadMyRequestsError);

  useEffect(() => {
    if (isAuthenticated && currentUser?._id) {
      dispatch(fetchMyReceivedRequests()); 
    }
    return () => {
      dispatch(clearSwapErrors());
    };
  }, [dispatch, isAuthenticated, currentUser?._id]);

  const formatTime = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { timeZone: 'Asia/Amman', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyle = (status?: APISwapRequest['status']): React.CSSProperties => {
    switch (status?.toLowerCase()) {
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
      case "queued":
      case "matching":
          return { backgroundColor: "lightblue", color: "black"};
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

  if (!isAuthenticated) {
    return <p>You need to log in to view swap requests.</p>;
  }

  if (isLoading) {
    return <p className="loading-message">Loading your relevant swap requests...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div className="swap-table-container"> {/* Using generic class name */}
      <h2 className="table-title">Incoming & Actionable Swaps</h2>
      {receivedSwaps.length > 0 ? (
        <table className="swap-table"> {/* Using generic class name */}
          <thead>
            <tr>
              <th>Initiator</th>
              <th>Their Offered Shift</th>
              <th>Your Role / Your Shift Involved</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {receivedSwaps.map((swap: APISwapRequest) => {
              const isCurrentUserTheRequester = typeof swap.requester === 'object' ? swap.requester._id === currentUser?._id : swap.requester === currentUser?._id;
              
              return (
                <tr key={swap._id}>
                  <td>{typeof swap.requester === 'object' ? swap.requester.username : 'N/A'}</td>
                  <td>
                    {getShiftDisplay(swap.offeredShiftDetail, swap.offeredShiftScheduleId)}
                  </td>
                  <td>
                    {swap.recipientUserId && typeof swap.recipientUserId === 'object' && swap.recipientUserId._id === currentUser?._id ? 
                        `You would take: ${getShiftDisplay(swap.offeredShiftDetail, swap.offeredShiftScheduleId)} (From ${typeof swap.requester === 'object' ? swap.requester.username : 'User'})` 
                        : (swap.matchedSwapRequestId && !isCurrentUserTheRequester && swap.recipientOfferedShiftDetail ? 
                            `You offered: ${getShiftDisplay(swap.recipientOfferedShiftDetail, swap.recipientOfferedShiftScheduleId)}`
                            : "N/A")
                    }
                  </td>
                  <td>{formatTime(swap.createdAt)}</td>
                  <td style={getStatusStyle(swap.status)}>{swap.status || "N/A"}</td>
                  <td>
                    { (swap.status === "match_found_pending_confirmation" || swap.status === "confirmed_by_one") &&
                      ((typeof swap.requester === 'object' && swap.requester._id !== currentUser?._id) || 
                       (swap.recipientUserId && typeof swap.recipientUserId === 'object' && swap.recipientUserId._id === currentUser?._id)) 
                       ? <button onClick={() => { alert(`Navigate to lobby/detail for swap ID: ${swap._id} (or matched ID: ${swap.matchedSwapRequestId || swap._id})`);}} className="custom-btn custom-btn-info">View/Respond</button>
                       : (swap.status === "admin_approval_pending" && swap.recipientUserId && typeof swap.recipientUserId === 'object' && swap.recipientUserId._id === currentUser?._id) 
                       ? "Pending Admin Approval (You Accepted Suggestion)"
                       : "No action needed here"
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No swap requests requiring your attention or where you are a party.</p>
      )}
    </div>
  );
};

export default ReceivedSwapRequests;
