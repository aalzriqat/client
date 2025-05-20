import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import {
    BackendUser, LoginResponse, UpdateProfilePayload, UpdateProfileResponse,
    NewsItem, LeaveRequest, LeaveRequestPayload, EmployeePreferenceRecord, EmployeePreferenceData,
    APISwapRequest, // This is now the NEW APISwapRequest for direct swaps
    CreateSwapRequestPayload,     // New payload for initiating direct swap
    RespondToSwapRequestPayload,  // New payload for recipient's response
    AdminReviewSwapRequestPayload,// New payload for admin's review
    Notification, AdminAnalyticsData, EmployeePersonalAnalytics, LoginCredentials, RegisterPayload, RegisterResponse,
    Issue, SubmitIssuePayload, UpdateIssueStatusPayload, UpdateEmployeePreferencePayload,
    APISchedule, APIShift, 
    // Old types that might be removed later if not used by old thunks temporarily
    ConfirmRejectPayload, 
    AcceptSuggestionPayload,
    OldSwapRequestStatusType, // If any old admin update payload uses this
    AdminApprovalStatusType // If any old admin update payload uses this
} from './apiServiceTypes'; 

const API_BASE_URL = 'http://localhost:4000/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
});

// ... (interceptors remain the same) ...
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data ? `| Data: ${JSON.stringify(config.data)}` : '');
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['x-auth-token'] = token;
      delete config.headers.Authorization; 
    }
    return config;
  },
  (error: any) => {
    console.error(`[API Request Error] ${error.message}`, error.config ? `${error.config.method?.toUpperCase()} ${error.config.url}` : '', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] Status: ${response.status} | ${response.config.method?.toUpperCase()} ${response.config.url}`,
    );
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const method = error.config?.method?.toUpperCase();
      const url = error.config?.url;
      const responseData = error.response.data ? JSON.stringify(error.response.data) : "No data in error response.";
      console.error(
        `[API Response Error] Status: ${error.response.status} ${method ? `| ${method} ${url}` : ''}`,
        `Response Data: ${responseData}`,
      );
    } else if (error.request) {
      console.error(`[API Response Error] No response received for ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    } else {
      console.error('[API Response Error] Error setting up request:', error.message);
    }
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      console.error(`[API Timeout] Request to ${error.config?.url} timed out.`);
    }
    return Promise.reject(error);
  }
);


// --- User Authentication & Profile ---
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => apiClient.post<LoginResponse>('/users/login', credentials).then(res => res.data);
export const registerUserApi = async (userData: RegisterPayload): Promise<RegisterResponse> => apiClient.post<RegisterResponse>('/users/register', userData).then(res => res.data);
export const getCurrentUserApi = async (): Promise<BackendUser> => apiClient.get<BackendUser>('/users/me').then(res => res.data);
export const updateUserProfile = async (profileData: UpdateProfilePayload): Promise<UpdateProfileResponse > => apiClient.put<UpdateProfileResponse>('/users/me/profile', profileData).then(res => res.data);

// --- News, Leave, Preferences, Schedules (remain largely the same) ---
export const getNews = async (): Promise<NewsItem[]> => apiClient.get<NewsItem[]>('/news').then(res => res.data);
export const postNews = async (newsData: { title: string; description: string }): Promise<NewsItem> => apiClient.post<NewsItem>('/news', newsData).then(res => res.data);
export const updateNewsApi = async (newsId: string, newsData: { title: string; description: string }): Promise<NewsItem> => apiClient.put<NewsItem>(`/news/${newsId}`, newsData).then(res => res.data);
export const deleteNewsApi = async (newsId: string): Promise<{ message: string, id?: string }> => apiClient.delete<{ message: string, id?: string }>(`/news/${newsId}`).then(res => res.data);
export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => apiClient.get<LeaveRequest[]>('/leaves/all').then(res => res.data);
export const getMyLeaveRequests = async (): Promise<LeaveRequest[]> => apiClient.get<LeaveRequest[]>('/leaves/me').then(res => res.data);
export const submitLeaveRequest = async (leaveData: LeaveRequestPayload): Promise<LeaveRequest> => apiClient.post<LeaveRequest>('/leaves/create', leaveData).then(res => res.data);
export const updateLeaveRequestStatusAdmin = async (leaveId: string, status: 'approved' | 'rejected', adminNotes?: string): Promise<LeaveRequest> => {
  const payload = { _id: leaveId, status, adminApproval: status, message: adminNotes };
  return apiClient.put<LeaveRequest>(`/leaves/update`, payload).then(res => res.data);
};
export const cancelLeaveRequestEmployee = async (leaveId: string): Promise<LeaveRequest> => {
  const payload = { _id: leaveId, status: 'cancelled' };
  return apiClient.put<LeaveRequest>(`/leaves/update`, payload).then(res => res.data);
};
export const getMyPreferences = async (): Promise<EmployeePreferenceRecord[]> => apiClient.get<EmployeePreferenceRecord[]>('/preferences/me').then(res => res.data).catch(err => (err.response?.status === 404 ? [] : Promise.reject(err)));
export const submitMyPreferences = async (preferenceData: EmployeePreferenceData): Promise<EmployeePreferenceRecord> => apiClient.post<EmployeePreferenceRecord>('/preferences/create', preferenceData).then(res => res.data);
export const updateMyPreferences = async (preferenceId: string, preferenceData: UpdateEmployeePreferencePayload): Promise<EmployeePreferenceRecord> => apiClient.put<EmployeePreferenceRecord>(`/preferences/update/${preferenceId}`, preferenceData).then(res => res.data);
export const getAllEmployeePreferences = async (): Promise<EmployeePreferenceRecord[]> => apiClient.get<EmployeePreferenceRecord[]>('/preferences/all').then(res => res.data);
export const getEmployeeSchedule = async (employeeId: string): Promise<APISchedule[]> => apiClient.get<APISchedule[]>(`/schedules/employee/${employeeId}`).then(res => res.data);
export const updateShiftSwapAvailability = async (scheduleId: string, isAvailableForSwap: boolean): Promise<APISchedule> => apiClient.patch<APISchedule>(`/schedules/${scheduleId}/availability`, { isAvailableForSwap }).then(res => res.data);
export const getAllSchedulesAdmin = async (): Promise<APISchedule[]> => apiClient.get<APISchedule[]>('/schedules/all').then(res => res.data); 
export const uploadScheduleDataAdmin = async (formData: FormData): Promise<{ message: string; downloadUrl?: string; errors?: string[] }> => { 
  return apiClient.post<{ message: string; downloadUrl?: string; errors?: string[] }>('/schedules/upload', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};

// --- New Direct Whole-Week Swap System API Functions ---
export const initiateDirectSwapRequestApi = async (payload: CreateSwapRequestPayload): Promise<APISwapRequest> => 
    apiClient.post<APISwapRequest>('/swaps/initiate', payload).then(res => res.data);

export const respondToDirectSwapRequestApi = async (payload: RespondToSwapRequestPayload): Promise<APISwapRequest> => 
    apiClient.post<APISwapRequest>(`/swaps/${payload.swapRequestId}/respond`, payload).then(res => res.data);

export const adminReviewDirectSwapRequestApi = async (payload: AdminReviewSwapRequestPayload): Promise<APISwapRequest> => 
    apiClient.post<APISwapRequest>(`/swaps/${payload.swapRequestId}/admin-review`, payload).then(res => res.data);

// Adapted existing functions to use new APISwapRequest type implicitly
export const getMySentSwapRequestsApi = async (): Promise<APISwapRequest[]> => // Renamed for clarity
    apiClient.get<APISwapRequest[]>('/swaps/me/sent').then(res => res.data);

export const getMyReceivedSwapRequestsApi = async (): Promise<APISwapRequest[]> => // Renamed for clarity
    apiClient.get<APISwapRequest[]>('/swaps/me/received').then(res => res.data);

export const getDirectSwapRequestByIdApi = async (swapId: string): Promise<APISwapRequest> => // Renamed for clarity
    apiClient.get<APISwapRequest>(`/swaps/${swapId}`).then(res => res.data);

export const cancelDirectSwapRequestApi = async (swapId: string): Promise<APISwapRequest> => // Renamed for clarity
    apiClient.put<APISwapRequest>(`/swaps/${swapId}/cancel`).then(res => res.data);

export const getAllDirectSwapRequestsAdminApi = async (): Promise<APISwapRequest[]> => // Renamed for clarity
    apiClient.get<APISwapRequest[]>('/swaps/admin/all').then(res => res.data);


// --- Old Matchmaking System API Functions (Commented out or to be removed) ---
// export const createSwapRequest_OLD = async (payload: OldCreateSwapRequestPayload): Promise<APISwapRequest_OLD> => apiClient.post<APISwapRequest_OLD>('/swaps', payload).then(res => res.data);
// export const confirmSwapMatch_OLD = async (swapId: string): Promise<{ userRequestData: APISwapRequest_OLD, otherRequestData?: APISwapRequest_OLD, finalApproval: boolean }> => apiClient.post(`/swaps/${swapId}/confirm`).then(res => res.data);
// export const rejectSwapMatch_OLD = async (swapId: string): Promise<{ rejectedRequest: APISwapRequest_OLD, requeuedRequest: APISwapRequest_OLD }> => apiClient.post(`/swaps/${swapId}/reject`).then(res => res.data);
// export const getSuggestedShifts_OLD = async (): Promise<APISwapRequest_OLD[]> => apiClient.get<APISwapRequest_OLD[]>('/swaps/suggestions/available').then(res => res.data);
// export const acceptSuggestedShift_OLD = async (swapId: string): Promise<{ swapRequest: APISwapRequest_OLD }> => apiClient.post(`/swaps/suggestions/${swapId}/accept`).then(res => res.data);
// export const updateSwapStatusAdmin_OLD = async (swapId: string, status?: OldSwapRequestStatusType, adminApprovalStatus?: AdminApprovalStatusType, message?: string): Promise<APISwapRequest_OLD> => {
//   const payload: any = {};
//   if (status) payload.status = status;
//   if (adminApprovalStatus) payload.adminApprovalStatus = adminApprovalStatus;
//   if (message) payload.message = message;
//   return apiClient.put<APISwapRequest_OLD>(`/swaps/${swapId}/status`, payload).then(res => res.data);
// };
// export const processMatchmakingQueueAdmin_OLD = async (): Promise<{message: string, matchesFound: number}> => apiClient.post('/swaps/matchmaking/process').then(res => res.data);
// export const getApprovedSwapRequestsAdmin_OLD = async (): Promise<APISwapRequest_OLD[]> => apiClient.get<APISwapRequest_OLD[]>('/swaps/approved').then(res => res.data);


// --- Notifications, Analytics, Report Issues, Admin Data Management (remain the same) ---
export const getNotificationsApi = async (): Promise<Notification[]> => apiClient.get<Notification[]>('/notifications/me').then(res => res.data);
export const markNotificationsReadApi = async (notificationIds: string[]): Promise<{ message: string; updatedCount: number }> => 
  apiClient.patch<{ message: string; updatedCount: number }>('/notifications/read', { notificationIds }).then(res => res.data);
export const deleteNotificationApi = async (notificationId: string): Promise<{ message: string; deletedNotificationId?: string }> => 
  apiClient.delete<{ message: string; deletedNotificationId?: string }>(`/notifications/${notificationId}`).then(res => res.data);
export const deleteAllMyNotificationsApi = async (): Promise<{ message: string; deletedCount: number }> => 
  apiClient.delete<{ message: string; deletedCount: number }>('/notifications/all/me').then(res => res.data);
export const getAdminAnalyticsDashboard = async (): Promise<AdminAnalyticsData> => apiClient.get<AdminAnalyticsData>('/analytics/admin/dashboard').then(res => res.data).catch(err => {
    console.warn("getAdminAnalyticsDashboard: Error or not found, returning mock.", err.response?.status);
    return { scheduleAdherence: { totalShifts: 0, onTimePercentage: 0 }, swapRequestTrends: { totalRequests: 0, approvedPercentage: 0, averageTimeToApprove: "N/A" }, leaveTrends: { totalRequests: 0, commonLeaveTypes: [] }, scheduleHeatmap: []};
});
export const getMyPersonalAnalyticsData = async (): Promise<EmployeePersonalAnalytics> => apiClient.get<EmployeePersonalAnalytics>('/analytics/my/dashboard').then(res => res.data).catch(err => {
    console.warn("getMyPersonalAnalyticsData: Error or not found, returning mock.", err.response?.status);
    return { shiftsCompleted: 0, punctualityPercentage: 0, hoursWorkedThisPeriod: 0 };
});
export const submitNewIssueApi = async (payload: SubmitIssuePayload): Promise<Issue> => apiClient.post<Issue>('/issues', payload).then(res => res.data);
export const fetchAllIssuesAdminApi = async (): Promise<Issue[]> => apiClient.get<Issue[]>('/issues/all').then(res => res.data).catch(err => (err.response?.status === 404 ? [] : Promise.reject(err))); 
export const fetchMyIssuesApi = async (): Promise<Issue[]> => apiClient.get<Issue[]>(`/issues/me`).then(res => res.data).catch(err => (err.response?.status === 404 ? [] : Promise.reject(err))); 
export const updateIssueStatusAdminApi = async (payload: UpdateIssueStatusPayload): Promise<Issue> => apiClient.put<Issue>(`/issues/${payload.issueId}/status`, { status: payload.status, adminNotes: payload.adminNotes }).then(res => res.data);
export const deleteAllSchedulesApi = async (): Promise<{ msg: string }> => apiClient.delete<{ msg: string }>('/users/data/allSchedules').then(res => res.data);
export const deleteAllSwapsApi = async (): Promise<{ msg: string }> => apiClient.delete<{ msg: string }>('/users/data/allSwaps').then(res => res.data);
export const deleteAllPreferencesApi = async (): Promise<{ msg: string }> => apiClient.delete<{ msg: string }>('/users/data/allPreferences').then(res => res.data);
export const deleteAllLeaveRequestsApi = async (): Promise<{ msg: string }> => apiClient.delete<{ msg: string }>('/users/data/allLeaveRequests').then(res => res.data);
export const seedMockDataApi = async (): Promise<{ message: string; users: number; schedules: number; swapRequests: number; }> => 
  apiClient.post('/users/data/seedMockData').then(res => res.data);

export default apiClient;