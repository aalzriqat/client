import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
    postNewsThunk, 
    selectNewsIsPosting, 
    selectNewsPostError, 
    selectNewsLastPostSuccess,
    resetNewsPostStatus
} from "../../store/slices/newsSlice";
import styles from '../../News.module.css'; // Assuming this CSS module is correctly set up
import { NewsItem } from "../../apiServiceTypes"; // Updated import path

interface NewsFormProps {
  existingNews?: NewsItem | null; // Make existingNews optional and allow null
  onFormClose?: () => void; // Optional callback for when form is closed/submitted
}

interface NewsFormData {
  title: string;
  description: string; // Changed from content to description
  // image: string; // Image handling removed for now
}

const NewsForm: React.FC<NewsFormProps> = ({ existingNews, onFormClose }) => {
  const [formData, setFormData] = useState<NewsFormData>({
    title: existingNews?.title || "",
    description: existingNews?.description || "", // Changed from content
  });
  // const [image, setImage] = useState(existingNews ? existingNews.image : ""); // Image handling removed
  
  // Modal state should ideally be managed by the parent (AdminNewsPage)
  // For now, keeping it local to this component if it's always modal-based
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const isPosting = useAppSelector(selectNewsIsPosting);
  const postError = useAppSelector(selectNewsPostError);
  const lastPostSuccess = useAppSelector(selectNewsLastPostSuccess);

  useEffect(() => {
    if (existingNews) {
      setFormData({ title: existingNews.title, description: existingNews.description }); // Changed from content
      setIsModalOpen(true); // Open modal if existingNews is provided (for editing)
    } else {
      setFormData({ title: "", description: "" }); // Reset for new entry, changed from content
    }
  }, [existingNews]);

  useEffect(() => {
    if (lastPostSuccess) {
        setSubmissionMessage("News posted successfully!");
        setFormData({ title: "", description: "" }); // Reset form, changed from content
        // setIsModalOpen(false); // Close modal on success
        dispatch(resetNewsPostStatus());
        if (onFormClose) onFormClose(); // Call parent callback
    }
  }, [lastPostSuccess, dispatch, onFormClose]);

   useEffect(() => {
    if (postError) {
        setSubmissionMessage(`Error: ${postError}`);
    }
   }, [postError]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmissionMessage(null); // Clear message on new input
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionMessage(null);
    dispatch(resetNewsPostStatus());

    if (!formData.title || !formData.description) { // Changed from content
        setSubmissionMessage("Title and description are required.");
        return;
    }

    if (existingNews) {
      // dispatch(updateNews(existingNews._id, newsData)); // Update logic TBD
      setSubmissionMessage("Editing news is not yet supported with the new API.");
      console.warn("Update news functionality not implemented with new API structure yet.");
    } else {
      dispatch(postNewsThunk({ title: formData.title, description: formData.description })); // Corrected key to description
    }
  };

  // Image handling removed for now
  // const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => { ... };

  const openModal = () => {
    setFormData({ title: existingNews?.title || "", description: existingNews?.description || "" }); // Reset/populate form, changed from content
    setIsModalOpen(true);
    setSubmissionMessage(null);
    dispatch(resetNewsPostStatus());
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (onFormClose) onFormClose(); // If parent needs to know
  }

  return (
    <div>
      {!existingNews && ( // Only show "Create News" button if not in edit mode (passed via prop)
        <button onClick={openModal} className={styles.btnCreateNews || "btn-create-news"}>
            Create News Post
        </button>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <form onSubmit={handleSubmit} className={styles.newsFormAdmin}>
              <h2>{existingNews ? "Edit News" : "Create News Post"}</h2>
              {submissionMessage && <p style={{color: postError || submissionMessage.startsWith("Editing") ? 'red' : 'green'}}>{submissionMessage}</p>}
              <div className={styles.formGroup}>
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="News title"
                  required
                  disabled={isPosting}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="description">Content</label> {/* Label can remain "Content" for UI */}
                <textarea
                  id="description" // id and name should match state key
                  name="description"
                  value={formData.description} // Bind to description
                  onChange={handleChange}
                  placeholder="Full news content"
                  required
                  rows={5}
                  disabled={isPosting}
                />
                {/* Image upload UI removed */}
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.btnSubmit} disabled={isPosting}>
                  {isPosting ? "Posting..." : (existingNews ? "Update (Not Implemented)" : "Post News")}
                </button>
                <button type="button" className={styles.btnClose} onClick={closeModal} disabled={isPosting}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsForm;