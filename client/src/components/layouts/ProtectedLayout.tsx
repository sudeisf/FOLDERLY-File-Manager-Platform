import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedLayout() {
    const { isLoggedIn, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="grid min-h-screen place-content-center text-sm text-muted-foreground">Checking session...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}
