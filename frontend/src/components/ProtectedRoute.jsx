import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    // Determine default role query param if possible, or just default to /login
    return <Navigate to="/role-select" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'lgu' || user.role === 'admin') {
      return <Navigate to="/lgu" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
