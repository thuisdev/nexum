import { lazy, Suspense, type LazyExoticComponent, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from './routes'
import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from './guards/ProtectedRoute'
import DashboardRedirect from '@/pages/DashboardRedirect'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const JobBoardPage = lazy(() => import('@/pages/JobBoardPage'))
const ClientDashboard = lazy(() => import('@/pages/ClientDashboard'))
const FreelancerDashboard = lazy(() => import('@/pages/FreelancerDashboard'))
const CreateProjectPage = lazy(() => import('@/pages/CreateProjectPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">Loading…</div>
)

const withSuspense = (Page: LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<PageLoader />}>
    <Page />
  </Suspense>
)

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
