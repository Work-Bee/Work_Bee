import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    let loginPath = '/login/jobseeker';

    if (roles.length === 1) {
      if (roles[0] === 'admin') {
        loginPath = '/login/admin';
      } else if (roles[0] === 'employer') {
        loginPath = '/login/employer';
      } else if (roles[0] === 'jobseeker') {
        loginPath = '/login/jobseeker';
      }
    } else {
      const onlyAdmin = roles.length > 0 && roles.every((role) => role === 'admin');
      if (onlyAdmin) {
        loginPath = '/login/admin';
      } else if (roles.includes('employer') && !roles.includes('jobseeker')) {
        loginPath = '/login/employer';
      } else if (roles.includes('jobseeker') && !roles.includes('employer')) {
        loginPath = '/login/jobseeker';
      }
    }

    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;