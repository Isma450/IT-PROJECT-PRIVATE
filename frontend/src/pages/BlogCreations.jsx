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
  const [expandedComments, setExpandedComments] = useState({});
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
      const initialExpanded = {};
      data.forEach(post => {
        initialComments[post.id] = '';
        initialPages[post.id] = 1;
        initialExpanded[post.id] = false;
      });
      setComments(initialComments);
      setCommentPages(initialPages);
      setExpandedComments(initialExpanded);
    } catch (err) {
      setError(err.error || 'Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId, emoji) => {
    if (!currentUser) return;
    try {
      await postService.toggleReaction(postId, { emoji });
      
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

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault(); // Empêcher la redirection par défaut
    if (!comments[postId]?.trim()) return;

    setSubmitting(prev => ({ ...prev, [postId]: true }));
    try {
      await postService.addComment(postId, { content: comments[postId] });
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-400 p-6 rounded-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Une erreur est survenue</h3>
          </div>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero section */}
      <div className="bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Notre Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Découvrez les derniers articles, conseils et actualités de notre communauté
            </p>
            
            {currentUser?.is_staff && (
              <div className="mt-8">
                <Link
                  to="/create-post"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Créer un nouvel article
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Aucun article pour le moment</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Revenez plus tard ou créez le premier article!</p>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <article key={post.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                <div className="p-6 flex-grow">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  
                  {/* Titre et auteur */}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 hover:text-gray-700 dark:hover:text-gray-300 transition">
                    <button onClick={() => handleReadMore(post.id)} className="text-left focus:outline-none">
                      {post.title}
                    </button>
                  </h2>
                  
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium mr-3">
                      {post.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  <div className="prose prose-sm dark:prose-invert mb-4 max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleReadMore(post.id)}
                    className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium flex items-center transition"
                  >
                    Lire la suite
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </div>
                
                {/* Footer avec réactions et commentaires */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    {/* Réactions */}
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => handleReaction(post.id, 'LIKE')}
                        disabled={!currentUser}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md transition ${
                          hasUserReacted(post, 'LIKE') 
                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>👍</span>
                        <span className="text-xs font-medium">{getReactionCount(post, 'LIKE')}</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleReaction(post.id, 'LOVE')}
                        disabled={!currentUser}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md transition ${
                          hasUserReacted(post, 'LOVE') 
                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>❤️</span>
                        <span className="text-xs font-medium">{getReactionCount(post, 'LOVE')}</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleReaction(post.id, 'HAHA')}
                        disabled={!currentUser}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md transition ${
                          hasUserReacted(post, 'HAHA') 
                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>😂</span>
                        <span className="text-xs font-medium">{getReactionCount(post, 'HAHA')}</span>
                      </button>
                    </div>
                    
                    {/* Bouton de commentaires */}
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                    </button>
                  </div>
                  
                  {/* Section commentaires (affichée conditionnellement) */}
                  {expandedComments[post.id] && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                        </svg>
                        Commentaires ({post.comments?.length || 0})
                      </h3>
                      
                      {/* Formulaire de commentaire */}
                      {currentUser && (
                        <form 
                          onSubmit={(e) => handleCommentSubmit(post.id, e)} 
                          className="mb-4"
                          noValidate
                        >
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium">
                                {currentUser.username.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-grow">
                              <textarea
                                value={comments[post.id] || ''}
                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                placeholder="Ajoutez votre commentaire..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                                rows="2"
                              />
                              <div className="mt-2 flex justify-end">
                                <button
                                  type="submit"
                                  disabled={submitting[post.id] || !comments[post.id]?.trim()}
                                  className="px-4 py-1.5 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                  {submitting[post.id] ? 'Envoi...' : 'Publier'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                      
                      {/* Liste des commentaires */}
                      <div className="space-y-4">
                        {post.comments?.length === 0 ? (
                          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                            Aucun commentaire pour le moment. Soyez le premier à commenter !
                          </p>
                        ) : (
                          post.comments
                            ?.slice(
                              (commentPages[post.id] - 1) * COMMENTS_PER_PAGE,
                              commentPages[post.id] * COMMENTS_PER_PAGE
                            )
                            .map(comment => (
                              <div key={comment.id} className="flex">
                                <div className="flex-shrink-0 mr-3">
                                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium">
                                    {comment.author.username.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex-grow bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                                      {comment.author.username}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(comment.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-gray-800 dark:text-gray-200 text-sm break-words whitespace-pre-wrap">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                      
                      {/* Pagination des commentaires */}
                      {post.comments?.length > COMMENTS_PER_PAGE && (
                        <div className="flex justify-center mt-4">
                          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => handlePageChange(post.id, commentPages[post.id] - 1)}
                              disabled={commentPages[post.id] === 1}
                              className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Précédent</span>
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <span className="relative inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {commentPages[post.id]} / {Math.ceil(post.comments.length / COMMENTS_PER_PAGE)}
                            </span>
                            <button
                              onClick={() => handlePageChange(post.id, commentPages[post.id] + 1)}
                              disabled={commentPages[post.id] >= Math.ceil(post.comments.length / COMMENTS_PER_PAGE)}
                              className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Suivant</span>
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCreations; 