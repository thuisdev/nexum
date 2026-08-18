import { ROUTES } from '@/router/routes';
import type { User } from '@/types/user';

export function getDashboardPathForRole(role: User['role']): string {
  switch (role) {
    case 'FREELANCER':
      return ROUTES.freelancerDashboard;
    case 'CLIENT':
      return ROUTES.clientDashboard;
    case 'ADMIN':
      return ROUTES.adminDashboard;
    case 'ARBITER':
      return ROUTES.arbiterDashboard;
    default:
      return ROUTES.dashboard;
  }
}

const AUTH_PATHS = new Set<string>([ROUTES.login, ROUTES.register]);

type ReturnLocation = {
  pathname?: string;
  search?: string;
  hash?: string;
};

/** Safe in-app path to resume after login/register. Falls back to dashboard. */
export function getPostAuthRedirect(from?: ReturnLocation | null) {
  const pathname = from?.pathname;
  if (!pathname || !pathname.startsWith('/') || AUTH_PATHS.has(pathname)) {
    return ROUTES.dashboard;
  }

  return `${pathname}${from.search ?? ''}${from.hash ?? ''}`;
}
