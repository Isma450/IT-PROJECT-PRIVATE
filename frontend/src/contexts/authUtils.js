import authService from "../services/authService";
import axiosInstance from "../utils/axiosConfig";

export const initializeAuth = async (setCurrentUser, setLoading) => {
  try {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de l'authentification:",
      error
    );
  } finally {
    setLoading(false);
  }
};

export const setupTokenRefreshInterceptor = (logoutCallback) => {
  const interceptor = axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Si erreur 401 (non autorisé) et la requête n'a pas déjà été retentée
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Si l'erreur est liée à un jeton invalide
        if (error.response?.data?.code === 'token_not_valid') {
          try {
            // Essayer de rafraîchir le jeton
            const response = await axiosInstance.post('/refresh/');
            
            if (response.status === 200 && response.data.access) {
              // Mettre à jour le jeton dans localStorage
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              const updatedUser = {
                ...user,
                token: response.data.access
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              // Mettre à jour le header d'autorisation pour la requête originale
              originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
              
              // Retenter la requête originale avec le nouveau jeton
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Si le rafraîchissement échoue, déconnecter l'utilisateur
            logoutCallback();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return interceptor;
};

export const registerUser = async (
  username,
  email,
  password,
  setCurrentUser,
  setError
) => {
  try {
    setError(null);
    const data = await authService.register(username, email, password);
    setCurrentUser(data.user);
    return data;
  } catch (err) {
    setError(err.error || "Erreur lors de l'inscription");
    throw err;
  }
};

export const loginUser = async (
  username,
  password,
  setCurrentUser,
  setError
) => {
  try {
    setError(null);
    const data = await authService.login(username, password);
    setCurrentUser(data.user);
    return data;
  } catch (err) {
    setError(err.error || "Erreur lors de la connexion");
    throw err;
  }
};

export const logoutUser = async (setCurrentUser, setError) => {
  try {
    setError(null);
    await authService.logout();
    setCurrentUser(null);
  } catch (err) {
    setError(err.error || "Erreur lors de la déconnexion");
    throw err;
  }
};

export const resetPasswordRequestUser = async (email, setError) => {
  try {
    setError(null);
    return await authService.resetPasswordRequest(email);
  } catch (err) {
    setError(err.error || "Erreur lors de la demande de réinitialisation");
    throw err;
  }
};

export const resetPasswordConfirmUser = async (token, password, setError) => {
  try {
    setError(null);
    return await authService.resetPasswordConfirm(token, password);
  } catch (err) {
    setError(err.error || "Erreur lors de la réinitialisation du mot de passe");
    throw err;
  }
};
