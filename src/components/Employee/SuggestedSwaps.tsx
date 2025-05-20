import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchSuggestedShifts,
  acceptSuggestion,
  selectSuggestedShifts,
  selectIsLoadingSuggestions,
  selectLoadSuggestionsError, // Now this selector should exist
  selectIsAcceptingSuggestion,
  selectAcceptSuggestionError,
  clearSwapErrors,
} from '../../store/slices/swapSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { APISwapRequest, APIShift, APISchedule } from '../../apiServiceTypes';
import LoadingMessage from '../common/LoadingMessage';
import ErrorMessage from '../common/ErrorMessage';
// import styles from './SuggestedSwaps.module.css'; 

const SuggestedSwaps: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser); // Used for logging, not in payload
  const suggestedShifts = useAppSelector(selectSuggestedShifts);
  const isLoading = useAppSelector(selectIsLoadingSuggestions);
  const error = useAppSelector(selectLoadSuggestionsError);
  const isAccepting = useAppSelector(selectIsAcceptingSuggestion);
  const acceptError = useAppSelector(selectAcceptSuggestionError);

  useEffect(() => {
    dispatch(fetchSuggestedShifts());
    return () => {
      dispatch(clearSwapErrors()); 
    };
  }, [dispatch]);

  const handleAcceptSuggestion = (swapId: string) => {
    if (!currentUser?._id) {
      console.error("User not logged in, cannot accept suggestion.");
      // Optionally, dispatch an action to show a UI error/notification
      return;
    }
    // acceptingUserId is not needed in the payload as backend uses req.user.id
    dispatch(acceptSuggestion({ swapId })) 
      .unwrap()
      .then((result) => {
        console.log('Suggestion accepted successfully, server response:', result);
        // TODO: Navigate to matchmaking lobby or show success message
        // The accepted suggestion should ideally be removed from this list
        // either by re-fetching or via a WebSocket update that modifies 'suggestedShifts'
        // or 'myActiveRequest' / 'pendingMatchDetails' in swapSlice.
        dispatch(fetchSuggestedShifts()); // Re-fetch for now
      })
      .catch((err) => {
        console.error('Failed to accept suggestion:', err);
        // Error is already in acceptError selector, no need to set local state
      });
  };

  const getShiftDisplay = (shiftDetail?: APIShift, schedule?: string | APISchedule): string => {
    if (!shiftDetail) return "Shift details N/A";
    let weekInfo = "";
    if (schedule && typeof schedule !== 'string' && schedule.week) {
        weekInfo = `(W${schedule.week % 100})`;
    }
    return `${shiftDetail.dayOfWeek} ${shiftDetail.startTime}-${shiftDetail.endTime} ${weekInfo}`;
  };

  if (isLoading) {
    return <LoadingMessage message="Loading suggested shifts..." />;
  }

  if (error) {
    return <ErrorMessage message={`Error loading suggestions: ${error}`} />;
  }

  return (
    <div className="suggested-swaps-container"> {/* TODO: Replace with styles.container */}
      <h2 className="suggested-swaps-title">Suggested Shifts for You</h2>
      {acceptError && <ErrorMessage message={`Error accepting suggestion: ${acceptError}`} />}
      {suggestedShifts.length === 0 && !isLoading && (
        <p>No suggested shifts available at the moment. Check back later!</p>
      )}
      {suggestedShifts.map((suggestion: APISwapRequest) => (
        <div key={suggestion._id} className="suggestion-card" style={{border: '1px solid #eee', padding: '10px', margin: '10px'}}> {/* TODO: Replace with styles.card */}
          <h4>Shift Offered by: {typeof suggestion.requester === 'object' ? suggestion.requester.username : 'Unknown User'}</h4>
          <p><strong>Skill:</strong> {suggestion.skill || 'N/A'}</p>
          <p><strong>Organizational Unit:</strong> {suggestion.marketPlace || 'N/A'}</p>
          <p>
            <strong>Offered Shift:</strong> 
            {getShiftDisplay(suggestion.offeredShiftDetail, suggestion.offeredShiftScheduleId)}
          </p>
          <p><em>Message: {suggestion.message || 'No message.'}</em></p>
          <button 
            onClick={() => handleAcceptSuggestion(suggestion._id)}
            disabled={isAccepting}
            className="accept-suggestion-button" // TODO: Replace with styles.button
            style={{padding: '8px 12px', cursor: 'pointer'}}
          >
            {isAccepting ? 'Accepting...' : 'Accept This Shift'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SuggestedSwaps;