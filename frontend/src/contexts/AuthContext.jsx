import { createContext, useState, useEffect, useContext } from "react";
import {
  initializeAuth,
  setupTokenRefreshInterceptor,
  registerUser,
  loginUser,
  logoutUser,
  resetPasswordRequestUser,
  resetPasswordConfirmUser,
} from "./authUtils";
import axiosInstance from "../utils/axiosConfig";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      await initializeAuth(setCurrentUser, setLoading);
    })();
  }, []);

  useEffect(() => {
    const interceptor = setupTokenRefreshInterceptor(() =>
      logoutUser(setCurrentUser, setError)
    );
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  const register = async (username, email, password) => {
    setActionLoading(true);
    try {
      return await registerUser(
        username,
        email,
        password,
        setCurrentUser,
        setError
      );
    } finally {
      setActionLoading(false);
    }
  };

  const login = async (username, password) => {
    setActionLoading(true);
    try {
      return await loginUser(username, password, setCurrentUser, setError);
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    setActionLoading(true);
    try {
      return await logoutUser(setCurrentUser, setError);
    } finally {
      setActionLoading(false);
    }
  };

  const resetPasswordRequest = async (email) => {
    setActionLoading(true);
    try {
      return await resetPasswordRequestUser(email, setError);
    } finally {
      setActionLoading(false);
    }
  };

  const resetPasswordConfirm = async (token, password) => {
    setActionLoading(true);
    try {
      return await resetPasswordConfirmUser(token, password, setError);
    } finally {
      setActionLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    actionLoading,
    error,
    register,
    login,
    logout,
    resetPasswordRequest,
    resetPasswordConfirm,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
