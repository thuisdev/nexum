import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </>
  )
}

export default MainLayout
