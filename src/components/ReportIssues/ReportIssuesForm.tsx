import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
    submitNewIssueThunk, 
    selectIsSubmittingIssue, 
    selectSubmitIssueError, 
    selectLastIssueSubmitSuccess,
    resetSubmitStatus 
} from '../../store/slices/reportIssuesSlice';
import { SubmitIssuePayload } from '../../store/slices/reportIssuesSlice';
import Button from '../common/Button/Button'; // Import Button component
import styles from './ReportIssuesForm.module.css'; // Import CSS Module

interface ReportIssueFormData {
  title: string;
  description: string;
  category: 'bug' | 'feature_request' | 'ui_ux' | 'other';
}

const initialFormData: ReportIssueFormData = {
  title: '',
  description: '',
  category: 'bug', // Default category
};

const ReportIssuesForm: React.FC = () => {
  const [formData, setFormData] = useState<ReportIssueFormData>(initialFormData);
  const [message, setMessage] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  // const currentUser = useAppSelector(selectCurrentUser); // For reportedBy if needed on frontend
  const isSubmitting = useAppSelector(selectIsSubmittingIssue);
  const submitError = useAppSelector(selectSubmitIssueError);
  const lastSubmitSuccess = useAppSelector(selectLastIssueSubmitSuccess);

  useEffect(() => {
    if (lastSubmitSuccess) {
      setMessage('Issue reported successfully!');
      setFormData(initialFormData); // Reset form
      dispatch(resetSubmitStatus());
    }
  }, [lastSubmitSuccess, dispatch]);

  useEffect(() => {
    if (submitError) {
      setMessage(`Error: ${submitError}`);
    }
  }, [submitError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null); // Clear message on new input
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    dispatch(resetSubmitStatus());

    if (!formData.title || !formData.description) {
        setMessage("Title and description are required.");
        return;
    }

    const payload: SubmitIssuePayload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
    };
    dispatch(submitNewIssueThunk(payload));
  };

  // Inline style objects removed, classes will be used from App.css

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h3 className={styles.formTitle}>Report an Issue</h3>
      {message && (
        <p className={`${styles.message} ${submitError ? styles.messageError : styles.messageSuccess}`}>
          {message}
        </p>
      )}
      
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className={styles.inputField}
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category" className={styles.label}>Category:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className={styles.selectField}
          disabled={isSubmitting}
        >
          <option value="bug">Bug Report</option>
          <option value="feature_request">Feature Request</option>
          <option value="ui_ux">UI/UX Feedback</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>Description:</label>
        <textarea
          id="description"
          name="description"
          placeholder='Describe the issue in as much detail as possible'
          value={formData.description}
          onChange={handleChange}
          required
          rows={5}
          className={styles.textareaField}
          disabled={isSubmitting}
        />
      </div>
      <div className={styles.submitButtonContainer}>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
};

export default ReportIssuesForm;