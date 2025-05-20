import React, { useState, useEffect, FormEvent, ChangeEvent, useMemo } from "react"; // Added useMemo
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMyPreferences,
  saveMyPreferences, // For create
  updateMyPreferencesThunk, // For update
  selectMyPreference,
  selectPreferenceLoading,
  selectPreferenceError,
  selectPreferenceIsSaving,
  selectPreferenceSaveError,
  selectPreferenceLastSaveSuccess,
  resetPreferenceSaveStatus,
  clearPreferenceError,
} from "../../store/slices/preferenceSlice";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { EmployeePreferenceData, UpdateEmployeePreferencePayload, EmployeePreferenceRecord } from "../../apiServiceTypes";
import LoadingMessage from "../common/LoadingMessage";
import ErrorMessage from "../common/ErrorMessage";
import Button from "../common/Button/Button"; // Import Button component
import styles from './PreferenceForm.module.css'; // Import CSS Module

interface PreferenceFormData {
  preferredShift: string;
  preferredDaysOff: string;
  week: number | string; // Allow string for initial empty value from select
  notes?: string;
  unavailability?: string;
  // OU is not part of EmployeePreferenceData
}

const initialFormState: PreferenceFormData = {
  preferredShift: "",
  preferredDaysOff: "",
  week: "", // Initial empty string for select
  notes: "",
  unavailability: "",
};

const PreferenceForm: React.FC = () => {
  const [formData, setFormData] = useState<PreferenceFormData>(initialFormState);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const myPreferencesArray = useAppSelector(selectMyPreference); // This is now EmployeePreferenceRecord[]
  const isLoading = useAppSelector(selectPreferenceLoading);
  const fetchError = useAppSelector(selectPreferenceError);
  const isSaving = useAppSelector(selectPreferenceIsSaving);
  const saveError = useAppSelector(selectPreferenceSaveError);
  const lastSaveSuccess = useAppSelector(selectPreferenceLastSaveSuccess);

  const getCurrentWeekNumber = (): number => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((currentDate.getDay() + 1 + days) / 7);
  };

  const [selectedWeek, setSelectedWeek] = useState<number | string>(getCurrentWeekNumber());

  // Memoize the preference for the currently selected week
  const preferenceForSelectedWeek = useMemo(() => {
    if (!selectedWeek || isNaN(Number(selectedWeek))) return undefined;
    return myPreferencesArray.find(p => p.week === Number(selectedWeek));
  }, [myPreferencesArray, selectedWeek]);

  useEffect(() => {
    if (currentUser?._id) {
      // fetchMyPreferences now takes no arguments
      dispatch(fetchMyPreferences());
    }
    return () => {
        dispatch(resetPreferenceSaveStatus());
        dispatch(clearPreferenceError());
    };
  }, [dispatch, currentUser?._id]);

  useEffect(() => {
    // Populate form based on preferenceForSelectedWeek
    if (preferenceForSelectedWeek) {
      setFormData({
        preferredShift: preferenceForSelectedWeek.preferredShift || "",
        preferredDaysOff: preferenceForSelectedWeek.preferredDaysOff || "",
        week: preferenceForSelectedWeek.week,
        notes: preferenceForSelectedWeek.notes || "",
        unavailability: preferenceForSelectedWeek.unavailability || "",
      });
    } else {
      // Reset form but keep the selectedWeek from the dropdown
      setFormData({...initialFormState, week: selectedWeek });
    }
  }, [preferenceForSelectedWeek, selectedWeek]);


  useEffect(() => {
    if (lastSaveSuccess) {
      setSubmissionMessage("Preferences saved successfully!");
      dispatch(resetPreferenceSaveStatus());
      if (currentUser?._id) { // Re-fetch to get the latest (created or updated)
        dispatch(fetchMyPreferences()); // No argument needed
      }
    }
    if (saveError) {
      setSubmissionMessage(`Failed to save preferences: ${saveError}`);
    }
  }, [lastSaveSuccess, saveError, dispatch, currentUser?._id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "week") {
        setSelectedWeek(value === "" ? "" : parseInt(value, 10));
        // When week changes, form data will be reset by the useEffect watching myPreference and selectedWeek
        // Or, explicitly reset other fields if desired:
        // setFormData(prev => ({ ...initialFormState, week: value === "" ? "" : parseInt(value, 10) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    setSubmissionMessage(null);
    dispatch(resetPreferenceSaveStatus());
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionMessage(null);
    dispatch(resetPreferenceSaveStatus());

    if (!currentUser?._id) {
      setSubmissionMessage("Cannot save preferences: User not identified.");
      return;
    }
    if (selectedWeek === "" || isNaN(Number(selectedWeek))) {
        setSubmissionMessage("Please select a valid week.");
        return;
    }
    const numericWeek = Number(selectedWeek);

    // Use preferenceForSelectedWeek to determine if updating or creating
    if (preferenceForSelectedWeek && preferenceForSelectedWeek._id) {
      const updatePayload: UpdateEmployeePreferencePayload = {
        preferredShift: formData.preferredShift,
        preferredDaysOff: formData.preferredDaysOff,
        notes: formData.notes,
        unavailability: formData.unavailability,
        // week: numericWeek, // The API for update in apiService now includes week
      };
      dispatch(updateMyPreferencesThunk({ preferenceId: preferenceForSelectedWeek._id, preferenceData: updatePayload }));
    } else {
      // Create new preference
      const createPayload: EmployeePreferenceData = {
        // user: currentUser._id, // Removed: Backend derives user from token
        week: numericWeek,
        preferredShift: formData.preferredShift,
        preferredDaysOff: formData.preferredDaysOff,
        notes: formData.notes || "",
        unavailability: formData.unavailability || "",
      };
      dispatch(saveMyPreferences(createPayload));
    }
  };

  const generateWeekOptions = (): number[] => {
    const currentW = getCurrentWeekNumber();
    const weeks: number[] = [];
    for (let i = 0; i < 10; i++) { weeks.push(currentW + i); }
    return weeks;
  };
  const weekOptions = useMemo(generateWeekOptions, []);


  // Adjusted loading/error display logic
  if (isLoading && myPreferencesArray.length === 0) {
    return <LoadingMessage message="Loading preferences..." />;
  }
  if (fetchError && myPreferencesArray.length === 0) {
    return <ErrorMessage message={`Error loading preferences: ${fetchError}`} />;
  }

  return (
    <div className={styles.preferenceFormContainer}>
      <div className={styles.formWrapper}>
        <p className={styles.formTitle}>My Preferences</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="week" className={styles.label}>Week:</label>
            <select
              id="week"
              name="week"
              value={selectedWeek}
              onChange={handleChange}
              required
              className={styles.selectField}
            >
              <option value="" disabled>Select a week</option>
              {weekOptions.map((weekNum: number) => (
                <option key={weekNum} value={weekNum}>
                  Week {weekNum}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="preferredShift" className={styles.label}>Preferred Shift:</label>
            <select id="preferredShift" name="preferredShift" value={formData.preferredShift} onChange={handleChange} className={styles.selectField}>
              <option value="">Any Shift</option>
              <option value="06:00-15:00">06:00-15:00</option>
              <option value="07:00-16:00">07:00-16:00</option>
              <option value="08:00-17:00">08:00-17:00</option>
              <option value="09:00-18:00">09:00-18:00</option>
              <option value="11:00-20:00">11:00-20:00</option>
              <option value="13:00-22:00">13:00-22:00</option>
              <option value="14:00-23:00">14:00-23:00</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="preferredDaysOff" className={styles.label}>Preferred Days Off Pattern:</label>
            <select id="preferredDaysOff" name="preferredDaysOff" value={formData.preferredDaysOff} onChange={handleChange} className={styles.selectField}>
              <option value="">Any Pattern</option>
              <option value="consecutive">Consecutive</option>
              <option value="split">Split</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="unavailability" className={styles.label}>Unavailability (e.g., specific dates, times):</label>
            <textarea id="unavailability" name="unavailability" value={formData.unavailability || ""} onChange={handleChange} rows={3} placeholder="List any specific times or dates you are unavailable" className={styles.textareaField} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>Additional Notes:</label>
            <textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleChange} rows={3} placeholder="Any other preferences or notes for the scheduler" className={styles.textareaField} />
          </div>
          
          <div className={styles.formActionsCentered}>
            <Button type="submit" variant="primary" disabled={isSaving || isLoading}>
              {isSaving ? "Saving..." : (preferenceForSelectedWeek?._id ? "Update Preferences" : "Save Preferences")}
            </Button>
          </div>
          {submissionMessage && (
            <p className={`${styles.submissionMessage} ${saveError ? styles.submissionMessageError : styles.submissionMessageSuccess}`}>
              {submissionMessage}
            </p>
          )}
          {fetchError && myPreferencesArray.length > 0 && (
            <p className={styles.fetchWarningMessage}>
              Note: Could not refresh preferences, displaying current data. Error: {fetchError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default PreferenceForm;