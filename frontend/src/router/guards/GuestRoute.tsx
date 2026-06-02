import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/router/routes';
import { PageLoader } from '@/router/PageLoader';

const GuestRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (isLoggedIn) return <Navigate to={ROUTES.dashboard} replace />;

  return <Outlet />;
};

export default GuestRoute;