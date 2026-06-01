import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from './routes'
import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from './guards/ProtectedRoute'
import DashboardRedirect from '@/pages/DashboardRedirect'
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  JobBoardPage,
  ClientDashboard,
  FreelancerDashboard,
  CreateProjectPage,
  ProjectDetailPage,
  UserProfilePage,
  SettingsPage,
  NotFoundPage,
} from './lazyPages'
import { withSuspense } from './withSuspense'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.home, element: withSuspense(LandingPage) },
      { path: ROUTES.login, element: withSuspense(LoginPage) },
      { path: ROUTES.register, element: withSuspense(RegisterPage) },
      { path: ROUTES.jobs, element: withSuspense(JobBoardPage) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardRedirect /> },
          { path: ROUTES.clientDashboard, element: withSuspense(ClientDashboard) },
          { path: ROUTES.freelancerDashboard, element: withSuspense(FreelancerDashboard) },
          { path: ROUTES.createProject, element: withSuspense(CreateProjectPage) },
          { path: '/projects/:id', element: withSuspense(ProjectDetailPage) },
          { path: '/users/:id', element: withSuspense(UserProfilePage) },
          { path: ROUTES.settings, element: withSuspense(SettingsPage) },
        ],
      },
    ],
  },
  { path: '*', element: withSuspense(NotFoundPage) },
])
