import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    APISwapRequest, 
    NewSwapRequestStatusType,
    CreateSwapRequestPayload,     
    RespondToSwapRequestPayload,  
    AdminReviewSwapRequestPayload,
    // Old types - to be removed or adapted:
    ConfirmRejectPayload, 
    AcceptSuggestionPayload,
    OldSwapRequestStatusType, 
} from '../../apiServiceTypes'; 
import { 
    initiateDirectSwapRequestApi,
    respondToDirectSwapRequestApi,
    adminReviewDirectSwapRequestApi,
    getMySentSwapRequestsApi, 
    getMyReceivedSwapRequestsApi, 
    cancelDirectSwapRequestApi, 
    getAllDirectSwapRequestsAdminApi, 
    getDirectSwapRequestByIdApi, 
} from '../../apiService'; 
import { RootState } from '../store'; // RootState is fine for thunkAPI.getState

export interface SwapState {
  isInitiating: boolean; 
  initiateError: string | null; 
  myActiveSwapRequest: APISwapRequest | null; 
  sentRequests: APISwapRequest[]; 
  receivedRequests: APISwapRequest[]; 
  isLoadingRequests: boolean; 
  loadRequestsError: string | null;
  isResponding: boolean; 
  respondError: string | null;
  isAdminReviewing: boolean; 
  adminReviewError: string | null;
  isCancelling: boolean;
  cancelError: string | null;
  allSwapRequestsAdmin: APISwapRequest[]; 
  isLoadingAllSwapsAdmin: boolean;      
  allSwapsErrorAdmin: string | null;      
}

const initialState: SwapState = {
  isInitiating: false,
  initiateError: null,
  myActiveSwapRequest: null,
  sentRequests: [],
  receivedRequests: [],
  isLoadingRequests: false,
  loadRequestsError: null,
  isResponding: false,
  respondError: null,
  isAdminReviewing: false,
  adminReviewError: null,
  isCancelling: false,
  cancelError: null,
  allSwapRequestsAdmin: [],
  isLoadingAllSwapsAdmin: false,
  allSwapsErrorAdmin: null,
};

export const initiateSwapRequestThunk = createAsyncThunk<
  APISwapRequest, CreateSwapRequestPayload, { rejectValue: string }
>('swap/initiateRequest', async (payload, { rejectWithValue }) => {
  try {
    return await initiateDirectSwapRequestApi(payload); 
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || 'Failed to initiate swap request');
  }
});

export const respondToSwapRequestThunk = createAsyncThunk<
  APISwapRequest, RespondToSwapRequestPayload, { rejectValue: string }
>('swap/respondToRequest', async (payload, { rejectWithValue }) => {
  try {
    return await respondToDirectSwapRequestApi(payload); 
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || 'Failed to respond to swap request');
  }
});

export const adminReviewSwapThunk = createAsyncThunk<
  APISwapRequest, AdminReviewSwapRequestPayload, { rejectValue: string }
>('swap/adminReviewSwap', async (payload, { rejectWithValue }) => {
  try {
    return await adminReviewDirectSwapRequestApi(payload); 
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || 'Failed to review swap request');
  }
});

export const fetchMySentRequestsThunk = createAsyncThunk< 
  APISwapRequest[], void, { rejectValue: string }
>('swap/fetchMySentRequests', async (_, { rejectWithValue }) => {
  try {
    return await getMySentSwapRequestsApi(); 
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch sent requests');
  }
});

export const fetchMyReceivedRequestsThunk = createAsyncThunk< 
  APISwapRequest[], void, { rejectValue: string }
>('swap/fetchMyReceivedRequests', async (_, { rejectWithValue }) => {
  try {
    return await getMyReceivedSwapRequestsApi(); 
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch received requests');
  }
});

export const cancelMySwapRequestThunk = createAsyncThunk< 
  APISwapRequest, string, { rejectValue: string } 
>('swap/cancelMyRequest', async (swapId, { rejectWithValue }) => {
  try {
    return await cancelDirectSwapRequestApi(swapId); 
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || 'Failed to cancel swap request');
  }
});

export const fetchAllSwapRequestsAdminThunk = createAsyncThunk< 
  APISwapRequest[], void, { rejectValue: string }
>('swap/fetchAllAdmin', async (_, { rejectWithValue }) => {
  try {
    return await getAllDirectSwapRequestsAdminApi(); 
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch all swaps for admin');
  }
});

export const fetchSwapRequestByIdThunk = createAsyncThunk<
  APISwapRequest, 
  string, 
  { rejectValue: string; state: RootState } // Added state to ThunkApiConfig
>('swap/fetchById', async (swapId, { rejectWithValue, getState }) => { // Added getState
    try {
        return await getDirectSwapRequestByIdApi(swapId);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.error || error.message || `Failed to fetch swap request ${swapId}`);
    }
});


const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    clearAllSwapErrors(state) { 
      state.initiateError = null;
      state.loadRequestsError = null;
      state.respondError = null;
      state.adminReviewError = null;
      state.cancelError = null;
      state.allSwapsErrorAdmin = null;
    },
    // This reducer is for generic updates, often from WebSockets.
    // It doesn't have access to the current user ID directly unless passed in payload.
    // UI components will filter sent/received based on requester/recipientUser.
    handleGenericSwapUpdate(state, action: PayloadAction<APISwapRequest>) { 
        const updatedReq = action.payload;
        
        const updateOrAddToList = (list: APISwapRequest[], req: APISwapRequest) => {
            const index = list.findIndex(r => r._id === req._id);
            if (index !== -1) {
                list[index] = req;
            } else {
                // Add if it's not already there. UI will filter if it's relevant.
                list.unshift(req); 
            }
        };
        
        updateOrAddToList(state.sentRequests, updatedReq);
        updateOrAddToList(state.receivedRequests, updatedReq);
        updateOrAddToList(state.allSwapRequestsAdmin, updatedReq); // Admins see all

        if(state.myActiveSwapRequest && state.myActiveSwapRequest._id === updatedReq._id) {
            state.myActiveSwapRequest = updatedReq;
            const terminalStatuses: NewSwapRequestStatusType[] = ['completed', 'cancelled_by_requester', 'rejected_by_recipient', 'denied_by_admin'];
            if (terminalStatuses.includes(updatedReq.status)) {
                state.myActiveSwapRequest = null; 
            }
        }
    },
    setMyActiveSwapRequest(state, action: PayloadAction<APISwapRequest | null>) {
        state.myActiveSwapRequest = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateSwapRequestThunk.pending, (state) => { state.isInitiating = true; state.initiateError = null; })
      .addCase(initiateSwapRequestThunk.fulfilled, (state, action: PayloadAction<APISwapRequest>) => {
        state.isInitiating = false;
        state.sentRequests.unshift(action.payload);
        state.myActiveSwapRequest = action.payload; 
      })
      .addCase(initiateSwapRequestThunk.rejected, (state, action) => { state.isInitiating = false; state.initiateError = action.payload ?? 'Failed'; })

      .addCase(respondToSwapRequestThunk.pending, (state) => { state.isResponding = true; state.respondError = null; })
      .addCase(respondToSwapRequestThunk.fulfilled, (state, action: PayloadAction<APISwapRequest>) => {
        state.isResponding = false;
        const updatedReq = action.payload;
        state.sentRequests = state.sentRequests.map(r => r._id === updatedReq._id ? updatedReq : r);
        state.receivedRequests = state.receivedRequests.map(r => r._id === updatedReq._id ? updatedReq : r);
        if(state.myActiveSwapRequest && state.myActiveSwapRequest._id === updatedReq._id) {
            state.myActiveSwapRequest = updatedReq;
        }
      })
      .addCase(respondToSwapRequestThunk.rejected, (state, action) => { state.isResponding = false; state.respondError = action.payload ?? 'Failed'; })

      .addCase(adminReviewSwapThunk.pending, (state) => { state.isAdminReviewing = true; state.adminReviewError = null; })
      .addCase(adminReviewSwapThunk.fulfilled, (state, action: PayloadAction<APISwapRequest>) => {
        state.isAdminReviewing = false;
        const updatedReq = action.payload;
        state.sentRequests = state.sentRequests.map(r => r._id === updatedReq._id ? updatedReq : r);
        state.receivedRequests = state.receivedRequests.map(r => r._id === updatedReq._id ? updatedReq : r);
        state.allSwapRequestsAdmin = state.allSwapRequestsAdmin.map(r => r._id === updatedReq._id ? updatedReq : r);
        if(state.myActiveSwapRequest && state.myActiveSwapRequest._id === updatedReq._id) {
            state.myActiveSwapRequest = updatedReq;
            const terminalStatuses: NewSwapRequestStatusType[] = ['completed', 'denied_by_admin'];
             if (terminalStatuses.includes(updatedReq.status)) {
                state.myActiveSwapRequest = null;
            }
        }
      })
      .addCase(adminReviewSwapThunk.rejected, (state, action) => { state.isAdminReviewing = false; state.adminReviewError = action.payload ?? 'Failed'; })
      
      .addCase(fetchMySentRequestsThunk.pending, (state) => { state.isLoadingRequests = true; state.loadRequestsError = null; })
      .addCase(fetchMySentRequestsThunk.fulfilled, (state, action: PayloadAction<APISwapRequest[]>) => {
        state.isLoadingRequests = false;
        state.sentRequests = action.payload;
      })
      .addCase(fetchMySentRequestsThunk.rejected, (state, action) => { state.isLoadingRequests = false; state.loadRequestsError = action.payload ?? 'Failed'; })
      
      .addCase(fetchMyReceivedRequestsThunk.pending, (state) => { state.isLoadingRequests = true; state.loadRequestsError = null; })
      .addCase(fetchMyReceivedRequestsThunk.fulfilled, (state, action: PayloadAction<APISwapRequest[]>) => { 
          state.isLoadingRequests = false; 
          state.receivedRequests = action.payload; 
      })
      .addCase(fetchMyReceivedRequestsThunk.rejected, (state, action) => { state.isLoadingRequests = false; state.loadRequestsError = action.payload ?? 'Failed'; })

      .addCase(cancelMySwapRequestThunk.pending, (state) => { state.isCancelling = true; state.cancelError = null; })
      .addCase(cancelMySwapRequestThunk.fulfilled, (state, action: PayloadAction<APISwapRequest>) => {
        state.isCancelling = false;
        const cancelledReq = action.payload;
        if (state.myActiveSwapRequest && state.myActiveSwapRequest._id === cancelledReq._id) {
          state.myActiveSwapRequest = null; 
        }
        state.sentRequests = state.sentRequests.map(r => r._id === cancelledReq._id ? cancelledReq : r);
      })
      .addCase(cancelMySwapRequestThunk.rejected, (state, action) => { state.isCancelling = false; state.cancelError = action.payload ?? 'Failed'; })
      
      .addCase(fetchAllSwapRequestsAdminThunk.pending, (state) => { state.isLoadingAllSwapsAdmin = true; state.allSwapsErrorAdmin = null; })
      .addCase(fetchAllSwapRequestsAdminThunk.fulfilled, (state, action: PayloadAction<APISwapRequest[]>) => { 
          state.isLoadingAllSwapsAdmin = false; 
          state.allSwapRequestsAdmin = action.payload; 
      })
      .addCase(fetchAllSwapRequestsAdminThunk.rejected, (state, action) => { state.isLoadingAllSwapsAdmin = false; state.allSwapsErrorAdmin = action.payload ?? 'Failed'; })
      
      .addCase(fetchSwapRequestByIdThunk.pending, (state) => { state.isLoadingRequests = true; })
      .addCase(fetchSwapRequestByIdThunk.fulfilled, (state, action: PayloadAction<APISwapRequest>) => {
          state.isLoadingRequests = false;
          const updatedReq = action.payload;
          // Accessing current user ID via getState from thunkAPI (passed to extraReducers)
          // This is not directly available here, so the logic for sent/received needs care.
          // For simplicity, we'll update/add to all lists where it might appear.
          // UI components will be responsible for filtering what they display.

          const updateOrAdd = (list: APISwapRequest[], req: APISwapRequest) => {
            const index = list.findIndex(r => r._id === req._id);
            if (index !== -1) list[index] = req; else list.unshift(req);
          };

          updateOrAdd(state.sentRequests, updatedReq);
          updateOrAdd(state.receivedRequests, updatedReq);
          updateOrAdd(state.allSwapRequestsAdmin, updatedReq);


          if(state.myActiveSwapRequest && state.myActiveSwapRequest._id === updatedReq._id) {
            state.myActiveSwapRequest = updatedReq;
          }
      })
      .addCase(fetchSwapRequestByIdThunk.rejected, (state, action) => { state.isLoadingRequests = false; /* Handle error */ });
  },
});

export const { 
    clearAllSwapErrors, 
    handleGenericSwapUpdate,
    setMyActiveSwapRequest
} = swapSlice.actions;

export default swapSlice.reducer;

// Selectors
export const selectMyActiveSwapRequest = (state: RootState) => state.swap.myActiveSwapRequest;
export const selectSentSwapRequests = (state: RootState) => state.swap.sentRequests;
export const selectReceivedSwapRequests = (state: RootState) => state.swap.receivedRequests;
export const selectIsLoadingRequests = (state: RootState) => state.swap.isLoadingRequests;
export const selectLoadRequestsError = (state: RootState) => state.swap.loadRequestsError; 

export const selectIsInitiatingSwap = (state: RootState) => state.swap.isInitiating;
export const selectInitiateSwapError = (state: RootState) => state.swap.initiateError;
export const selectIsRespondingToSwap = (state: RootState) => state.swap.isResponding;
export const selectRespondToSwapError = (state: RootState) => state.swap.respondError;
export const selectIsAdminReviewingSwap = (state: RootState) => state.swap.isAdminReviewing;
export const selectAdminReviewSwapError = (state: RootState) => state.swap.adminReviewError;

export const selectIsCancellingSwap = (state: RootState) => state.swap.isCancelling;
export const selectCancelSwapError = (state: RootState) => state.swap.cancelError;

// Admin Selectors
export const selectAllSwapRequestsForAdmin = (state: RootState) => state.swap.allSwapRequestsAdmin;
export const selectIsLoadingAllSwapsAdmin = (state: RootState) => state.swap.isLoadingAllSwapsAdmin;
export const selectAllSwapsErrorAdmin = (state: RootState) => state.swap.allSwapsErrorAdmin; // Corrected typo here