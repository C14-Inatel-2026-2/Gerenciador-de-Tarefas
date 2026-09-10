import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../auth/session';

export function ProtectedRoute() {
  const session = useSession();
  return session ? <Outlet /> : <Navigate to="/" replace />;
}
