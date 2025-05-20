// All type definitions previously in apiService.ts

// Represents the sub-document for a single shift within a schedule
export interface APIShift {
  _id: string;
  dayOfWeek: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  shiftType?: string;
  isSwappable: boolean;
}

// Represents a weekly schedule document
export interface APISchedule {
  _id: string;
  user: string | BackendUser; // Can be populated
  week: number; // e.g., 202520
  shifts: APIShift[];
  isOpenForSwap?: boolean; // Flag for the entire week's schedule
  skill?: "phoneOnly" | "Email" | "PhoneMU" | "MuOnly" | "Specialty" | "General" | "Other"; // Denormalized from User for convenience
  marketPlace?: "AE" | "SA" | "EG" | "UK" | "Specialty"; // Denormalized from User for convenience
  status?: string; 
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}

export interface BackendUser {
  _id: string;
  name?: string; 
  username: string; 
  email: string; 
  role: 'employee' | 'admin' | 'validator';
  skill?: "phoneOnly" | "Email" | "PhoneMU" | "MuOnly" | "Specialty" | "General" | "Other";
  marketPlace?: "AE" | "SA" | "EG" | "UK" | "Specialty";
}

export interface LoginResponse {
  token: string;
  user: BackendUser;
}

export interface RegisterPayload {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
}

export interface RegisterResponse {
  message: string;
  user?: BackendUser;
}

export interface NewsItem {
  _id: string;
  title: string;
  description: string; 
  date: string;
  author?: string; 
}

export interface UpdateProfilePayload {
  username?: string; 
  email?: string;    
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  skill?: BackendUser['skill']; 
  marketPlace?: BackendUser['marketPlace'];
}

export interface UpdateProfileResponse {
  message: string;
  user?: BackendUser;
}

export interface LeaveRequestPayload {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  OU?: string; 
}

export interface LeaveRequest {
  _id: string;
  user: string | BackendUser; 
  leaveType: string;
  fromDate: string;
  toDate: string; 
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string; 
  updatedAt?: string; 
  adminNotes?: string;
  adminApproval?: string; 
  OU?: string; 
}

export interface EmployeePreferenceData {
  preferredDaysOff: string;
  preferredShift: string;
  unavailability?: string;
  notes?: string;
  week: number;
}

export interface UpdateEmployeePreferencePayload {
  preferredDaysOff?: string;
  preferredShift?: string;
  unavailability?: string;
  notes?: string;
}

export interface EmployeePreferenceRecord extends EmployeePreferenceData {
  _id: string;
  user: string | BackendUser; 
  lastUpdatedAt: string;
}

// --- New Swap System Types ---

export interface CreateSwapRequestPayload { // For initiating a whole-week swap
  recipientUserId: string;
  requesterScheduleId: string; // The ID of the User A's APISchedule document
  requesterMessage?: string;
}

export interface RespondToSwapRequestPayload { // For Employee B responding
    swapRequestId: string;
    accepted: boolean;
    recipientScheduleId?: string; // Required if accepted: User B's APISchedule document ID
    recipientMessage?: string;
}

export interface AdminReviewSwapRequestPayload { // For Admin approving/denying
    swapRequestId: string;
    approved: boolean;
    adminNotes?: string;
}


export const NewSwapRequestStatuses = [
  "pending_recipient_action",   // Employee A initiated, waiting for B
  "rejected_by_recipient",      // Employee B rejected
  "pending_rules_check",        // B accepted, system is checking rules
  "pending_admin_approval",     // B accepted, rules failed, waiting for admin
  "approved",                   // Rules passed OR Admin approved
  "denied_by_admin",            // Admin denied
  "cancelled_by_requester",     // Employee A cancelled before B responded
  "completed"                   // Schedules successfully swapped, process finished
] as const;
export type NewSwapRequestStatusType = typeof NewSwapRequestStatuses[number];


export interface APISwapRequest { // Updated for whole-week direct swaps
  _id: string;
  requester: string | BackendUser;          // Employee A
  requesterScheduleId: string | APISchedule; // Employee A's offered weekly schedule
  
  recipientUser: string | BackendUser;      // Employee B
  recipientScheduleId?: string | APISchedule; // Employee B's offered weekly schedule (if accepted)

  status: NewSwapRequestStatusType;
  
  rulesCheck?: {
    passed: boolean;
    violations: string[];
    checkedAt: string; // ISO Date string
  };
  
  requesterMessage?: string;
  recipientMessage?: string;
  adminNotes?: string;
  
  createdAt: string;
  updatedAt?: string; 
}

// Payloads for old matchmaking system (to be phased out or adapted)
export interface OldCreateSwapRequestPayload { // Kept for reference, will be replaced
  offeredShiftId: string;
  offeredShiftScheduleId: string;
  weekSelection: 'week1' | 'week2' | 'both';
  message?: string;
}

export const OldSwapRequestStatuses = [
  "queued", "matching", "match_found_pending_confirmation", "confirmed_by_one",
  "approved", "rejected_by_requester", "rejected_by_match", "cancelled_by_user",
  "system_cancelled", "suggestion_available", "suggestion_accepted_by_recipient",
  "admin_approval_pending", "declined_by_admin"
] as const;
export type OldSwapRequestStatusType = typeof OldSwapRequestStatuses[number];

export const AdminApprovalStatuses = ["pending", "approved", "declined"] as const;
export type AdminApprovalStatusType = typeof AdminApprovalStatuses[number];


// This APISwapRequest is for the OLD matchmaking system. Will be replaced by the one above.
// For now, keeping it to avoid breaking existing code immediately.
export interface APISwapRequest_OLD {
  _id: string;
  requester: string | BackendUser; 
  offeredShiftId: string;
  offeredShiftScheduleId: string | APISchedule; 
  weekSelection: 'week1' | 'week2' | 'both';
  skill: "phoneOnly" | "Email" | "PhoneMU" | "MuOnly" | "Specialty" | "General" | "Other";
  marketPlace: "AE" | "SA" | "EG" | "UK" | "Specialty";
  status: OldSwapRequestStatusType; // Uses old statuses
  adminApprovalStatus?: AdminApprovalStatusType; 
  message?: string;
  matchedSwapRequestId?: string | APISwapRequest_OLD; 
  recipientUserId?: string | BackendUser; 
  recipientOfferedShiftId?: string; 
  recipientOfferedShiftScheduleId?: string | APISchedule; 
  isSuggestion?: boolean; 
  createdAt: string;
  updatedAt?: string; 
  offeredShiftDetail?: APIShift;
  recipientOfferedShiftDetail?: APIShift;
}


// --- Payloads for existing thunks that might need update ---
export interface ConfirmRejectPayload { // This was for matchmaking confirm/reject
  swapId: string;
}

export interface AcceptSuggestionPayload { // This was for matchmaking suggestion
  swapId: string; 
}

export interface AdminUpdatePayload { // This was for matchmaking admin update
  swapId: string;
  status?: OldSwapRequestStatusType; // Uses old statuses
  adminApprovalStatus?: AdminApprovalStatusType;
  message?: string;
}
// --- End Payloads for existing thunks ---


export interface Notification {
  _id: string;
  userId: string; 
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'swap_request' | 'leave_update' | 'general'; 
  isRead: boolean;
  relatedEntity?: {
    type: 'SwapRequest' | 'LeaveRequest' | 'NewsItem' | 'Schedule' | 'User'; 
    id: string;
  };
  createdAt: string;
}

export interface AdminAnalyticsData {
  scheduleAdherence: { totalShifts: number; onTimePercentage: number };
  swapRequestTrends: { totalRequests: number; approvedPercentage: number; averageTimeToApprove: string };
  leaveTrends: { totalRequests: number; commonLeaveTypes: {type: string, count: number}[] };
  scheduleHeatmap: { date: string; intensity: number }[];
}

export interface EmployeePersonalAnalytics {
  shiftsCompleted: number;
  punctualityPercentage: number;
  hoursWorkedThisPeriod: number;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: 'bug' | 'feature_request' | 'ui_ux' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string | BackendUser; 
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubmitIssuePayload {
  title: string;
  description: string;
  category: 'bug' | 'feature_request' | 'ui_ux' | 'other';
}

export interface UpdateIssueStatusPayload {
  issueId: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
}