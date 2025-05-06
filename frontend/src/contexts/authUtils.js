// Fichier séparé pour les fonctions utilitaires d'authentification
import authService from '../services/authService';
import axiosInstance from '../utils/axiosConfig';

// Initialisation de l'authentification
export const initializeAuth = async (setCurrentUser, setLoading) => {
  try {
    // Je supprime l'appel à setCSRFToken qui n'existe plus
    
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    
    if (user && token) {
      setCurrentUser(user);
      // Configure axios pour inclure le token dans les en-têtes
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
  } finally {
    setLoading(false);
  }
};

// Configuration de l'intercepteur pour le rafraîchissement du token
export const setupTokenRefreshInterceptor = (logout) => {
  const interceptor = axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Si l'erreur est 401 et que ce n'est pas déjà une tentative de rafraîchissement
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const data = await authService.refreshToken();
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Si le rafraîchissement échoue, déconnexion
          logout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return interceptor;
};

// Fonctions d'authentification
export const registerUser = async (username, email, password, setCurrentUser, setError) => {
  try {
    setError(null);
    const data = await authService.register(username, email, password);
    setCurrentUser(data.user);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
    return data;
  } catch (err) {
    setError(err.error || 'Erreur lors de l\'inscription');
    throw err;
  }
};

export const loginUser = async (username, password, setCurrentUser, setError) => {
  try {
    setError(null);
    const data = await authService.login(username, password);
    setCurrentUser(data.user);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
    return data;
  } catch (err) {
    setError(err.error || 'Erreur lors de la connexion');
    throw err;
  }
};

export const logoutUser = async (setCurrentUser, setError) => {
  try {
    await authService.logout();
    setCurrentUser(null);
    delete axiosInstance.defaults.headers.common['Authorization'];
  } catch (err) {
    setError(err.error || 'Erreur lors de la déconnexion');
  }
};

export const resetPasswordRequestUser = async (email, setError) => {
  try {
    setError(null);
    return await authService.resetPasswordRequest(email);
  } catch (err) {
    setError(err.error || 'Erreur lors de la demande de réinitialisation');
    throw err;
  }
};

export const resetPasswordConfirmUser = async (token, password, setError) => {
  try {
    setError(null);
    return await authService.resetPasswordConfirm(token, password);
  } catch (err) {
    setError(err.error || 'Erreur lors de la réinitialisation du mot de passe');
    throw err;
  }
};
