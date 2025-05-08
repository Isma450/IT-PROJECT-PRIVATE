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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.token;
      
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.token;
      
      if (!token) {
        throw { error: 'Vous devez être connecté pour modifier un article' };
      }
      
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.token;
      
      if (!token) {
        throw { error: 'Vous devez être connecté pour supprimer un article' };
      }
      
      const config = {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
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
      // Récupérer le jeton depuis localStorage et s'assurer qu'il est valide
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.token;
      
      if (!token) {
        throw { error: 'Vous devez être connecté pour ajouter un commentaire' };
      }
      
      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Ajouter le commentaire
      await axiosInstance.post(`${API_URL}/posts/${postId}/comment/`, commentData, config);
      
      // Récupérer le post mis à jour avec le nouveau commentaire
      const updatedPost = await axiosInstance.get(`${API_URL}/posts/${postId}/`);
      return updatedPost.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erreur de connexion au serveur' };
    }
  },

  // Réagir à un post (ajouter/retirer un emoji)
  toggleReaction: async (postId, reactionData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.token;
      
      if (!token) {
        throw { error: 'Vous devez être connecté pour réagir à un article' };
      }
      
      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
  
      // Effectuer l'appel API pour ajouter ou retirer une réaction
      await axiosInstance.post(`${API_URL}/posts/${postId}/react/${reactionData.emoji}/`, {}, config);
  
      // Après la réaction, récupérer le post mis à jour
      const updatedPost = await axiosInstance.get(`${API_URL}/posts/${postId}/`);
      return updatedPost.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Erreur de connexion au serveur' };
    }
  }
};

export default postService; 