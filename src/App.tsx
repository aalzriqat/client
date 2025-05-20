import React, { Fragment, useEffect } from "react"; 
import "./styles/main.css"; 
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useAppSelector } from "./store/hooks"; 
import Landing from "./components/common/Landing";
import Register from "./components/Users/Register";
import Login from "./components/Users/Login";
import Navbar from "./components/common/Navbar";
import EmployeeDashboard from "./components/Employee/EmployeeDashboard"; 
import AdminDashboard from "./components/Admin/AdminDashboard";
import SwapRequestForm from "./components/Employee/SwapRequestForm"; 
import SuggestedSwaps from "./components/Employee/SuggestedSwaps"; 
import MyAccountPage from "./components/Employee/MyAccountPage"; 
import DevActionsPanel from "./components/Employee/DevActionsPanel"; // Import DevActionsPanel
import ErrorBoundary from "./components/common/ErrorBoundary";
import PrivateRoute from "./components/common/PrivateRoute";
import GlobalSpinner from "./components/common/GlobalSpinner";
import { ThemeProvider } from "./context/ThemeContext"; 

import store from "./store/store";
import { Provider } from "react-redux";
import { selectIsAuthenticated, selectCurrentUser } from "./store/slices/authSlice"; 
import { initSocket, disconnectSocket } from "./services/socketService"; 

const Main: React.FC = () => { 
  const location = useLocation();
  const hideNavbarPaths = ["/", "/login", "/register"];

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (isAuthenticated && currentUser?._id) {
      console.log("App.tsx: User authenticated, initializing socket...");
      initSocket(); 
    } else {
      console.log("App.tsx: User not authenticated or no ID, disconnecting socket if active.");
      disconnectSocket(); 
    }

    return () => {
      console.log("App.tsx: Main component cleanup or auth state changed, ensuring socket is disconnected.");
      disconnectSocket();
    };
  }, [isAuthenticated, currentUser?._id]); 

  return (
    <Fragment> 
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} /> 
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute role={'admin'}> 
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/*" 
            element={
              <PrivateRoute role={'employee'}> 
                <EmployeeDashboard /> 
              </PrivateRoute>
            }
          />
          <Route
            path="/requester" 
            element={
              <PrivateRoute role={'employee'}> 
                <SwapRequestForm />
              </PrivateRoute>
            }
          />
          <Route 
            path="/employee/suggestions" 
            element={
              <PrivateRoute role={'employee'}>
                <SuggestedSwaps />
              </PrivateRoute>
            }
          />
          <Route 
            path="/employee/my-account" 
            element={
              <PrivateRoute role={'employee'}>
                <MyAccountPage />
              </PrivateRoute>
            }
          />
          <Route 
            path="/employee/dev-actions" // Added route for DevActionsPanel
            element={
              <PrivateRoute role={'employee'}> {/* Still employee role for UI access */}
                <DevActionsPanel />
              </PrivateRoute>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Fragment>
  );
}

const App: React.FC = () => { 
  return (
    <Provider store={store}>
      <ThemeProvider> 
        <BrowserRouter>
            <GlobalSpinner />
            <Main />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;