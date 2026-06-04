import type { User } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardPathForRole } from "@/lib/authRedirect";
import { Navigate, Outlet } from "react-router-dom";

type RoleRouteProps = {
    allowedRoles: User['role'][]
};

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const { user } = useAuth();
    if (!user) {
        return null
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={getDashboardPathForRole(user.role)} replace />
    }

    return (
        <Outlet />
    )
}

export default RoleRoute
