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

    if (token && userData) setUser(JSON.parse(userData));
    setLoading(false);
  }, []);

  const handleAuthSuccess = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    handleAuthSuccess(res.data.token, res.data.user);
  };

  const register = async (data) => {
    const res = await authService.register(data);
    handleAuthSuccess(res.data.token, res.data.user);
  };

  const organizerLogin = async (email, password) => {
    const res = await authService.organizerLogin(email, password);
    handleAuthSuccess(res.data.token, res.data.user);
  };

  const organizerRegister = async (data) => {
    const res = await authService.organizerRegister(data);
    handleAuthSuccess(res.data.token, res.data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const requireAuth = (fn) => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return fn();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
