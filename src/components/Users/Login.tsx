import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginStart, loginSuccess, loginFailure, selectIsAuthenticated, selectCurrentUser, selectAuthError, selectAuthIsLoading, fetchCurrentUserThunk } from "../../store/slices/authSlice";
import { loginUser } from "../../apiService";
import { LoginCredentials } from "../../apiServiceTypes";
import Button from "../common/Button/Button"; // Import Button component
import styles from './Login.module.css'; // Import CSS Module

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const authError = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthIsLoading); // Corrected selector
  // const userRole = useAppSelector((state) => state.auth.user?.role); // Alternative way to get role

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[Login.tsx] Attempting login with:', { email, password }); // Added log
    dispatch(loginStart());
    try {
      const loginResponse = await loginUser({ email, password });
      dispatch(loginSuccess(loginResponse)); // This sets the token and isAuthenticated
      dispatch(fetchCurrentUserThunk()); // Now fetch the user details using the new token
    } catch (error: any) {
      const errorMessage = error.message || "Failed to login. Please check your credentials.";
      dispatch(loginFailure(errorMessage));
      // dispatch(showAlertMessage({ message: errorMessage, type: "error" })); // TODO
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    // console.log("Login useEffect triggered:", { isAuthenticated, currentUser, role: currentUser?.role, isLoading });
    if (isAuthenticated && currentUser && currentUser._id && typeof currentUser.role === 'string' && currentUser.role.trim() !== '') {
      const role = currentUser.role.toLowerCase().trim();
      if (role === "admin") {
        // console.log("Navigating to admin dashboard");
        navigate("/admin/dashboard");
      } else if (role === "employee") {
        // console.log("Navigating to employee dashboard");
        navigate("/employee/dashboard");
      } else {
        console.warn(`Login: Unknown or empty user role '${currentUser.role}', navigating to default.`);
        navigate("/");
      }
    } else if (isAuthenticated && (!currentUser || !currentUser._id || typeof currentUser.role !== 'string' || currentUser.role.trim() === '')) {
        // This case helps debug if isAuthenticated is true but currentUser or its role is problematic
        // console.warn("Login: Authenticated, but currentUser or role is problematic.", {isAuthenticated, currentUser});
    }
    // If !isAuthenticated, do nothing, stay on login page.
  }, [isAuthenticated, currentUser, navigate]); // isLoading was removed from deps as it might cause too many runs

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formCard}> {/* Added formCard wrapper */}
        <p className={styles.formTitle}>
          Sign In
        </p>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.formGroup}> {/* Optional: wrap label + input */}
            <label htmlFor="login-email" className={styles.label}>Email Address</label>
            <input
              id="login-email"
              className={styles.inputField}
              type="email"
              placeholder="you@example.com"
              name="email"
              value={email}
              onChange={onChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}> {/* Optional: wrap label + input */}
            <label htmlFor="login-password" className={styles.label}>Password</label>
            <input
              id="login-password"
              className={styles.inputField}
              type="password"
              placeholder="Enter your password"
              name="password"
              value={password}
              onChange={onChange}
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>

          {authError && <p className={styles.errorMessage}>{authError}</p>}
          
          <div className={styles.submitButtonContainer}>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              fullWidth={true} // Make button full width within card
              size="large" // Use a larger button for primary auth action
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>

          <p className={styles.signUpPrompt}>
            New to Scheduler? <Link to="/register">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
