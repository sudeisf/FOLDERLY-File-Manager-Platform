import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchAuthStatus = async (): Promise<{ success: boolean }> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/protected`, {
    withCredentials: true,
  });
  // Backend responses can be either { success } or { data: { success } }.
  return response.data?.data ?? response.data;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

 
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await fetchAuthStatus();
        const authenticated = Boolean(data?.success);
        setIsLoggedIn(authenticated);
        if (authenticated) {
          localStorage.setItem("isLoggedIn", "true");
        } else {
          localStorage.removeItem("isLoggedIn");
        }
      } catch {
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const logout = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        withCredentials: true,
      });
      const data = response.data;
      if (data.success) {
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { useAuth };
