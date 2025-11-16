// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 On app load: restore user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      // interceptor will handle attaching token to requests
      setUser(JSON.parse(userData));
    }

    setLoading(false);
  }, []);

  // 🔑 Login: always persist to localStorage
  const login = async (email, password) => {
    try {
      const response = await api.post("/users/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return true;
    } catch (error) {
      throw error;
    }
  };

  // 🆕 Register normal user
  const register = async (userData) => {
    try {
      const response = await api.post("/users/register", userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return true;
    } catch (error) {
      throw error;
    }
  };

  // 🔑 Organizer login
  const organizerLogin = async (email, password) => {
    try {
      const response = await api.post("/users/organizer-login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return true;
    } catch (error) {
      throw error;
    }
  };

  // 🆕 Organizer register
  const organizerRegister = async (userData) => {
    try {
      const response = await api.post("/users/organizer-register", userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return true;
    } catch (error) {
      throw error;
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // Guard helper for protected actions/pages
  const requireAuth = (callback) => {
    if (!user) {
      navigate("/login", { state: { returnTo: window.location.pathname } });
      return false;
    }
    return callback();
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
