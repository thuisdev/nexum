import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardPathForRole } from '@/lib/authRedirect';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return null;

  return <Navigate to={getDashboardPathForRole(user.role)} replace />;
};

export default DashboardRedirect;