import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
    fetchNewsThunk, 
    deleteNewsThunk, 
    updateNewsThunk,
    selectAllNews, 
    selectNewsIsLoading, 
    selectNewsError,
    selectNewsIsUpdating,
    selectNewsUpdateError,
    selectNewsLastUpdateSuccess,
    selectNewsIsDeleting,
    selectNewsDeleteError,
    selectNewsLastDeleteSuccess,
    resetNewsUpdateStatus,
    resetNewsDeleteStatus,
    clearNewsError
} from "../../store/slices/newsSlice";
import styles from '../../News.module.css';
import { NewsItem } from "../../apiServiceTypes";
import Button from "../common/Button/Button"; // Import Button component

interface CurrentNewsEdit {
    _id: string | null;
    title: string;
    description: string;
}

const NewsListAdmin: React.FC = () => {
  const dispatch = useAppDispatch();
  const newsItems = useAppSelector(selectAllNews);
  const isLoading = useAppSelector(selectNewsIsLoading);
  const error = useAppSelector(selectNewsError); // General fetch error

  const isUpdating = useAppSelector(selectNewsIsUpdating);
  const updateError = useAppSelector(selectNewsUpdateError);
  const lastUpdateSuccess = useAppSelector(selectNewsLastUpdateSuccess);

  const isDeleting = useAppSelector(selectNewsIsDeleting);
  const deleteError = useAppSelector(selectNewsDeleteError);
  const lastDeleteSuccess = useAppSelector(selectNewsLastDeleteSuccess);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState<CurrentNewsEdit>({ _id: null, title: "", description: "" }); // Changed content to description
  const [actionMessage, setActionMessage] = useState<string | null>("");

  useEffect(() => {
    dispatch(fetchNewsThunk());
    return () => {
        dispatch(clearNewsError());
        dispatch(resetNewsUpdateStatus());
        dispatch(resetNewsDeleteStatus());
    }
  }, [dispatch]);

  useEffect(() => {
    if (lastUpdateSuccess) {
        setActionMessage("News updated successfully!");
        setEditModalOpen(false); // Close modal on successful update
        dispatch(resetNewsUpdateStatus());
        dispatch(fetchNewsThunk()); // Re-fetch to get updated list
    }
  }, [lastUpdateSuccess, dispatch]);

  useEffect(() => {
    if (lastDeleteSuccess) {
        setActionMessage("News deleted successfully!");
        dispatch(resetNewsDeleteStatus());
        // News list is updated via filter in the slice, no need to re-fetch unless desired
    }
  }, [lastDeleteSuccess, dispatch]);

  useEffect(() => {
    if (updateError) setActionMessage(`Update Error: ${updateError}`);
    if (deleteError) setActionMessage(`Delete Error: ${deleteError}`);
  }, [updateError, deleteError]);


  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      setActionMessage(null);
      dispatch(deleteNewsThunk(id));
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    setCurrentNews({ _id: newsItem._id, title: newsItem.title, description: newsItem.description }); // Changed content to description
    setEditModalOpen(true);
    setActionMessage(null);
    dispatch(resetNewsUpdateStatus()); // Reset status before opening edit
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionMessage(null);
    if (currentNews._id && currentNews.title && currentNews.description) { // Changed content to description
      dispatch(updateNewsThunk({ newsId: currentNews._id, newsData: { title: currentNews.title, description: currentNews.description } })); // Changed content to description
    } else {
        setActionMessage("Cannot save: News ID, title, or description is missing.");
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setActionMessage(null);
    setCurrentNews({ _id: null, title: "", description: "" }); // Reset current news, changed content to description
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Sort news items by date, most recent first
  const sortedNewsItems = React.useMemo(() => {
    return [...newsItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [newsItems]);


  if (isLoading) {
    return <p className={styles.loadingMessage || "loading-message"}>Loading news...</p>;
  }

  if (error && newsItems.length === 0) { // Show fetch error only if list is empty
    return <p className={styles.errorMessage || "error-message"} style={{color: 'red'}}>Error fetching news: {error}</p>;
  }

  return (
    <div className={`${styles.main} ${styles.newsListAdmin}`}>
      <h3 className={styles.subHeader || "sub-header"}>Manage News Items</h3>
      {actionMessage && <p className={styles.actionMessage} style={{color: updateError || deleteError ? 'red' : 'green'}}>{actionMessage}</p>}
      
      {sortedNewsItems.length === 0 && !isLoading && <p>No news items found. Use the "Create News Post" button to add news.</p>}
      <ul className={styles.newsListUlAdmin || "news-list-ul-admin"}>
        {sortedNewsItems.map((item: NewsItem) => (
          <li key={item._id} className={styles.newsItemAdmin}>
            <h4>{item.title}</h4>
            <p className={styles.newsContentPreview}>{item.description.substring(0, 100)}{item.description.length > 100 ? "..." : ""}</p> {/* Changed content to description */}
            <p className={styles.dateMetaAdmin}>Posted: {formatDate(item.date)} {item.author && `by ${item.author}`}</p>
            <div className={styles.adminActions}>
              <Button onClick={() => handleEdit(item)} variant="secondary" size="small" disabled={isUpdating || isDeleting}>
                Edit
              </Button>
              <Button onClick={() => handleDelete(item._id)} variant="danger" size="small" disabled={isUpdating || isDeleting}>
                {isDeleting && currentNews._id === item._id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {editModalOpen && currentNews._id && ( // Ensure currentNews._id exists for editing
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <form onSubmit={handleSave}>
              <h2>Edit News Post</h2>
              {/* Display update-specific error inside modal if preferred */}
              <div className={styles.formGroup}>
                <label htmlFor="editTitle">Title:</label>
                <input
                  id="editTitle"
                  type="text"
                  value={currentNews.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCurrentNews({ ...currentNews, title: e.target.value })
                  }
                  required
                  disabled={isUpdating}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editDescription">Content:</label> {/* Label can stay "Content" */}
                <textarea
                  id="editDescription" // id should match state key if specific, or use generic
                  name="description" // name should match state key
                  value={currentNews.description} // Changed content to description
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setCurrentNews({ ...currentNews, description: e.target.value }) // Changed content to description
                  }
                  required
                  rows={5}
                  disabled={isUpdating}
                />
              </div>
              <div className={styles.formActions}>
                <Button type="submit" variant="primary" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="light" onClick={handleCloseModal} disabled={isUpdating}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsListAdmin;