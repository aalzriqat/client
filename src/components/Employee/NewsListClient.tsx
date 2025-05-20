import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchNewsThunk, selectAllNews, selectNewsIsLoading, selectNewsError, clearNewsError } from '../../store/slices/newsSlice';
import styles from '../../News.module.css'; // Assuming this CSS module is correctly set up
import { NewsItem } from '../../apiServiceTypes'; // Updated import path

const NewsListClient: React.FC = () => {
  const dispatch = useAppDispatch();
  const newsItems = useAppSelector(selectAllNews);
  const isLoading = useAppSelector(selectNewsIsLoading);
  const error = useAppSelector(selectNewsError);

  useEffect(() => {
    dispatch(fetchNewsThunk());
    return () => { // Cleanup on unmount
        dispatch(clearNewsError());
    }
  }, [dispatch]);

  // Sort news items by date, most recent first
  const sortedNewsItems = React.useMemo(() => {
    return [...newsItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [newsItems]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return <p className={styles.loadingMessage || "loading-message"}>Loading news...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage || "error-message"} style={{color: 'red'}}>Error fetching news: {error}</p>;
  }

  return (
    <div className={`${styles.main} ${styles.newsListClient}`}>
      <h2 className={styles.h2}>Latest News & Announcements</h2>
      {sortedNewsItems.length === 0 && !isLoading && <p>No news items available at the moment.</p>}
      <ul className={styles.newsListUl || "news-list-ul"}> {/* Added fallback class */}
        {sortedNewsItems.map((item: NewsItem) => (
          <li key={item._id} className={styles.newsItem}>
            <h3 className={styles.h3}>{item.title}</h3>
            <p className={styles.dateMeta || "date-meta"}>Posted on: {formatDate(item.date)} {item.author && `by ${item.author}`}</p>
            <p className={styles.p}>{item.description}</p> {/* Changed from item.content to item.description */}
            {/* "Read More" button might lead to a detailed view or expand content if implemented */}
            {/* <button className={styles.btn}>Read More</button> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsListClient;