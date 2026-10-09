import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [], requiredPermission = null }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-bg">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check Role Access if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12">
        <Card ecoBorder={true} className="text-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
          <p className="text-xs text-slate-600">
            Your current role <Badge variant="warning">{user.role}</Badge> is not authorized to access this module.
          </p>
        </Card>
      </div>
    );
  }

  // Check Permission Access if specified
  if (requiredPermission && !['ORGANIZER', 'SUPER_ADMIN'].includes(user.role)) {
    const userPermissions = user.permissions || [];
    if (!userPermissions.includes(requiredPermission) && !userPermissions.includes('*')) {
      return (
        <div className="p-8 max-w-lg mx-auto mt-12">
          <Card ecoBorder={true} className="text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Insufficient Permission</h3>
            <p className="text-xs text-slate-600">
              Missing required permission: <code className="bg-slate-100 text-sky-700 px-2 py-0.5 rounded font-mono">{requiredPermission}</code>
            </p>
          </Card>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
