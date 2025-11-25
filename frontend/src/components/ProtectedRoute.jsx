import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireOrganizer = false }) {
  const { user, loading, checkAuth } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white' 
      }}>
        Loading...
      </div>
    );
  }

  // Check if user is authenticated and token is valid
  if (!checkAuth()) {
    // Redirect to login with return path
    return (
      <Navigate 
        to="/login" 
        state={{ returnTo: location.pathname + location.search }} 
        replace 
      />
    );
  }

  // Check organizer role if required
  if (requireOrganizer && user?.role !== 'organizer') {
    return (
      <Navigate 
        to="/" 
        replace 
      />
    );
  }

  return children;
}
