import React, { useEffect, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
    submitNewSwapRequest, 
    selectIsCreatingSwap, 
    selectCreateSwapError,
    clearSwapErrors 
} from "../../store/slices/swapSlice";
import { 
    fetchEmployeeSchedule, 
    selectEmployeeSchedules as selectMySchedules, 
    selectEmployeeScheduleLoading as selectMyScheduleLoading 
} from "../../store/slices/employeeScheduleSlice";
import { selectCurrentUser } from "../../store/slices/authSlice";
import SwapRequestFormContent, { SwapRequestFormContentProps } from "./SwapRequestFormContent"; // Import props type
import LoadingMessage from "../common/LoadingMessage"; 
import ErrorMessage from "../common/ErrorMessage"; 
import { CreateSwapRequestPayload, APISchedule, APIShift } from "../../apiServiceTypes"; 
import styles from './SwapRequestForm.module.css';

interface SwapFormData {
  weekSelection: 'week1' | 'week2' | 'both' | ''; 
  offeredShiftId: string; 
  offeredShiftScheduleId: string; 
  message?: string; 
}

// Define the structure for weekOptions items more strictly
interface WeekOption {
    label: string;
    value: 'week1' | 'week2' | 'both';
    year?: number; // Optional for 'both'
    weekNum?: number; // Optional for 'both'
}

const SwapRequestForm: React.FC = () => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectCurrentUser);
  const mySchedules = useAppSelector(selectMySchedules); 
  const isLoadingMySchedules = useAppSelector(selectMyScheduleLoading);
  
  const isCreatingSwap = useAppSelector(selectIsCreatingSwap);
  const createSwapError = useAppSelector(selectCreateSwapError);

  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<SwapFormData>({
    weekSelection: '',
    offeredShiftId: '',
    offeredShiftScheduleId: '',
    message: ''
  });
  const [availableShiftsToOffer, setAvailableShiftsToOffer] = useState<(APIShift & { scheduleId: string; scheduleWeek: number })[]>([]);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null); // Stores the actual week number (e.g., 202520)

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchEmployeeSchedule(currentUser._id));
    }
  }, [dispatch, currentUser?._id]);

  const getCurrentWeekNumber = () => {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  const currentIsoWeek = getCurrentWeekNumber(); 
  const currentYear = new Date().getFullYear(); 
  
  const weekOptions: WeekOption[] = [ // Use the WeekOption interface
    { label: `Current Week (Week ${currentIsoWeek}, ${currentYear})`, value: 'week1', year: currentYear, weekNum: currentIsoWeek },
    { label: `Next Week (Week ${currentIsoWeek + 1}, ${currentYear})`, value: 'week2', year: currentYear, weekNum: currentIsoWeek + 1 },
    { label: 'Both Current & Next Week', value: 'both' } // year and weekNum are undefined here
  ];

  useEffect(() => {
    setFormValidationError(null);
    setSubmissionSuccess(false);
    dispatch(clearSwapErrors()); 
    
    let relevantSchedules: APISchedule[] = [];
    let targetWeekNum: number | null = null;

    const week1Opt = weekOptions.find(opt => opt.value === 'week1');
    const week2Opt = weekOptions.find(opt => opt.value === 'week2');

    if (formData.weekSelection === 'week1' && week1Opt?.weekNum !== undefined) {
        targetWeekNum = week1Opt.weekNum;
    } else if (formData.weekSelection === 'week2' && week2Opt?.weekNum !== undefined) {
        targetWeekNum = week2Opt.weekNum;
    }

    if (targetWeekNum !== null) {
        const yearForTargetWeek = new Date().getFullYear(); 
        const fullWeekIdentifier = yearForTargetWeek * 100 + targetWeekNum;
        const scheduleForSelectedWeek = mySchedules.find(s => s.week === fullWeekIdentifier);
        if (scheduleForSelectedWeek) {
            relevantSchedules.push(scheduleForSelectedWeek);
            setFormData(prev => ({...prev, offeredShiftScheduleId: scheduleForSelectedWeek._id}));
            setSelectedWeekNumber(scheduleForSelectedWeek.week);
        } else {
            setFormData(prev => ({...prev, offeredShiftScheduleId: '', offeredShiftId: ''}));
            setSelectedWeekNumber(null);
        }
    } else if (formData.weekSelection === 'both') {
        if (week1Opt && week1Opt.year !== undefined && week1Opt.weekNum !== undefined) {
            const sched1 = mySchedules.find(s => s.week === (week1Opt.year! * 100 + week1Opt.weekNum!));
            if (sched1) relevantSchedules.push(sched1);
        }
        if (week2Opt && week2Opt.year !== undefined && week2Opt.weekNum !== undefined) {
            const sched2 = mySchedules.find(s => s.week === (week2Opt.year! * 100 + week2Opt.weekNum!));
            if (sched2) relevantSchedules.push(sched2);
        }
        setSelectedWeekNumber(null); 
    } else { 
        setFormData(prev => ({...prev, offeredShiftScheduleId: '', offeredShiftId: ''}));
        setSelectedWeekNumber(null);
    }

    const shiftsToOffer = relevantSchedules.flatMap(s => 
        s.shifts.filter(sh => sh.isSwappable).map(sh => ({...sh, scheduleId: s._id, scheduleWeek: s.week }))
    );
    setAvailableShiftsToOffer(shiftsToOffer);
    
    if (formData.weekSelection && formData.weekSelection !== 'both' && shiftsToOffer.length === 0 && relevantSchedules.length > 0) {
        setFormValidationError(`No swappable shifts found for the selected week.`);
    } else if (formData.weekSelection && formData.weekSelection !== 'both' && relevantSchedules.length === 0 && targetWeekNum !== null) {
        setFormValidationError(`No schedule found for the selected week (Year: ${new Date().getFullYear()}, Week: ${targetWeekNum}).`);
    }

  }, [formData.weekSelection, mySchedules, dispatch]); 

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubmissionSuccess(false); 
    dispatch(clearSwapErrors()); 
    setFormValidationError(null); 

    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'weekSelection') { 
        setFormData(prev => ({ ...prev, offeredShiftId: '', offeredShiftScheduleId: '' }));
    }

    if (name === 'offeredShiftId' && value !== '') {
        const selectedShift = availableShiftsToOffer.find(s => s._id === value);
        if (selectedShift) {
            setFormData(prev => ({ ...prev, offeredShiftScheduleId: selectedShift.scheduleId }));
            setSelectedWeekNumber(selectedShift.scheduleWeek);
        }
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => { 
      e.preventDefault();
      setFormValidationError(null);
      setSubmissionSuccess(false);
      dispatch(clearSwapErrors());

      if (!currentUser?._id) {
        setFormValidationError("User not authenticated.");
        return;
      }
      if (!formData.weekSelection) {
        setFormValidationError("Please select a week option.");
        return;
      }
      if (!formData.offeredShiftId) {
        setFormValidationError("Please select one of your shifts to offer.");
        return;
      }
      if (!formData.offeredShiftScheduleId) {
          setFormValidationError("Could not determine the schedule for the offered shift. Please re-select week/shift.");
          return;
      }

      const payload: CreateSwapRequestPayload = {
        offeredShiftId: formData.offeredShiftId,
        offeredShiftScheduleId: formData.offeredShiftScheduleId,
        weekSelection: formData.weekSelection as 'week1' | 'week2' | 'both', 
        message: formData.message,
      };
      
      const resultAction = await dispatch(submitNewSwapRequest(payload));
      if (submitNewSwapRequest.fulfilled.match(resultAction)) {
        setSubmissionSuccess(true);
        setFormData({ weekSelection: '', offeredShiftId: '', offeredShiftScheduleId: '', message: '' });
        setAvailableShiftsToOffer([]);
        setSelectedWeekNumber(null);
      }
    },
    [formData, currentUser, dispatch] 
  );
  
  useEffect(() => {
    if (createSwapError) {
      setFormValidationError(createSwapError); 
    }
  }, [createSwapError]);

  if (isLoadingMySchedules) {
    return <LoadingMessage message="Loading your schedule data..." />;
  }

  // Props for SwapRequestFormContent will be adjusted once its interface is defined/read
  const formContentProps: SwapRequestFormContentProps = {
      formData,
      weekOptions,
      availableShiftsToOffer,
      handleFormChange,
      handleSubmit,
      isLoading: isCreatingSwap,
      // selectedWeekForShiftDisplay: selectedWeekNumber, // This might be handled internally by SwapRequestFormContent
  };

  return (
    <div className={styles.swapRequestContainer}>
      <h2 className={styles.formTitle}>Offer a Shift for Swap</h2>
      
      <SwapRequestFormContent {...formContentProps} />

      {formValidationError && <ErrorMessage className={styles.errorMessage} message={formValidationError} />}
      {submissionSuccess && !createSwapError && !formValidationError && (
        <p className={styles.successMessage}>
          Swap Request Submitted to Matchmaking Queue!
        </p>
      )}
    </div>
  );
};

export default SwapRequestForm;
