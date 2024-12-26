import { api } from "../../utils";

// Action Types
const FETCH_LEAVE_REQUESTS_REQUEST = "FETCH_LEAVE_REQUESTS_REQUEST";
const FETCH_LEAVE_REQUESTS_SUCCESS = "FETCH_LEAVE_REQUESTS_SUCCESS";
const FETCH_LEAVE_REQUESTS_FAIL = "FETCH_LEAVE_REQUESTS_FAIL";

const CREATE_LEAVE_REQUEST_REQUEST = "CREATE_LEAVE_REQUEST_REQUEST";
const CREATE_LEAVE_REQUEST_SUCCESS = "CREATE_LEAVE_REQUEST_SUCCESS";
const CREATE_LEAVE_REQUEST_FAIL = "CREATE_LEAVE_REQUEST_FAIL";

const UPDATE_LEAVE_REQUEST_REQUEST = "UPDATE_LEAVE_REQUEST_REQUEST";
const UPDATE_LEAVE_REQUEST_SUCCESS = "UPDATE_LEAVE_REQUEST_SUCCESS";
const UPDATE_LEAVE_REQUEST_FAIL = "UPDATE_LEAVE_REQUEST_FAIL";

const DELETE_LEAVE_REQUEST_REQUEST = "DELETE_LEAVE_REQUEST_REQUEST";
const DELETE_LEAVE_REQUEST_SUCCESS = "DELETE_LEAVE_REQUEST_SUCCESS";
const DELETE_LEAVE_REQUEST_FAIL = "DELETE_LEAVE_REQUEST_FAIL";

const RESET_ERROR_AND_MESSAGE = "RESET_ERROR_AND_MESSAGE"; // New action type

// Fetch Leave Requests Action
export const fetchLeaveRequests = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_LEAVE_REQUESTS_REQUEST });
    const { data } = await api.get("/leaves/all");
    dispatch({ type: FETCH_LEAVE_REQUESTS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_LEAVE_REQUESTS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Fetch Leave Requests By User Id Action
export const fetchLeaveRequestsByUserId = (userId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_LEAVE_REQUESTS_REQUEST });
    const { data } = await api.get(`/leaves/user/${userId}`);
    dispatch({ type: FETCH_LEAVE_REQUESTS_SUCCESS, payload: data });
  } catch (error) {
    console.error('API error:', error); // Log any errors
    dispatch({
      type: FETCH_LEAVE_REQUESTS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Create Leave Request Action
export const createLeaveRequest = (leaveRequest) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_LEAVE_REQUEST_REQUEST });
    const { data } = await api.post("/leaves/create", leaveRequest);
    dispatch({ type: CREATE_LEAVE_REQUEST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CREATE_LEAVE_REQUEST_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update Leave Request Action
export const updateLeaveRequest = (id, updatedRequest) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_LEAVE_REQUEST_REQUEST });
    const { data } = await api.put(`/leaves/update`, { id, ...updatedRequest });
    dispatch({ type: UPDATE_LEAVE_REQUEST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_LEAVE_REQUEST_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete Leave Request Action
export const deleteLeaveRequest = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_LEAVE_REQUEST_REQUEST });
    await api.delete(`/leaves/delete`, { data: { id } });
    dispatch({ type: DELETE_LEAVE_REQUEST_SUCCESS, payload: id });
  } catch (error) {
    dispatch({
      type: DELETE_LEAVE_REQUEST_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Reset Error and Message Action
export const resetErrorAndMessage = () => ({
  type: RESET_ERROR_AND_MESSAGE,
});

// Initial State
const initialState = {
  leaveRequests: [],
  status: 'idle',
  error: null,
  message: null, // Add a message field to the state
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LEAVE_REQUESTS_REQUEST:
      return { ...state, status: 'loading', message: null };
    case FETCH_LEAVE_REQUESTS_SUCCESS:
      return { ...state, status: 'succeeded', leaveRequests: action.payload, message: 'Leave requests fetched successfully' };
    case FETCH_LEAVE_REQUESTS_FAIL:
      return { ...state, status: 'failed', error: action.payload, message: 'Failed to fetch leave requests' };

    case CREATE_LEAVE_REQUEST_REQUEST:
      return { ...state, status: 'loading', message: null };
    case CREATE_LEAVE_REQUEST_SUCCESS:
      return {
        ...state,
        status: 'succeeded',
        leaveRequests: [...state.leaveRequests, action.payload],
        message: 'Leave request created successfully',
      };
    case CREATE_LEAVE_REQUEST_FAIL:
      return { ...state, status: 'failed', error: action.payload, message: 'Failed to create leave request' };

    case UPDATE_LEAVE_REQUEST_REQUEST:
      return { ...state, status: 'loading', message: null };
    case UPDATE_LEAVE_REQUEST_SUCCESS:
      return {
        ...state,
        status: 'succeeded',
        leaveRequests: state.leaveRequests.map((request) =>
          request._id === action.payload._id ? action.payload : request
        ),
        message: 'Leave request updated successfully',
      };
    case UPDATE_LEAVE_REQUEST_FAIL:
      return { ...state, status: 'failed', error: action.payload, message: 'Failed to update leave request' };

    case DELETE_LEAVE_REQUEST_REQUEST:
      return { ...state, status: 'loading', message: null };
    case DELETE_LEAVE_REQUEST_SUCCESS:
      return {
        ...state,
        status: 'succeeded',
        leaveRequests: state.leaveRequests.filter(
          (request) => request._id !== action.payload
        ),
        message: 'Leave request deleted successfully',
      };
    case DELETE_LEAVE_REQUEST_FAIL:
      return { ...state, status: 'failed', error: action.payload, message: 'Failed to delete leave request' };

    case RESET_ERROR_AND_MESSAGE: // Handle the new action type
      return { ...state, error: null, message: null };

    default:
      return state;
  }
}