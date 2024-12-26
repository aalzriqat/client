import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadSchedule, clearUploadError, clearDuplicateData } from "../../redux/modules/admin";
import useLocalStorage from "../hooks/useLocalStorage"; // Import the custom hook

const UploadSchedule = () => {
  const [file, setFile] = useLocalStorage('uploadFile', null); // Use useLocalStorage for file
  const dispatch = useDispatch();
  
  const uploadProgress = useSelector((state) => state.admin.uploadProgress || 0);
  const loading = useSelector((state) => state.admin.loading?.upload || false);
  const message = useSelector((state) => state.admin.schedules?.message || ''); 
  const error = useSelector((state) => state.admin.error); 
  const duplicateData = useSelector((state) => state.admin.duplicateData || []);

  useEffect(() => {
    return () => {
      dispatch(clearUploadError());
      dispatch(clearDuplicateData());
    };
  }, [dispatch]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    dispatch(clearUploadError());
    dispatch(clearDuplicateData());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await dispatch(uploadSchedule(formData));
    } catch (err) {
      console.error("An error occurred during the upload. Please try again.");
    }
  };

  // Function to render duplicate data in a table
  const renderDuplicateTable = (duplicates) => {
    if (duplicates.length > 0) {
      return (
        <div>
          <h3>Duplicate Schedules</h3>
          <table className="duplicate-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {duplicates.map((duplicate, index) => (
                <tr key={index}>
                  <td>{duplicate.username}</td>
                  <td>Schedule for week {duplicate.week} has already been uploaded previously</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="main upload-container">
      <div className="description">
        <h2>Schedule Uploader Instructions</h2>
        <ul>
          <li>Select a file to upload by clicking the "Choose File" button.</li>
          <li>Ensure the file is in the correct format ('.xlsx', '.xls').</li>
          <li>Click the "Upload" button to start the upload process.</li>
          <li>Wait for the upload to complete. You will see a progress bar indicating the upload status.</li>
          <li>If there are any errors, they will be displayed in a table below the form.</li>
          <li>Once the upload is complete, a success message will be displayed & the schedules will be shared with the employees over email.</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="form1">
        <label htmlFor="file-input">
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            className="file-label"
          />
        </label>
        <button
          className="btn btn-primary upload-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {message && <p className="upload-message">{message}</p>}
      {renderDuplicateTable(duplicateData)}

      {uploadProgress > 0 && (
        <div className="progress">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${uploadProgress}%` }}
            aria-valuenow={uploadProgress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {uploadProgress}%
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSchedule;