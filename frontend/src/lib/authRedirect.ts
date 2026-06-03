import { ROUTES } from '@/router/routes';
import type { User } from '@/types/user';

export function getDashboardPathForRole(role: User['role']): string {
  switch (role) {
    case 'FREELANCER':
      return ROUTES.freelancerDashboard;
    case 'CLIENT':
      return ROUTES.clientDashboard;
    default:
      return ROUTES.dashboard;
  }
}