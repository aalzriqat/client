import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  updateOpenForSwap,
  fetchIsOpenForSwap,
  logout,
} from "../../redux/modules/users";
import socketIOClient from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faBell } from "@fortawesome/free-solid-svg-icons";
import ClientReportForm from "../ReportIssues/ReportIssuesForm";
import Notification from "./Notification"; 

const ENDPOINT = "https://scheduler-server-n9z6.onrender.com"; 

const Navbar = () => {
  const dispatch = useDispatch();
  const [toggled, setToggled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const {
    user,
    isAuthenticated,
    isOpenForSwap: openForSwap,
  } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchIsOpenForSwap());
  }, [dispatch]);

  useEffect(() => {
    setToggled(openForSwap);
  }, [openForSwap]);

  useEffect(() => {
    if (isAuthenticated) {
      const socket = socketIOClient(ENDPOINT);

      socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });

      socket.on("notification", (notification) => {
        setNotifications((prevNotifications) => [
          notification,
          ...prevNotifications,
        ]);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from Socket.IO server");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated]);

  const handleToggleClick = () => {
    const formData = { isOpenForSwap: !toggled };
    dispatch(updateOpenForSwap(formData));
    dispatch(fetchIsOpenForSwap());
    setToggled(!toggled);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <nav className="navbar bg-navbar">
      <h1>
        <Link className="logo-navbar" to="/">
          Scheduler
        </Link>
      </h1>
      <Fragment>
        <ul>
          <li>
            Report an issue{" "}
            <FontAwesomeIcon
              icon={faExclamationCircle}
              onClick={toggleForm}
              className="report-icon"
            />
            {showForm && (
              <div className="popup-form">
                <ClientReportForm />
              </div>
            )}
          </li>
          {isAuthenticated && (
            <li className="notifications">
              <div onClick={handleNotificationsClick}>
                <FontAwesomeIcon
                  icon={faBell}
                  className={`bell-icon ${notifications.length > 0 ? "has-notifications" : ""}`}
                />
                {notifications.length > 0 && (
                  <span className="notification-count">
                    {notifications.length}
                  </span>
                )}
              </div>
              {showNotifications && <Notification notifications={notifications} />}
            </li>
          )}
          {isAuthenticated && user && user.role === "employee" && (
            <>
              <span>Hello {user.username}</span>
              <li>
                <button
                  className={`toggle-btn ${toggled ? "toggled" : ""}`}
                  onClick={handleToggleClick}
                >
                  <div className="thumb"></div>
                </button>
              </li>
              <li>
                <div style={{ color: "orange" }}>Open For Swap ?</div>
              </li>
            </>
          )}
          <li>
            {isAuthenticated ? (
              <Link to="/" onClick={handleLogout}>
                Logout{" "}
                <i
                  className="fas fa-sign-out-alt"
                  style={{ marginLeft: "8px" }}
                ></i>
              </Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </li>
        </ul>
      </Fragment>
    </nav>
  );
};

export default Navbar;