import axiosInstance from "../utils/axiosConfig";

const API_URL = "";

const postService = {
  getAllPosts: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/posts/`);
      return response.data;
    } catch (error) {
      throw error.response
        ? error.response.data
        : { error: "Erreur de connexion au serveur" };
    }
  },

  getPostById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/posts/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response
        ? error.response.data
        : { error: "Erreur de connexion au serveur" };
    }
  },

  createPost: async (postData) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/posts/create/`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw {
        error:
          error.response?.data?.error || "Erreur lors de la création du post",
        status: error.response?.status,
      };
    }
  },

  updatePost: async (id, postData) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/posts/${id}/update/`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response
        ? error.response.data
        : { error: "Erreur de connexion au serveur" };
    }
  },

  deletePost: async (id) => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/posts/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response
        ? error.response.data
        : { error: "Erreur de connexion au serveur" };
    }
  },

  addComment: async (postId, commentData) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/posts/${postId}/comment/`,
        commentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response
        ? error.response.data
        : { error: "Erreur de connexion au serveur" };
    }
  },

  toggleReaction: async (postId, reactionData) => {
    try {
      const { emoji } = reactionData;
      const response = await axiosInstance.post(
        `${API_URL}/posts/${postId}/react/${emoji}/`,
        null,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response
        ? error.response.data
        : { error: "Erreur de connexion au serveur" };
    }
  },

  explainPost: async (postId, text) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/posts/${postId}/suggestions/`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw { error: "Fonctionnalité réservée aux administrateurs" };
      }
      if (error.response?.status === 404) {
        throw { error: "Service d'explication temporairement indisponible" };
      }
      throw error.response
        ? error.response.data
        : { error: "Erreur de connexion au serveur" };
    }
  },
};

export default postService;
