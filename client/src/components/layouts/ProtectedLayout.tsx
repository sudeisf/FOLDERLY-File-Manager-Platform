import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedLayout() {
    const { isLoggedIn, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    // Store the current location in sessionStorage
    if (!isLoggedIn && location.pathname !== '/login') {
        // Only store the location if it's not already the login page
        sessionStorage.setItem('lastPage', location.pathname);
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    // If logged in, show the protected content
    return <Outlet />;
}
