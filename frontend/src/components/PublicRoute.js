import React from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// PublicRoute component to protect routes meant only for unauthenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Get authentication status from context

  // If the user is authenticated, redirect them to the home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />; // 'replace' prevents adding to history
  }

  // If the user is not authenticated, render the children (the component they tried to access)
  return children;
};

export default PublicRoute;
