import { Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
  // TODO: Auth-Check + Redirect zu /login
  return <Outlet />
}

export default ProtectedRoute
