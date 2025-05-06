import { createContext, useState, useEffect, useContext } from 'react';
import { 
  initializeAuth, 
  setupTokenRefreshInterceptor, 
  registerUser, 
  loginUser, 
  logoutUser, 
  resetPasswordRequestUser, 
  resetPasswordConfirmUser 
} from './authUtils';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialisation de l'authentification
  useEffect(() => {
    // Fonction asynchrone auto-invoquée 
    (async () => {
      await initializeAuth(setCurrentUser, setLoading);
    })();
  }, []);


  useEffect(() => {
    const interceptor = setupTokenRefreshInterceptor(() => logoutUser(setCurrentUser, setError));
    
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

 
  const register = async (username, email, password) => {
    return registerUser(username, email, password, setCurrentUser, setError);
  };


  const login = async (username, password) => {
    return loginUser(username, password, setCurrentUser, setError);
  };


  const logout = async () => {
    return logoutUser(setCurrentUser, setError);
  };


  const resetPasswordRequest = async (email) => {
    return resetPasswordRequestUser(email, setError);
  };


  const resetPasswordConfirm = async (token, password) => {
    return resetPasswordConfirmUser(token, password, setError);
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    resetPasswordRequest,
    resetPasswordConfirm
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export default AuthContext;
