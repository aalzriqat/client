import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  selectMyActiveSwapRequest,
  selectPendingMatchDetails,
  selectIsLoadingMyActiveRequest,
  selectConfirmMatchError,
  selectRejectMatchError,
  fetchMySentRequests, 
  confirmActiveMatch,
  rejectActiveMatch,
  // selectCurrentUserId // Placeholder - assuming this selector exists in authSlice or similar
} from '../../store/slices/swapSlice'; // selectCurrentUserId would come from authSlice
import { APISwapRequest, BackendUser } from '../../apiServiceTypes'; 
// import styles from './MatchmakingLobby.module.css'; 

const MatchmakingLobby: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // TODO: Replace with actual selector from your auth slice
  const currentUserId = useSelector((state: RootState) => state.auth.user?._id); 

  const myActiveRequest = useSelector(selectMyActiveSwapRequest); // This is the request initiated by the current user, or one they are directly involved in as recipient.
  const pendingMatchDetails = useSelector(selectPendingMatchDetails); // If myActiveRequest is part of a pair, this is the *other* request.
  
  const isLoading = useSelector(selectIsLoadingMyActiveRequest);
  const confirmError = useSelector(selectConfirmMatchError);
  const rejectError = useSelector(selectRejectMatchError);

  useEffect(() => {
    if (currentUserId) { 
        dispatch(fetchMySentRequests()); // This should populate myActiveRequest if one exists
    }
  }, [dispatch, currentUserId]);

  const handleConfirm = () => {
    // User always confirms/rejects based on THEIR OWN request ID that's part of the match.
    // If myActiveRequest is the one they initiated, use its ID.
    // If myActiveRequest is the one they are responding to (i.e., they are recipientUserId of myActiveRequest),
    // they still act in context of the *pair*, and the backend expects one of the pair's IDs.
    // The `confirmActiveMatch` thunk in swapSlice expects the `swapId` of the request being acted upon.
    // Let's assume `myActiveRequest` is always the primary context for the current user's view of the match.
    if (myActiveRequest && window.confirm('Are you sure you want to confirm this swap?')) {
      dispatch(confirmActiveMatch({ swapId: myActiveRequest._id }));
    }
  };

  const handleReject = () => {
    if (myActiveRequest && window.confirm('Are you sure you want to reject this swap?')) {
      dispatch(rejectActiveMatch({ swapId: myActiveRequest._id }));
    }
  };

  if (isLoading) {
    return <div>Loading your matchmaking status...</div>;
  }

  if (!myActiveRequest) {
    return <div>You have no active swap request in the matchmaking queue.</div>;
  }

  const renderShiftDetails = (shiftDetail?: APISwapRequest['offeredShiftDetail'], schedule?: APISwapRequest['offeredShiftScheduleId']) => {
    if (!shiftDetail || !schedule || typeof schedule === 'string') {
      return <p>Shift details not fully available.</p>;
    }
    const scheduleUser = typeof schedule.user === 'string' ? schedule.user : schedule.user?.username;
    const scheduleInfo = scheduleUser ? ` (User: ${scheduleUser})` : '';
    return (
      <div>
        <p><strong>Shift:</strong> {shiftDetail.dayOfWeek} {shiftDetail.startTime} - {shiftDetail.endTime}</p>
        <p><strong>Week:</strong> {schedule.week}{scheduleInfo}</p>
      </div>
    );
  };
  
  const renderUserDetails = (user?: string | BackendUser) => {
    if (!user || typeof user === 'string') return <p>User ID: {user || 'N/A'}</p>;
    return (
        <div>
            <p><strong>User:</strong> {user.username} ({user.email})</p>
            <p><strong>Skill:</strong> {user.skill || 'N/A'}, <strong>OU:</strong> {user.marketPlace || 'N/A'}</p>
        </div>
    );
  };

  let iHaveConfirmed = false;
  let otherPartyHasConfirmed = false;
  const canConfirmOrReject = myActiveRequest.status === 'match_found_pending_confirmation' || myActiveRequest.status === 'confirmed_by_one';

  if (myActiveRequest && currentUserId) {
    const myRequestIsTheOneInitiatedByMe = typeof myActiveRequest.requester === 'object' && myActiveRequest.requester._id === currentUserId;

    if (myRequestIsTheOneInitiatedByMe) {
        iHaveConfirmed = myActiveRequest.status === 'confirmed_by_one';
        if (pendingMatchDetails) { // pendingMatchDetails is the other person's request
            otherPartyHasConfirmed = pendingMatchDetails.status === 'confirmed_by_one';
        }
    } else { // myActiveRequest is the one where I am the recipientUserId (the other person's request)
        // In this scenario, pendingMatchDetails should be my *original* request.
        iHaveConfirmed = pendingMatchDetails?.status === 'confirmed_by_one';
        otherPartyHasConfirmed = myActiveRequest.status === 'confirmed_by_one';
    }
  }


  return (
    <div className={/*styles.lobbyContainer*/ "lobby-container"}>
      <h2>Matchmaking Lobby</h2>
      
      {confirmError && <p className="error-message">Confirm Error: {confirmError}</p>}
      {rejectError && <p className="error-message">Reject Error: {rejectError}</p>}

      <div className={/*styles.myRequestDetails*/ "my-request-details"}>
        <h3>Your Active Context Request (ID: {myActiveRequest._id}):</h3>
        <p><strong>Status:</strong> {myActiveRequest.status}</p>
        {renderShiftDetails(myActiveRequest.offeredShiftDetail, myActiveRequest.offeredShiftScheduleId)}
        {renderUserDetails(myActiveRequest.requester)}
        {myActiveRequest.message && <p><strong>Message:</strong> {myActiveRequest.message}</p>}
      </div>

      { canConfirmOrReject && pendingMatchDetails && (
        <div className={/*styles.pendingMatch*/ "pending-match-details"}>
          <h3><span role="img" aria-label="sparkles">✨</span> Match Found! <span role="img" aria-label="sparkles">✨</span></h3>
          
          <div className={/*styles.matchComparison*/ "match-comparison"}>
            <div className={/*styles.yourOffer*/ "match-offer-panel"}>
              <h4>
                { (typeof myActiveRequest.requester === 'object' && myActiveRequest.requester._id === currentUserId) ? "You Offer:" : `User ${ (typeof myActiveRequest.requester === 'object' && myActiveRequest.requester.username) || 'N/A'} Offers:`}
              </h4>
              {renderShiftDetails(myActiveRequest.offeredShiftDetail, myActiveRequest.offeredShiftScheduleId)}
              {renderUserDetails(myActiveRequest.requester)}
            </div>
            <div className={/*styles.theirOffer*/ "match-offer-panel"}>
             <h4>
                { (typeof pendingMatchDetails.requester === 'object' && pendingMatchDetails.requester._id === currentUserId) ? "You Offer (This is your original request):" : `User ${ (typeof pendingMatchDetails.requester === 'object' && pendingMatchDetails.requester.username) || 'N/A'} Offers:`}
              </h4>
              {renderShiftDetails(pendingMatchDetails.offeredShiftDetail, pendingMatchDetails.offeredShiftScheduleId)}
              {renderUserDetails(pendingMatchDetails.requester)}
            </div>
          </div>
            
          <>
            {!iHaveConfirmed && (
              <button onClick={handleConfirm} className={/*styles.confirmButton*/ "confirm-button"}>
                  Confirm Swap
              </button>
            )}
            {iHaveConfirmed && <p><strong>You have confirmed.</strong></p>}
            
            {otherPartyHasConfirmed && <p>The other party has confirmed.</p>}
            {!otherPartyHasConfirmed && <p>Waiting for the other party to confirm.</p>}

            <button onClick={handleReject} className={/*styles.rejectButton*/ "reject-button"}>
                Reject Swap
            </button>
          </>
        </div>
      )}

      {myActiveRequest.status === 'queued' && (
        <div className={/*styles.searching*/ "searching-animation"}>
          <p>Searching for compatible matches...</p>
          <div className="spinner"></div> {}
        </div>
      )}
       {myActiveRequest.status === 'matching' && (
        <div className={/*styles.searching*/ "searching-animation"}>
          <p>Actively matching your request...</p>
          <div className="spinner"></div> {}
        </div>
      )}
      {myActiveRequest.status === 'approved' && <p className="success-message">This swap has been approved!</p>}
      {myActiveRequest.status === 'rejected_by_requester' && <p className="info-message">You rejected this match.</p>}
      {myActiveRequest.status === 'rejected_by_match' && <p className="info-message">The other party rejected this match. Your request may be re-queued.</p>}
      {myActiveRequest.status === 'cancelled_by_user' && <p className="info-message">You cancelled this swap request.</p>}
      {myActiveRequest.status === 'system_cancelled' && <p className="info-message">This swap request was cancelled by the system.</p>}

    </div>
  );
};

export default MatchmakingLobby;