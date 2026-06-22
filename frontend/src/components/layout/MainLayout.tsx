import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

export default function MainLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar key={location.pathname} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
