import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated, selectCurrentUser, selectAuthIsLoading } from '../../store/slices/authSlice';
import LoadingMessage from './LoadingMessage'; // Import a loading indicator

interface PrivateRouteProps {
  children: ReactNode;
  role?: string; // Optional role prop for role-based access control
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const isLoadingAuth = useAppSelector(selectAuthIsLoading); // Use the general auth loading state

  if (isLoadingAuth) {
    // If auth state is still loading (e.g., checking token, or login in progress from another tab), show loading.
    // This helps prevent premature redirects if isAuthenticated is briefly false during initial load.
    return <LoadingMessage message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login page
    return <Navigate to="/login" replace />; // Added replace to prevent going back to this route
  }

  if (role && currentUser?.role !== role) {
    // Authenticated but does not have the required role, redirect to a default/home page or an unauthorized page
    // console.warn(`User with role '${currentUser?.role}' tried to access a route restricted to '${role}'. Redirecting.`);
    return <Navigate to="/" replace />; // Or to an "/unauthorized" page
  }

  // Authenticated and (if role prop is provided) has the required role
  return <>{children}</>; // Render the children
};

export default PrivateRoute;
