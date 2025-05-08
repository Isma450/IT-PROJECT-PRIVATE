import axiosInstance from '../utils/axiosConfig';
import axios from 'axios';

const API_URL = '';

const postService = {
  // Récupérer tous les posts
  getAllPosts: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/posts/`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erreur de connexion au serveur' };
    }
  },

  // Récupérer un post par son ID
  getPostById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/posts/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erreur de connexion au serveur' };
    }
  },

  // Créer un nouveau post
  createPost: async (postData) => {
    try {
      // Vérification de l'authentification
      const token = localStorage.getItem('token');
      if (!token) {
        throw { error: 'Vous devez être connecté pour créer un article' };
      }
      
      // Utiliser directement axios avec une configuration spécifique
      const response = await axios.post('http://localhost:8000/api/posts/create/', postData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      // Retourner l'erreur avec des informations utiles
      throw {
        error: error.response?.data?.error || 'Erreur lors de la création du post',
        status: error.response?.status
      };
    }
  },

  // Mettre à jour un post existant
  updatePost: async (id, postData) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axiosInstance.put(`${API_URL}/posts/${id}/update/`, postData, config);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erreur de connexion au serveur' };
    }
  },

  // Supprimer un post
  deletePost: async (id) => {
    try {
      const config = {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const response = await axiosInstance.delete(`${API_URL}/posts/${id}/`, config);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erreur de connexion au serveur' };
    }
  },

  // Ajouter un commentaire à un post
  addComment: async (postId, commentData) => {
    try {
      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const response = await axiosInstance.post(`${API_URL}/posts/${postId}/comments/`, commentData, config);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erreur de connexion au serveur' };
    }
  },

  // Réagir à un post (ajouter/retirer un emoji)
  toggleReaction: async (postId, reactionData) => {
    try {
      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const response = await axiosInstance.post(`${API_URL}/posts/${postId}/reactions/`, reactionData, config);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erreur de connexion au serveur' };
    }
  }
};

export default postService; 