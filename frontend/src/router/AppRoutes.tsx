import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from './routes'
import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from './guards/ProtectedRoute'
import DashboardRedirect from '@/pages/DashboardRedirect'
import RoleRoute from './guards/RoleRoute'
import GuestRoute from './guards/GuestRoute'
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
  AdminDashboard,
  ArbiterDashboard,
} from './lazyPages'
import { withSuspense } from './withSuspense'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.home, element: withSuspense(LandingPage) },
      { path: ROUTES.jobs, element: withSuspense(JobBoardPage) },
      { path: '/projects/:id', element: withSuspense(ProjectDetailPage) },
      { path: '/users/:id', element: withSuspense(UserProfilePage) },
      {
        element: <GuestRoute />,
        children: [
          { path: ROUTES.login, element: withSuspense(LoginPage) },
          { path: ROUTES.register, element: withSuspense(RegisterPage) }
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardRedirect /> },
          { path: ROUTES.settings, element: withSuspense(SettingsPage) },
          {
            element: <RoleRoute allowedRoles={['CLIENT']} />,
            children: [
              { path: ROUTES.clientDashboard, element: withSuspense(ClientDashboard) },
              { path: ROUTES.createProject, element: withSuspense(CreateProjectPage) },
            ]
          },
          {
            element: <RoleRoute allowedRoles={['FREELANCER']} />,
            children: [
              { path: ROUTES.freelancerDashboard, element: withSuspense(FreelancerDashboard) },
            ]
          },
          {
            element: <RoleRoute allowedRoles={['ADMIN']} />,
            children: [
              { path: ROUTES.adminDashboard, element: withSuspense(AdminDashboard) },
              { path: ROUTES.clientDashboard, element: withSuspense(ClientDashboard) },
              { path: ROUTES.freelancerDashboard, element: withSuspense(FreelancerDashboard) },
              { path: ROUTES.createProject, element: withSuspense(CreateProjectPage) },
            ]
          },
          {
            element: <RoleRoute allowedRoles={['ARBITER']} />,
            children: [
              { path: ROUTES.arbiterDashboard, element: withSuspense(ArbiterDashboard) },
            ]
          }
        ],
      },
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },
])
