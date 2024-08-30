import { combineReducers } from "redux";
import users from "./users";
import alerts from "./alerts";
import admin from "./admin";
import employee from "./employee";
import preferences from "./preferences";
import leaves from "./leaves";

const rootReducer = combineReducers({
  users,
  alerts,
  admin,
  employee,
  preferences,
  leaves,
});

export default rootReducer;