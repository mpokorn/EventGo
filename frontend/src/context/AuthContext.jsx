import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        
        if (Date.now() >= expiresAt) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            // The axios interceptor will handle the refresh automatically
            setUser(JSON.parse(userData));
          } else {
            localStorage.clear();
          }
        } else {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (token, refreshToken, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    handleAuthSuccess(res.data.token, res.data.refreshToken, res.data.user);
  };

  const register = async (data) => {
    const res = await authService.register(data);
    handleAuthSuccess(res.data.token, res.data.refreshToken, res.data.user);
  };

  const organizerLogin = async (email, password) => {
    const res = await authService.organizerLogin(email, password);
    handleAuthSuccess(res.data.token, res.data.refreshToken, res.data.user);
  };

  const organizerRegister = async (data) => {
    const res = await authService.organizerRegister(data);
    handleAuthSuccess(res.data.token, res.data.refreshToken, res.data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const isTokenExpired = () => {
    const token = localStorage.getItem("token");
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      
      // Consider token expired if it expires within 1 minute
      return Date.now() >= (expiresAt - 60000);
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  };

  const requireAuth = (redirectPath) => {
    if (!user) {
      // Save the current location to redirect back after login
      const currentPath = window.location.pathname + window.location.search;
      navigate("/login", { state: { returnTo: currentPath } });
      return false;
    }

    // Check token expiry before proceeding
    if (isTokenExpired()) {
      console.warn("Token expired, logging out");
      logout();
      const currentPath = redirectPath || window.location.pathname + window.location.search;
      navigate("/login", { state: { returnTo: currentPath } });
      return false;
    }

    return true;
  };

  const checkAuth = () => {
    return user && !isTokenExpired();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        organizerLogin,
        organizerRegister,
        requireAuth,
        checkAuth,
        isTokenExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
