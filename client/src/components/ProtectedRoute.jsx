import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute — Wrapper for restricting access to authenticated users and specific roles.
 *
 * Props:
 *  - allowedRoles?: string[] (e.g. ['admin', 'doctor'])
 *  - children: ReactNode
 */
export function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          fontFamily: 'system-ui, sans-serif',
          color: '#64748b',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(14,165,233,0.2)',
              borderTopColor: '#0ea5e9',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 0.75rem',
            }}
          />
          <span>Checking authorization…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving current location for post-login redirect
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div
        style={{
          maxWidth: '500px',
          margin: '4rem auto',
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ color: '#b91c1c', margin: '0 0 0.5rem' }}>Access Denied</h2>
        <p style={{ color: '#64748b', margin: 0 }}>
          You do not have permission to view this page. Required role: {allowedRoles.join(', ')}.
        </p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
