import React, { useState, FormEvent, ChangeEvent } from "react"; // Removed useEffect
import { Link, Navigate } from "react-router-dom"; // Removed useNavigate
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { registerStart, registerSuccess, registerFailure, selectIsAuthenticated, selectIsRegistering, selectRegistrationError, selectRegistrationSuccess, clearAuthError } from "../../store/slices/authSlice";
import { registerUserApi } from "../../apiService";
import { RegisterPayload } from "../../apiServiceTypes";
import Button from "../common/Button/Button"; // Import Button component
import styles from './Register.module.css'; // Import CSS Module

interface RegisterFormData extends RegisterPayload {
  confirmPassword?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee", // Default role, or make it selectable
  });

  const { username, email, password, confirmPassword, role } = formData;

  const dispatch = useAppDispatch();
  // const navigate = useNavigate(); // Removed as it's not used

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isRegistering = useAppSelector(selectIsRegistering); // Use specific loading state for registration
  const registrationError = useAppSelector(selectRegistrationError); // Use specific error state
  const registrationSuccess = useAppSelector(selectRegistrationSuccess); // Use specific success state

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { // Added HTMLSelectElement for role
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      dispatch(registerFailure("Passwords do not match"));
      return;
    }
    dispatch(clearAuthError()); // Clear previous errors
    dispatch(registerStart());
    try {
      // Explicitly pass only the fields expected by RegisterPayload
      const payload: RegisterPayload = { username, email, password, role };
      await registerUserApi(payload);
      dispatch(registerSuccess());
      // No automatic navigation on success, user sees success message and link to login
    } catch (error: any) {
      const errorMessage = error.message || "Failed to register. Please try again.";
      dispatch(registerFailure(errorMessage));
      // dispatch(showAlertMessage({ message: errorMessage, type: "error" })); // TODO
      console.error("Registration error:", error);
    }
  };

  // If user is already authenticated, redirect them from register page
  if (isAuthenticated) {
    // Redirect to a default authenticated page, e.g., home or dashboard
    // This depends on how you want to handle already logged-in users trying to access /register
    return <Navigate to="/" />; // Or /employee/dashboard or /admin/dashboard based on role
  }

  return (
    <div className={styles.registerContainer}>
      <div className={styles.formCard}> {/* Added formCard wrapper */}
        <p className={styles.formTitle}>
          Create Account
        </p>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="register-username" className={styles.label}>Username</label>
            <input
              id="register-username"
              className={styles.inputField}
              type="text"
              placeholder="Choose a username"
              name="username"
              value={username}
              onChange={onChange}
              required
              disabled={isRegistering}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="register-email" className={styles.label}>Email Address</label>
            <input
              id="register-email"
              className={styles.inputField}
              type="email"
              placeholder="you@example.com"
              name="email"
              value={email}
              onChange={onChange}
              required
              disabled={isRegistering}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="register-password" className={styles.label}>Password</label>
            <input
              id="register-password"
              className={styles.inputField}
              type="password"
              placeholder="Create a password (min. 6 characters)"
              name="password"
              value={password}
              onChange={onChange}
              minLength={6}
              required
              disabled={isRegistering}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="register-confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              id="register-confirmPassword"
              className={styles.inputField}
              type="password"
              placeholder="Re-enter your password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              minLength={6}
              required
              disabled={isRegistering}
            />
          </div>
          
          {/* Example for Role Selection (if it were active)
          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>Role:</label>
            <select id="role" name="role" value={role} onChange={onChange} disabled={isRegistering} className={styles.inputField}> // Re-using inputField for select
              <option value="employee">Employee</option>
              <option value="admin">Admin (Requires Approval)</option>
            </select>
          </div>
          */}

          {registrationError && <p className={styles.errorMessage}>{registrationError}</p>}
          {registrationSuccess && !registrationError && (
              <p className={styles.successMessage}>
                  Registration successful! Please <Link to="/login">login</Link>.
              </p>
          )}
          <div className={styles.submitButtonContainer}>
            <Button
              type="submit"
              variant="primary"
              disabled={isRegistering || registrationSuccess}
              fullWidth={true} // Make button full width
              size="large" // Consistent with Login button
            >
              {isRegistering ? "Registering..." : "Create Account"}
            </Button>
          </div>
          <p className={styles.signInPrompt}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
