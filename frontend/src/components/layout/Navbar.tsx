import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom";
import { ROUTES } from '@/router/routes';

const Navbar = () => {
  const { logout } = useAuth();

  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => { logout(); navigate(ROUTES.home); }}>Logout</button>
    </>
  )
}

export default Navbar