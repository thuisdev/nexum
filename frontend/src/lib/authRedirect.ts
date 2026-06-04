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
    case 'ARBITER' :
      return ROUTES.arbiterDashboard;
    default:
      return ROUTES.dashboard;
  }
}