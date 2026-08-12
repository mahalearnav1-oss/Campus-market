import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export interface GuardProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EFE7] flex items-center justify-center p-4">
        <div className="text-center font-sans text-xs text-[#8B7562]">
          <div className="w-10 h-10 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-3" />
          Checking authentication…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const AdminRoute: React.FC<GuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EFE7] flex items-center justify-center p-4">
        <div className="text-center font-sans text-xs text-[#8B7562]">
          <div className="w-10 h-10 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-3" />
          Verifying admin role…
        </div>
      </div>
    );
  }

  const isAdminRole = user?.role === 'ADMIN' || user?.role === 'MODERATOR' || user?.role === 'SUPER_ADMIN';

  if (!isAuthenticated || !isAdminRole) {
    return <Navigate to="/admin" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const RequireAuth = ProtectedRoute;

export const UnauthOnly: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EFE7] flex items-center justify-center p-4">
        <div className="text-center font-sans text-xs text-[#8B7562]">
          <div className="w-10 h-10 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-3" />
          Checking authentication…
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
