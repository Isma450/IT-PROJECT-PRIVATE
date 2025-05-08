import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import postService from '../services/postService';

const BlogCreations = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [commentPages, setCommentPages] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const COMMENTS_PER_PAGE = 5;

  useEffect(() => {
    fetchPosts();
  }, [currentUser]);

  const fetchPosts = async () => {
    try {
      const data = await postService.getAllPosts();
      setPosts(data);
      // Initialiser les commentaires pour chaque post
      const initialComments = {};
      const initialPages = {};
      data.forEach(post => {
        initialComments[post.id] = '';
        initialPages[post.id] = 1;
      });
      setComments(initialComments);
      setCommentPages(initialPages);
    } catch (err) {
      setError(err.error || 'Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId, emoji) => {
    if (!currentUser) return;
    try {
      const updatedPost = await postService.toggleReaction(postId, { emoji });
      
      // Mise à jour optimiste de l'état local
      setPosts(posts.map(post => {
        if (post.id === postId) {
          // Créer une copie du post avec les réactions mises à jour
          const updatedReactions = [...(post.reactions || [])];
          
          // Vérifier si l'utilisateur actuel a déjà réagi avec cet emoji
          const userReactionIndex = updatedReactions.findIndex(
            r => r.emoji === emoji && r.user === currentUser.id
          );

          if (userReactionIndex !== -1) {
            // Si l'utilisateur a déjà réagi, supprimer sa réaction
            updatedReactions.splice(userReactionIndex, 1);
          } else {
            // Si l'utilisateur n'a pas encore réagi, ajouter sa réaction
            updatedReactions.push({
              emoji,
              user: currentUser.id,
              created_at: new Date().toISOString()
            });
          }

          return {
            ...post,
            reactions: updatedReactions
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Erreur lors de la réaction:', err);
      // En cas d'erreur, recharger les posts pour s'assurer que l'état est cohérent
      fetchPosts();
    }
  };

  // Fonction utilitaire pour compter les réactions
  const getReactionCount = (post, emoji) => {
    return post.reactions?.filter(r => r.emoji === emoji).length || 0;
  };

  // Fonction utilitaire pour vérifier si l'utilisateur a réagi
  const hasUserReacted = (post, emoji) => {
    return post.reactions?.some(r => r.emoji === emoji && r.user === currentUser?.id);
  };

  const handleCommentChange = (postId, value) => {
    setComments(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault(); // Empêcher la redirection par défaut
    if (!comments[postId]?.trim()) return;

    setSubmitting(prev => ({ ...prev, [postId]: true }));
    try {
      const updatedPost = await postService.addComment(postId, { content: comments[postId] });
      // Mise à jour optimiste de l'état local
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), {
              id: Date.now(), // ID temporaire
              content: comments[postId],
              author: currentUser,
              created_at: new Date().toISOString()
            }]
          };
        }
        return post;
      }));
      setComments(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Erreur lors de l\'ajout du commentaire:', err);
      // En cas d'erreur, recharger les posts pour s'assurer que l'état est cohérent
      fetchPosts();
    } finally {
      setSubmitting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handlePageChange = (postId, newPage) => {
    setCommentPages(prev => ({
      ...prev,
      [postId]: newPage
    }));
  };

  const handleReadMore = (postId) => {
    navigate(`/posts/${postId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Affichage des posts
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Découvrez les derniers articles de notre communauté
        </p>
      </div>

      {currentUser?.is_staff && (
        <div className="flex justify-end mb-8">
          <Link
            to="/create-post"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Nouveau post
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {post.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>Par {post.author.username}</span>
                <span className="mx-2">•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="relative">
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-5">
                  {post.content}
                </p>
                <button
                  onClick={() => handleReadMore(post.id)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Lire la suite
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* Réactions */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleReaction(post.id, 'LIKE')}
                    disabled={!currentUser}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      !currentUser ? 'opacity-50 cursor-not-allowed' : ''
                    } ${hasUserReacted(post, 'LIKE') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  >
                    👍
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getReactionCount(post, 'LIKE')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleReaction(post.id, 'LOVE')}
                    disabled={!currentUser}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      !currentUser ? 'opacity-50 cursor-not-allowed' : ''
                    } ${hasUserReacted(post, 'LOVE') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  >
                    ❤️
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getReactionCount(post, 'LOVE')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleReaction(post.id, 'HAHA')}
                    disabled={!currentUser}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      !currentUser ? 'opacity-50 cursor-not-allowed' : ''
                    } ${hasUserReacted(post, 'HAHA') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  >
                    😂
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getReactionCount(post, 'HAHA')}
                  </span>
                </div>
              </div>

              {/* Section commentaires */}
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Commentaires ({post.comments?.length || 0})
                </h3>
                
                {/* Liste des commentaires */}
                <div className="space-y-3 mb-4">
                  {post.comments
                    ?.slice(
                      (commentPages[post.id] - 1) * COMMENTS_PER_PAGE,
                      commentPages[post.id] * COMMENTS_PER_PAGE
                    )
                    .map(comment => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.author.username}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm break-words whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                </div>

                {/* Pagination des commentaires */}
                {post.comments?.length > COMMENTS_PER_PAGE && (
                  <div className="flex justify-center space-x-2 mb-4">
                    <button
                      onClick={() => handlePageChange(post.id, commentPages[post.id] - 1)}
                      disabled={commentPages[post.id] === 1}
                      className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <span className="px-3 py-1 text-gray-600 dark:text-gray-400">
                      Page {commentPages[post.id]} sur {Math.ceil(post.comments.length / COMMENTS_PER_PAGE)}
                    </span>
                    <button
                      onClick={() => handlePageChange(post.id, commentPages[post.id] + 1)}
                      disabled={commentPages[post.id] >= Math.ceil(post.comments.length / COMMENTS_PER_PAGE)}
                      className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                )}

                {/* Formulaire de commentaire */}
                {currentUser && (
                  <form 
                    onSubmit={(e) => handleCommentSubmit(post.id, e)} 
                    className="mt-4"
                    noValidate
                  >
                    <textarea
                      value={comments[post.id] || ''}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    />
                    <button
                      type="submit"
                      disabled={submitting[post.id] || !comments[post.id]?.trim()}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting[post.id] ? 'Envoi...' : 'Commenter'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogCreations; 