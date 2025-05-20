import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { NewsItem } from '../../apiServiceTypes'; // Updated import path for types
import { getNews, postNews as apiPostNews, updateNewsApi, deleteNewsApi } from '../../apiService'; // API function imports remain
import { RootState } from '../store';

export interface NewsState {
  newsItems: NewsItem[];
  isLoading: boolean;
  error: string | null;
  isPosting: boolean;
  postError: string | null;
  lastPostSuccess: boolean;
  isUpdating: boolean;
  updateError: string | null;
  lastUpdateSuccess: boolean;
  isDeleting: boolean;
  deleteError: string | null;
  lastDeleteSuccess: boolean;
}

const initialState: NewsState = {
  newsItems: [],
  isLoading: false,
  error: null,
  isPosting: false,
  postError: null,
  lastPostSuccess: false,
  isUpdating: false,
  updateError: null,
  lastUpdateSuccess: false,
  isDeleting: false,
  deleteError: null,
  lastDeleteSuccess: false,
};

// Async thunk for fetching all news items
export const fetchNewsThunk = createAsyncThunk<
  NewsItem[], // Return type
  void, // Argument (none needed)
  { rejectValue: string }
>(
  'news/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getNews();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch news');
    }
  }
);

// Async thunk for posting a new news item (for Admin)
export const postNewsThunk = createAsyncThunk<
  NewsItem, // Return type
  { title: string; description: string }, // Argument changed to description
  { rejectValue: string }
>(
  'news/postNew',
  async (newsData, { rejectWithValue }) => { // newsData is { title, description }
    try {
      // apiService.postNews now expects { title, description } directly
      const data = await apiPostNews(newsData);
      return data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to post news';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for updating a news item
export const updateNewsThunk = createAsyncThunk<
  NewsItem,
  { newsId: string; newsData: { title: string; description: string } }, // Changed content to description
  { rejectValue: string }
>(
  'news/update',
  async ({ newsId, newsData }, { rejectWithValue }) => { // newsData now { title, description }
    try {
      // updateNewsApi in apiService.ts now correctly expects { title, description }
      const data = await updateNewsApi(newsId, newsData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update news');
    }
  }
);

// Async thunk for deleting a news item
export const deleteNewsThunk = createAsyncThunk<
  { message: string; id?: string }, // Backend might return deleted ID
  string, // newsId
  { rejectValue: string }
>(
  'news/delete',
  async (newsId, { rejectWithValue }) => {
    try {
      // deleteNewsApi is now directly imported
      const data = await deleteNewsApi(newsId);
      return { ...data, id: newsId }; // Pass original ID for reducer
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete news');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    clearNewsError(state) {
      state.error = null;
      state.postError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    resetNewsPostStatus(state) {
        state.isPosting = false;
        state.postError = null;
        state.lastPostSuccess = false;
    },
    resetNewsUpdateStatus(state) {
        state.isUpdating = false;
        state.updateError = null;
        state.lastUpdateSuccess = false;
    },
    resetNewsDeleteStatus(state) {
        state.isDeleting = false;
        state.deleteError = null;
        state.lastDeleteSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All News
      .addCase(fetchNewsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNewsThunk.fulfilled, (state, action: PayloadAction<NewsItem[]>) => {
        state.isLoading = false;
        state.newsItems = action.payload;
      })
      .addCase(fetchNewsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch news';
      })
      // Post New News Item
      .addCase(postNewsThunk.pending, (state) => {
        state.isPosting = true;
        state.postError = null;
        state.lastPostSuccess = false;
      })
      .addCase(postNewsThunk.fulfilled, (state, action: PayloadAction<NewsItem>) => {
        state.isPosting = false;
        state.newsItems.unshift(action.payload);
        state.lastPostSuccess = true;
      })
      .addCase(postNewsThunk.rejected, (state, action) => {
        state.isPosting = false;
        state.postError = action.payload ?? 'Failed to post news';
      })
      // Update News Item
      .addCase(updateNewsThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.lastUpdateSuccess = false;
      })
      .addCase(updateNewsThunk.fulfilled, (state, action: PayloadAction<NewsItem>) => {
        state.isUpdating = false;
        state.newsItems = state.newsItems.map(item => item._id === action.payload._id ? action.payload : item);
        state.lastUpdateSuccess = true;
      })
      .addCase(updateNewsThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload ?? 'Failed to update news';
      })
      // Delete News Item
      .addCase(deleteNewsThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.lastDeleteSuccess = false;
      })
      .addCase(deleteNewsThunk.fulfilled, (state, action: PayloadAction<{ message: string; id?: string }>) => {
        state.isDeleting = false;
        if (action.payload.id) {
          state.newsItems = state.newsItems.filter(item => item._id !== action.payload.id);
        }
        state.lastDeleteSuccess = true;
      })
      .addCase(deleteNewsThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload ?? 'Failed to delete news';
      });
  },
});

export const { clearNewsError, resetNewsPostStatus, resetNewsUpdateStatus, resetNewsDeleteStatus } = newsSlice.actions;

export default newsSlice.reducer;

// Selectors
export const selectAllNews = (state: RootState) => state.news.newsItems;
export const selectNewsIsLoading = (state: RootState) => state.news.isLoading;
export const selectNewsError = (state: RootState) => state.news.error;
export const selectNewsIsPosting = (state: RootState) => state.news.isPosting;
export const selectNewsPostError = (state: RootState) => state.news.postError;
export const selectNewsLastPostSuccess = (state: RootState) => state.news.lastPostSuccess;
export const selectNewsIsUpdating = (state: RootState) => state.news.isUpdating;
export const selectNewsUpdateError = (state: RootState) => state.news.updateError;
export const selectNewsLastUpdateSuccess = (state: RootState) => state.news.lastUpdateSuccess;
export const selectNewsIsDeleting = (state: RootState) => state.news.isDeleting;
export const selectNewsDeleteError = (state: RootState) => state.news.deleteError;
export const selectNewsLastDeleteSuccess = (state: RootState) => state.news.lastDeleteSuccess;