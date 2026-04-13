import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatePanel from './StatePanel';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <StatePanel title="Checking your session" description="Preparing your account details..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <StatePanel title="Loading admin access" description="Verifying your permissions..." />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ from: location, forceRelogin: true }} />;
  }

  return <Outlet />;
}
