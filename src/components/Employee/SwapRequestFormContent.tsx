import React, { FormEvent, ChangeEvent } from "react";
import { APIShift, BackendUser } from "../../apiServiceTypes"; // APIShift is needed
import Button from "../common/Button/Button";
import styles from './SwapRequestFormContent.module.css';

// Re-define SwapFormData here or import from parent if it's shared and complex enough
interface SwapFormData {
  weekSelection: 'week1' | 'week2' | 'both' | ''; 
  offeredShiftId: string; 
  offeredShiftScheduleId: string; 
  message?: string; 
}

interface WeekOption {
    label: string;
    value: 'week1' | 'week2' | 'both';
    year?: number;
    weekNum?: number;
}

export interface SwapRequestFormContentProps { // Exporting for parent component
  formData: SwapFormData;
  weekOptions: WeekOption[];
  availableShiftsToOffer: (APIShift & { scheduleId: string; scheduleWeek: number })[]; // Shifts from user's own schedule
  handleFormChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  // user?: BackendUser | null; // Removed if not directly used for display here
}

const SwapRequestFormContent: React.FC<SwapRequestFormContentProps> = ({
  formData,
  weekOptions,
  availableShiftsToOffer,
  handleFormChange,
  handleSubmit,
  isLoading,
}) => {

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Week Selection Dropdown */}
      <div className={styles.formGroup}>
        <label htmlFor="weekSelection" className={styles.label}>Select Week(s):</label>
        <select
          id="weekSelection"
          name="weekSelection"
          value={formData.weekSelection}
          onChange={handleFormChange}
          required
          className={styles.selectField}
        >
          <option value="">--Select Week Option--</option>
          {weekOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Offered Shift Selection Dropdown */}
      {formData.weekSelection && ( // Only show if a week option is selected
        <div className={styles.formGroup}>
          <label htmlFor="offeredShiftId" className={styles.label}>Select Your Shift to Offer:</label>
          {availableShiftsToOffer.length > 0 ? (
            <select
              id="offeredShiftId"
              name="offeredShiftId"
              value={formData.offeredShiftId}
              onChange={handleFormChange}
              required
              className={styles.selectField}
            >
              <option value="">--Select Your Shift--</option>
              {availableShiftsToOffer.map((shift) => (
                <option key={shift._id} value={shift._id}>
                  {`Week ${Math.floor(shift.scheduleWeek / 100)}/${shift.scheduleWeek % 100}: ${shift.dayOfWeek} ${shift.startTime} - ${shift.endTime}`}
                </option>
              ))}
            </select>
          ) : (
            <p className={styles.noSchedulesMessage}>
              {formData.weekSelection ? "No swappable shifts available for the selected week(s)." : "Please select a week option first."}
            </p>
          )}
        </div>
      )}

      {/* Optional Message Textarea */}
      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>Optional Message:</label>
        <textarea
          id="message"
          name="message"
          value={formData.message || ''}
          onChange={handleFormChange}
          rows={3}
          className={styles.textareaField}
        />
      </div>
      
      <div className={styles.submitButtonContainer}>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !formData.offeredShiftId || !formData.weekSelection}
        >
          {isLoading ? "Submitting..." : "Submit Swap Request to Queue"}
        </Button>
      </div>
    </form>
  );
};

export default SwapRequestFormContent;