import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        import('react-toastify').then(({ toast }) => {
          toast.info('Please log in to access this page.');
        }).catch(err => {
          console.warn('Failed to load toast for redirect:', err);
        });
      } else if (requiredRole && user?.role !== requiredRole) {
        import('react-toastify').then(({ toast }) => {
          toast.error('Access denied. You do not have permission to view this page.');
        }).catch(err => {
          console.warn('Failed to load toast for role denial:', err);
        });
      }
    }
  }, [isAuthenticated, user, loading, requiredRole, location]);

  if (loading) {
    return <div className="loading">Checking access...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;