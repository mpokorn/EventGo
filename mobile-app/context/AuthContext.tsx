import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  organizerLogin: (email: string, password: string) => Promise<void>;
  organizerRegister: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [token, userData] = await AsyncStorage.multiGet(['token', 'user']);
      
      if (token[1] && userData[1]) {
        // Check if token is expired
        try {
          const payload = JSON.parse(atob(token[1].split('.')[1]));
          const expiresAt = payload.exp * 1000;
          
          if (Date.now() >= expiresAt) {
            // Token expired, try to refresh
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              try {
                const response = await authService.refreshToken(refreshToken);
                await handleAuthSuccess(response);
              } catch (error) {
                await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
              }
            } else {
              await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
            }
          } else {
            setUser(JSON.parse(userData[1]));
          }
        } catch (error) {
          console.error('Error parsing token:', error);
          await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async (response: AuthResponse) => {
    const { token, refreshToken, user } = response;
    await AsyncStorage.multiSet([
      ['token', token],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    await handleAuthSuccess(response);
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    await handleAuthSuccess(response);
  };

  const organizerLogin = async (email: string, password: string) => {
    const response = await authService.organizerLogin(email, password);
    await handleAuthSuccess(response);
  };

  const organizerRegister = async (data: RegisterData) => {
    const response = await authService.organizerRegister(data);
    await handleAuthSuccess(response);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    organizerLogin,
    organizerRegister,
    logout,
    setUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
