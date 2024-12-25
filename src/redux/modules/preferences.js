import { api } from "../../utils";

// Action Types
const CREATE_PREFERENCE_REQUEST = "CREATE_PREFERENCE_REQUEST";
const CREATE_PREFERENCE_SUCCESS = "CREATE_PREFERENCE_SUCCESS";
const CREATE_PREFERENCE_FAIL = "CREATE_PREFERENCE_FAIL";

const UPDATE_PREFERENCE_REQUEST = "UPDATE_PREFERENCE_REQUEST";
const UPDATE_PREFERENCE_SUCCESS = "UPDATE_PREFERENCE_SUCCESS";
const UPDATE_PREFERENCE_FAIL = "UPDATE_PREFERENCE_FAIL";

const GET_PREFERENCE_BY_USER_REQUEST = "GET_PREFERENCE_BY_USER_REQUEST";
const GET_PREFERENCE_BY_USER_SUCCESS = "GET_PREFERENCE_BY_USER_SUCCESS";
const GET_PREFERENCE_BY_USER_FAIL = "GET_PREFERENCE_BY_USER_FAIL";

const GET_PREFERENCE_BY_ID_REQUEST = "GET_PREFERENCE_BY_ID_REQUEST";
const GET_PREFERENCE_BY_ID_SUCCESS = "GET_PREFERENCE_BY_ID_SUCCESS";
const GET_PREFERENCE_BY_ID_FAIL = "GET_PREFERENCE_BY_ID_FAIL";

const DELETE_PREFERENCE_REQUEST = "DELETE_PREFERENCE_REQUEST";
const DELETE_PREFERENCE_SUCCESS = "DELETE_PREFERENCE_SUCCESS";
const DELETE_PREFERENCE_FAIL = "DELETE_PREFERENCE_FAIL";

const GET_ALL_PREFERENCES_REQUEST = "GET_ALL_PREFERENCES_REQUEST";
const GET_ALL_PREFERENCES_SUCCESS = "GET_ALL_PREFERENCES_SUCCESS";
const GET_ALL_PREFERENCES_FAIL = "GET_ALL_PREFERENCES_FAIL";

const GET_PREFERENCE_BY_WEEK_REQUEST = "GET_PREFERENCE_BY_WEEK_REQUEST";
const GET_PREFERENCE_BY_WEEK_SUCCESS = "GET_PREFERENCE_BY_WEEK_SUCCESS";
const GET_PREFERENCE_BY_WEEK_FAIL = "GET_PREFERENCE_BY_WEEK_FAIL";

const GET_PREFERENCE_BY_SHIFT_REQUEST = "GET_PREFERENCE_BY_SHIFT_REQUEST";
const GET_PREFERENCE_BY_SHIFT_SUCCESS = "GET_PREFERENCE_BY_SHIFT_SUCCESS";
const GET_PREFERENCE_BY_SHIFT_FAIL = "GET_PREFERENCE_BY_SHIFT_FAIL";

const GET_PREFERENCE_BY_OFFDAY_REQUEST = "GET_PREFERENCE_BY_OFFDAY_REQUEST";
const GET_PREFERENCE_BY_OFFDAY_SUCCESS = "GET_PREFERENCE_BY_OFFDAY_SUCCESS";
const GET_PREFERENCE_BY_OFFDAY_FAIL = "GET_PREFERENCE_BY_OFFDAY_FAIL";

const GET_PREFERENCE_BY_WEEK_AND_SHIFT_REQUEST =
  "GET_PREFERENCE_BY_WEEK_AND_SHIFT_REQUEST";
const GET_PREFERENCE_BY_WEEK_AND_SHIFT_SUCCESS =
  "GET_PREFERENCE_BY_WEEK_AND_SHIFT_SUCCESS";
const GET_PREFERENCE_BY_WEEK_AND_SHIFT_FAIL =
  "GET_PREFERENCE_BY_WEEK_AND_SHIFT_FAIL";

const GET_PREFERENCE_BY_WEEK_AND_OFFDAY_REQUEST =
  "GET_PREFERENCE_BY_WEEK_AND_OFFDAY_REQUEST";
const GET_PREFERENCE_BY_WEEK_AND_OFFDAY_SUCCESS =
  "GET_PREFERENCE_BY_WEEK_AND_OFFDAY_SUCCESS";
const GET_PREFERENCE_BY_WEEK_AND_OFFDAY_FAIL =
  "GET_PREFERENCE_BY_WEEK_AND_OFFDAY_FAIL";

const GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_REQUEST =
  "GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_REQUEST";
const GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_SUCCESS =
  "GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_SUCCESS";
const GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_FAIL =
  "GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_FAIL";

const GET_USER_PREFERENCE_REQUEST = "GET_USER_PREFERENCE_REQUEST";
const GET_USER_PREFERENCE_SUCCESS = "GET_USER_PREFERENCE_SUCCESS";
const GET_USER_PREFERENCE_FAIL = "GET_USER_PREFERENCE_FAIL";

// Action Creators
const createPreferenceRequest = () => ({ type: CREATE_PREFERENCE_REQUEST });
const createPreferenceSuccess = (data) => ({
  type: CREATE_PREFERENCE_SUCCESS,
  payload: data,
});
const createPreferenceFail = (error) => ({
  type: CREATE_PREFERENCE_FAIL,
  payload: error,
});

const updatePreferenceRequest = () => ({ type: UPDATE_PREFERENCE_REQUEST });
const updatePreferenceSuccess = (data) => ({
  type: UPDATE_PREFERENCE_SUCCESS,
  payload: data,
});
const updatePreferenceFail = (error) => ({
  type: UPDATE_PREFERENCE_FAIL,
  payload: error,
});

const getPreferenceByUserRequest = () => ({
  type: GET_PREFERENCE_BY_USER_REQUEST,
});
const getPreferenceByUserSuccess = (data) => ({
  type: GET_PREFERENCE_BY_USER_SUCCESS,
  payload: data,
});
const getPreferenceByUserFail = (error) => ({
  type: GET_PREFERENCE_BY_USER_FAIL,
  payload: error,
});

const getPreferenceByIdRequest = () => ({ type: GET_PREFERENCE_BY_ID_REQUEST });
const getPreferenceByIdSuccess = (data) => ({
  type: GET_PREFERENCE_BY_ID_SUCCESS,
  payload: data,
});
const getPreferenceByIdFail = (error) => ({
  type: GET_PREFERENCE_BY_ID_FAIL,
  payload: error,
});

const deletePreferenceRequest = () => ({ type: DELETE_PREFERENCE_REQUEST });
const deletePreferenceSuccess = (data) => ({
  type: DELETE_PREFERENCE_SUCCESS,
  payload: data,
});
const deletePreferenceFail = (error) => ({
  type: DELETE_PREFERENCE_FAIL,
  payload: error,
});

const getAllPreferencesRequest = () => ({ type: GET_ALL_PREFERENCES_REQUEST });
const getAllPreferencesSuccess = (data) => ({
  type: GET_ALL_PREFERENCES_SUCCESS,
  payload: data,
});
const getAllPreferencesFail = (error) => ({
  type: GET_ALL_PREFERENCES_FAIL,
  payload: error,
});

const getPreferenceByWeekRequest = () => ({
  type: GET_PREFERENCE_BY_WEEK_REQUEST,
});
const getPreferenceByWeekSuccess = (data) => ({
  type: GET_PREFERENCE_BY_WEEK_SUCCESS,
  payload: data,
});
const getPreferenceByWeekFail = (error) => ({
  type: GET_PREFERENCE_BY_WEEK_FAIL,
  payload: error,
});

const getPreferenceByShiftRequest = () => ({
  type: GET_PREFERENCE_BY_SHIFT_REQUEST,
});
const getPreferenceByShiftSuccess = (data) => ({
  type: GET_PREFERENCE_BY_SHIFT_SUCCESS,
  payload: data,
});
const getPreferenceByShiftFail = (error) => ({
  type: GET_PREFERENCE_BY_SHIFT_FAIL,
  payload: error,
});

const getPreferenceByOffDayRequest = () => ({
  type: GET_PREFERENCE_BY_OFFDAY_REQUEST,
});
const getPreferenceByOffDaySuccess = (data) => ({
  type: GET_PREFERENCE_BY_OFFDAY_SUCCESS,
  payload: data,
});
const getPreferenceByOffDayFail = (error) => ({
  type: GET_PREFERENCE_BY_OFFDAY_FAIL,
  payload: error,
});

const getPreferenceByWeekAndShiftRequest = () => ({
  type: GET_PREFERENCE_BY_WEEK_AND_SHIFT_REQUEST,
});
const getPreferenceByWeekAndShiftSuccess = (data) => ({
  type: GET_PREFERENCE_BY_WEEK_AND_SHIFT_SUCCESS,
  payload: data,
});
const getPreferenceByWeekAndShiftFail = (error) => ({
  type: GET_PREFERENCE_BY_WEEK_AND_SHIFT_FAIL,
  payload: error,
});

const getPreferenceByWeekAndOffDayRequest = () => ({
  type: GET_PREFERENCE_BY_WEEK_AND_OFFDAY_REQUEST,
});
const getPreferenceByWeekAndOffDaySuccess = (data) => ({
  type: GET_PREFERENCE_BY_WEEK_AND_OFFDAY_SUCCESS,
  payload: data,
});
const getPreferenceByWeekAndOffDayFail = (error) => ({
  type: GET_PREFERENCE_BY_WEEK_AND_OFFDAY_FAIL,
  payload: error,
});

const getPreferenceByShiftAndOffDayRequest = () => ({
  type: GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_REQUEST,
});
const getPreferenceByShiftAndOffDaySuccess = (data) => ({
  type: GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_SUCCESS,
  payload: data,
});
const getPreferenceByShiftAndOffDayFail = (error) => ({
  type: GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_FAIL,
  payload: error,
});

const getUserPreferenceRequest = () => ({
  type: GET_USER_PREFERENCE_REQUEST,
});
const getUserPreferenceSuccess = (data) => ({
  type: GET_USER_PREFERENCE_SUCCESS,
  payload: data,
});
const getUserPreferenceFail = (error) => ({
  type: GET_USER_PREFERENCE_FAIL,
  payload: error,
});

// Async Actions (Thunks)
export const createPreference = (preference) => async (dispatch) => {
  try {
    dispatch(createPreferenceRequest());
    const { data } = await api.post("preferences/create", preference);
    dispatch(createPreferenceSuccess(data));
  } catch (error) {
    console.error("Error in createPreference:", error.response?.data || error.message);
    dispatch(createPreferenceFail(error.response?.data || error.message));
  }
};

export const updatePreference = (id, preference) => async (dispatch) => {
  try {
    dispatch(updatePreferenceRequest());
    const { data } = await api.put(`preferences/update/${id}`, preference);
    dispatch(updatePreferenceSuccess(data));
  } catch (error) {
    dispatch(updatePreferenceFail(error.response?.data || error.message));
  }
};

export const getPreferenceByUser = (user) => async (dispatch) => {
  try {
    dispatch(getPreferenceByUserRequest());
    const { data } = await api.get(`preferences/user/${user}`);
    dispatch(getPreferenceByUserSuccess(data));
  } catch (error) {
    dispatch(getPreferenceByUserFail(error.response?.data || error.message));
  }
};

export const getPreferenceById = (id) => async (dispatch) => {
  try {
    dispatch(getPreferenceByIdRequest());
    const { data } = await api.get(`preferences/id/${id}`);
    dispatch(getPreferenceByIdSuccess(data));
  } catch (error) {
    dispatch(getPreferenceByIdFail(error.response?.data || error.message));
  }
};

export const deletePreference = (id) => async (dispatch) => {
  try {
    dispatch(deletePreferenceRequest());
    const { data } = await api.delete(`preferences/delete/${id}`);
    dispatch(deletePreferenceSuccess(data));
  } catch (error) {
    dispatch(deletePreferenceFail(error.response?.data || error.message));
  }
};

export const getAllPreferences = () => async (dispatch) => {
  try {
    dispatch(getAllPreferencesRequest());
    const { data } = await api.get("preferences/all");
    dispatch(getAllPreferencesSuccess(data));
  } catch (error) {
    dispatch(getAllPreferencesFail(error.response?.data || error.message));
  }
};

export const getPreferenceByWeek = (week) => async (dispatch) => {
  try {
    dispatch(getPreferenceByWeekRequest());
    const { data } = await api.get(`preferences/week/${week}`);
    dispatch(getPreferenceByWeekSuccess(data));
  } catch (error) {
    dispatch(getPreferenceByWeekFail(error.response?.data || error.message));
  }
};

export const getPreferenceByShift = (shift) => async (dispatch) => {
  try {
    dispatch(getPreferenceByShiftRequest());
    const { data } = await api.get(`preferences/shift/${shift}`);
    dispatch(getPreferenceByShiftSuccess(data));
  } catch (error) {
    dispatch(getPreferenceByShiftFail(error.response?.data || error.message));
  }
};

export const getPreferenceByOffDay = (offDay) => async (dispatch) => {
  try {
    dispatch(getPreferenceByOffDayRequest());
    const { data } = await api.get(`preferences/offday/${offDay}`);
    dispatch(getPreferenceByOffDaySuccess(data));
  } catch (error) {
    dispatch(getPreferenceByOffDayFail(error.response?.data || error.message));
  }
};

export const getPreferenceByWeekAndShift =
  ({ week, shift }) =>
  async (dispatch) => {
    try {
      dispatch(getPreferenceByWeekAndShiftRequest());
      const { data } = await api.get(`preferences/week/${week}/shift/${shift}`);
      dispatch(getPreferenceByWeekAndShiftSuccess(data));
    } catch (error) {
      dispatch(
        getPreferenceByWeekAndShiftFail(error.response?.data || error.message)
      );
    }
  };

export const getPreferenceByWeekAndOffDay =
  ({ week, offDay }) =>
  async (dispatch) => {
    try {
      dispatch(getPreferenceByWeekAndOffDayRequest());
      const { data } = await api.get(`preferences/week/${week}/offday/${offDay}`);
      dispatch(getPreferenceByWeekAndOffDaySuccess(data));
    } catch (error) {
      dispatch(
        getPreferenceByWeekAndOffDayFail(error.response?.data || error.message)
      );
    }
  };

export const getPreferenceByShiftAndOffDay =
  ({ shift, offDay }) =>
  async (dispatch) => {
    try {
      dispatch(getPreferenceByShiftAndOffDayRequest());
      const { data } = await api.get(`preferences/shift/${shift}/offday/${offDay}`);
      dispatch(getPreferenceByShiftAndOffDaySuccess(data));
    } catch (error) {
      dispatch(
        getPreferenceByShiftAndOffDayFail(error.response?.data || error.message)
      );
    }
  };

export const getUserPreference = (userId) => async (dispatch) => {
  try {
    dispatch(getUserPreferenceRequest());
    const { data } = await api.get(`preferences/user/${userId}`);
    dispatch(getUserPreferenceSuccess(data));
  } catch (error) {
    dispatch(getUserPreferenceFail(error.response?.data || error.message));
  }
};

// Initial State
const initialState = {
  preferences: [],
  loading: false,
  error: null,
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_PREFERENCE_REQUEST:
    case UPDATE_PREFERENCE_REQUEST:
    case GET_PREFERENCE_BY_USER_REQUEST:
    case GET_PREFERENCE_BY_ID_REQUEST:
    case DELETE_PREFERENCE_REQUEST:
    case GET_ALL_PREFERENCES_REQUEST:
    case GET_PREFERENCE_BY_WEEK_REQUEST:
    case GET_PREFERENCE_BY_SHIFT_REQUEST:
    case GET_PREFERENCE_BY_OFFDAY_REQUEST:
    case GET_PREFERENCE_BY_WEEK_AND_SHIFT_REQUEST:
    case GET_PREFERENCE_BY_WEEK_AND_OFFDAY_REQUEST:
    case GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_REQUEST:
    case GET_USER_PREFERENCE_REQUEST:
      return { ...state, loading: true };

    case CREATE_PREFERENCE_SUCCESS:
      return {
        ...state,
        loading: false,
        preferences: [...state.preferences, action.payload],
      };
    case UPDATE_PREFERENCE_SUCCESS:
      return {
        ...state,
        loading: false,
        preferences: state.preferences.map((pref) =>
          pref.id === action.payload.id ? action.payload : pref
        ),
      };
    case GET_PREFERENCE_BY_USER_SUCCESS:
    case GET_PREFERENCE_BY_ID_SUCCESS:
    case GET_ALL_PREFERENCES_SUCCESS:
    case GET_PREFERENCE_BY_WEEK_SUCCESS:
    case GET_PREFERENCE_BY_SHIFT_SUCCESS:
    case GET_PREFERENCE_BY_OFFDAY_SUCCESS:
    case GET_PREFERENCE_BY_WEEK_AND_SHIFT_SUCCESS:
    case GET_PREFERENCE_BY_WEEK_AND_OFFDAY_SUCCESS:
    case GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_SUCCESS:
    case GET_USER_PREFERENCE_SUCCESS:
      return { ...state, loading: false, preferences: action.payload };
    case DELETE_PREFERENCE_SUCCESS:
      return {
        ...state,
        loading: false,
        preferences: state.preferences.filter(
          (pref) => pref.id !== action.payload.id
        ),
      };

    case CREATE_PREFERENCE_FAIL:
    case UPDATE_PREFERENCE_FAIL:
    case GET_PREFERENCE_BY_USER_FAIL:
    case GET_PREFERENCE_BY_ID_FAIL:
    case DELETE_PREFERENCE_FAIL:
    case GET_ALL_PREFERENCES_FAIL:
    case GET_PREFERENCE_BY_WEEK_FAIL:
    case GET_PREFERENCE_BY_SHIFT_FAIL:
    case GET_PREFERENCE_BY_OFFDAY_FAIL:
    case GET_PREFERENCE_BY_WEEK_AND_SHIFT_FAIL:
    case GET_PREFERENCE_BY_WEEK_AND_OFFDAY_FAIL:
    case GET_PREFERENCE_BY_SHIFT_AND_OFFDAY_FAIL:
    case GET_USER_PREFERENCE_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}