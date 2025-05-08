import axiosInstance from "../utils/axiosConfig";

const API_URL = "";

const authService = {
  register: async (username, email, password) => {
    try {
      console.log("Tentative d'inscription avec:", { username, email });
      const response = await axiosInstance.post(`${API_URL}/register/`, {
        username,
        email,
        password,
      });

      console.log("Réponse d'inscription:", response.data);
      if (response.data.user) {
        const userData = {
          ...response.data.user,
          token: response.data.access
        };
        localStorage.setItem("user", JSON.stringify(userData));
      }

      return response.data;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error.response
        ? error.response.data
        : { error: "Erreur de connexion au serveur" };
    }
  },

  login: async (username, password) => {
    try {
      console.log("Tentative de connexion avec:", { username });
      const response = await axiosInstance.post(`${API_URL}/login/`, {
        username,
        password,
      });

      console.log("Réponse de connexion:", response.data);
      if (response.data.user) {
        const userData = {
          ...response.data.user,
          token: response.data.access
        };
        localStorage.setItem("user", JSON.stringify(userData));
      }

      return response.data;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error.response
        ? error.response.data
        : { error: "Erreur de connexion au serveur" };
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post(`${API_URL}/logout/`, {});
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  },

  resetPasswordRequest: async (email) => {
    try {
      console.log("Tentative de réinitialisation de mot de passe pour:", email);
      const response = await axiosInstance.post(`${API_URL}/password/reset/`, {
        email,
      });
      console.log("Réponse de réinitialisation:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      console.error(
        "Détails de l'erreur:",
        error.response?.data || error.message
      );
      throw error.response
        ? error.response.data
        : { error: "Erreur lors de la demande de réinitialisation" };
    }
  },

  resetPasswordConfirm: async (token, password) => {
    try {
      console.log(
        "Tentative de réinitialisation de mot de passe avec token:",
        token
      );
      console.log("URL appelée:", `${API_URL}/password/reset/${token}`);

      const response = await axiosInstance.post(
        `${API_URL}/password/reset/${token}/`,
        { password }
      );
      console.log("Réponse de réinitialisation (confirm):", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe:",
        error
      );
      console.error(
        "Détails de l'erreur:",
        error.response?.data || error.message
      );
      throw error.response
        ? error.response.data
        : { error: "Erreur lors de la réinitialisation du mot de passe" };
    }
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  },
};

export default authService;
