import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
    uploadScheduleThunk, 
    selectIsUploadingSchedule, 
    selectScheduleUploadError, 
    selectLastScheduleUploadSuccess,
    resetAdminScheduleUploadStatus,
    clearAdminScheduleError // To clear general fetch errors if any, though upload has its own
} from "../../store/slices/adminScheduleSlice";
import Button from "../common/Button/Button"; // Import Button component
import styles from './UploadSchedule.module.css'; // Import CSS Module

const UploadSchedule: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null); // For client-side validation errors
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  
  const isUploading = useAppSelector(selectIsUploadingSchedule);
  const uploadError = useAppSelector(selectScheduleUploadError); 
  const lastUploadSuccess = useAppSelector(selectLastScheduleUploadSuccess);

  useEffect(() => {
    // Clear status messages when component unmounts or on new upload attempt
    return () => {
      dispatch(resetAdminScheduleUploadStatus());
      // dispatch(clearAdminScheduleError()); // If there are other errors to clear from this slice
    };
  }, [dispatch]);

  useEffect(() => {
    if (lastUploadSuccess) {
      setSuccessMessage("Schedule uploaded successfully!");
      setFile(null); // Clear the file input
      // Consider resetting form or file input visually if needed
      dispatch(resetAdminScheduleUploadStatus()); // Reset success flag after showing message
    }
  }, [lastUploadSuccess, dispatch]);

  useEffect(() => {
    if (uploadError) {
        setLocalError(null); // Clear local error if API error occurs
        setSuccessMessage(null);
    }
  }, [uploadError]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalError(null); // Clear previous local errors
    setSuccessMessage(null); // Clear success message
    dispatch(resetAdminScheduleUploadStatus()); // Reset API status

    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      // Basic file type validation (optional, backend should also validate)
      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.csv']; // Add .csv if supported
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
          setLocalError('Invalid file type. Please upload an Excel (.xls, .xlsx) or CSV file.');
          setFile(null);
          return;
      }
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!file) {
      setLocalError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // Backend must be configured to handle "file" key

    // The apiService.uploadScheduleDataAdmin expects 'data' if not FormData
    // If backend directly consumes FormData with 'file' key, this is fine.
    // Otherwise, if it expects a JSON payload with file content (e.g. base64 or parsed CSV text),
    // then file reading and transformation would be needed here before dispatching.
    // For now, assuming backend handles FormData with a 'file' field.
    dispatch(uploadScheduleThunk(formData));
  };

  // The renderErrorTable function for complex error objects might need adjustment
  // if the backend error structure changes. For now, uploadError is a string.
  // const renderErrorTable = (errorDetail: any) => { ... }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentCard}>
        <div className={styles.instructionsSection}>
          <h2 className={styles.instructionsTitle}>Schedule Uploader Instructions</h2>
          <ul className={styles.instructionsList}>
            <li className={styles.instructionsListItem}>Select a file to upload (Excel .xlsx, .xls, or .csv).</li>
            <li className={styles.instructionsListItem}>Click the "Upload Schedule" button.</li>
            <li className={styles.instructionsListItem}>Status messages will appear below.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div> {/* Added div for better label-input grouping if needed */}
            <label htmlFor="file-input" className={styles.formLabel}>Choose schedule file:</label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className={styles.fileInput}
              accept=".xlsx,.xls,.csv"
            />
          </div>
          <div className={styles.submitButtonContainer}>
            <Button
              variant="primary"
              type="submit"
              disabled={isUploading || !file}
              size="large"
            >
              {isUploading ? "Uploading..." : "Upload Schedule"}
            </Button>
          </div>
        </form>

        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        {localError && <p className={styles.errorMessage}>{localError}</p>}
        {uploadError && <p className={styles.errorMessage}>Upload failed: {uploadError}</p>}
      </div>
    </div>
  );
};

export default UploadSchedule;