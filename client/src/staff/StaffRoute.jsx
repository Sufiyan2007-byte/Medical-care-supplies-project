import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { STAFF_ROLES } from './api';
import { useS } from './strings';

/**
 * Guards the staff panel. Not signed in → /staff/login.
 * Signed in but a customer → /staff/login with a notice.
 * `roles` narrows further (e.g. ['developer']) — others are sent back to the overview.
 */
export default function StaffRoute({ children, roles }) {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();
  const { s } = useS();

  if (isLoading) return <div className="staff-boot">{s('loading')}</div>;
  if (!isAuthenticated) return <Navigate to="/staff/login" state={{ from: location.pathname }} replace />;
  if (!STAFF_ROLES.includes(user?.role)) return <Navigate to="/staff/login" state={{ denied: true }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/staff" replace />;
  return children;
}
