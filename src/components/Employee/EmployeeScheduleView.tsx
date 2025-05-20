import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
    fetchEmployeeSchedule, 
    selectEmployeeSchedules, 
    selectEmployeeScheduleLoading, 
    selectEmployeeScheduleError, 
    toggleScheduleSwapAvailability, // Corrected import name
    selectIsUpdatingSwap, 
    selectUpdateSwapError 
} from '../../store/slices/employeeScheduleSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { APISchedule, APIShift } from '../../apiServiceTypes'; // Use APISchedule and APIShift

const EmployeeScheduleView: React.FC = () => {
  const dispatch = useAppDispatch();
  const schedules = useAppSelector(selectEmployeeSchedules); // This is APISchedule[]
  const isLoading = useAppSelector(selectEmployeeScheduleLoading);
  const error = useAppSelector(selectEmployeeScheduleError);
  const currentUser = useAppSelector(selectCurrentUser);

  const isUpdatingSwap = useAppSelector(selectIsUpdatingSwap);
  // const updateSwapError = useAppSelector(selectUpdateSwapError);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchEmployeeSchedule(currentUser._id));
    }
  }, [dispatch, currentUser?._id]);

  const handleToggleSwapAvailabilityOnSchedule = (scheduleId: string, currentAvailability: boolean | undefined) => {
    if (currentUser?._id) {
      // This thunk toggles the isOpenForSwap flag on the APISchedule document itself
      dispatch(toggleScheduleSwapAvailability({ scheduleId, isAvailableForSwap: !currentAvailability }));
    }
  };

  // TODO: Implement a function to toggle isSwappable on individual APIShift within an APISchedule
  // This would require a new API endpoint and a new Redux thunk.
  // const handleToggleShiftSwappable = (scheduleId: string, shiftId: string, currentIsSwappable: boolean) => { ... }

  if (isLoading) {
    return <div>Loading schedule...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error loading schedule: {error}</div>;
  }

  if (!schedules || schedules.length === 0) {
    return <div>No schedule found for the current period.</div>;
  }

  return (
    <div>
      <h2>My Schedule</h2>
      {schedules.map((scheduleDoc: APISchedule) => ( // Iterate over APISchedule documents
        <div key={scheduleDoc._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <p>
            <strong>Week:</strong> {scheduleDoc.week} 
            (Skill: {scheduleDoc.skill || 'N/A'}, Market: {scheduleDoc.marketPlace || 'N/A'})
          </p>
          <p>
            <strong>Schedule Open for Swap:</strong> {scheduleDoc.isOpenForSwap ? 'Yes' : 'No'}
            <button 
              onClick={() => handleToggleSwapAvailabilityOnSchedule(scheduleDoc._id, scheduleDoc.isOpenForSwap)}
              disabled={isUpdatingSwap}
              style={{ marginLeft: '10px' }}
            >
              {isUpdatingSwap ? 'Updating...' : (scheduleDoc.isOpenForSwap ? 'Make Entire Week Unavailable' : 'Make Entire Week Available')}
            </button>
          </p>
          <h4>Shifts for this week:</h4>
          {scheduleDoc.shifts && scheduleDoc.shifts.length > 0 ? (
            scheduleDoc.shifts.map((shift: APIShift) => (
              <div key={shift._id} style={{ borderTop: '1px dashed #eee', marginTop: '5px', paddingTop: '5px'}}>
                <p>{shift.dayOfWeek}: {shift.startTime} - {shift.endTime} {shift.shiftType ? `(${shift.shiftType})` : ''}</p>
                <p>
                  Swappable: {shift.isSwappable ? 'Yes' : 'No'}
                  {/* Button to toggle individual shift swappability - needs new thunk/API */}
                  {/* 
                  <button 
                    onClick={() => handleToggleShiftSwappable(scheduleDoc._id, shift._id, shift.isSwappable)} 
                    disabled={isUpdatingSwap} style={{marginLeft: '5px'}}
                  >
                    Toggle Shift Swappable
                  </button> 
                  */}
                </p>
              </div>
            ))
          ) : (
            <p>No shifts defined for this week.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default EmployeeScheduleView;