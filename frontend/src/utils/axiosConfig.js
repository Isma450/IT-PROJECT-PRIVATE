import axios from 'axios';

// Configuration de base d'Axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, // Essentiel pour envoyer les cookies dans les requêtes cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Ajoute un timeout de 10s pour éviter les requêtes qui restent bloquées
});

// Configurer axios pour gérer automatiquement les jetons CSRF
axiosInstance.defaults.xsrfCookieName = 'csrftoken';
axiosInstance.defaults.xsrfHeaderName = 'X-CSRFToken';

// Ajouter des intercepteurs pour déboguer
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Requête envoyée:', config.method.toUpperCase(), config.url);
    console.log('Données:', config.data);
    return config;
  },
  (error) => {
    console.error('Erreur lors de la requête:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Réponse reçue:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Erreur de réponse:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Données:', error.response?.data);
    return Promise.reject(error);
  }
);

// Fonction pour configurer les headers d'authentification
export const setupAxiosInterceptors = () => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Ajouter l'origine pour le debug CORS
      config.headers['Origin'] = window.location.origin;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
