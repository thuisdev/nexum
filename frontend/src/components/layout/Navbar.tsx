import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom";
import { ROUTES } from '@/router/routes';
import { Link } from "react-router-dom";

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();

  const navigate = useNavigate();

  return (
    <>
      {isLoggedIn ? (
        <button onClick={() => { logout(); navigate(ROUTES.home) }}>
          Logout
        </button >
      ) : (
        <>
          <Link to="/login">Login</Link>
      Login
    </>)
}
    </>
  )
}

export default Navbar