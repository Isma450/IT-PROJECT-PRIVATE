import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import postService from "../../services/postService";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const data = await postService.getPostById(id);
      console.log("Post récupéré :", data);
      setPost(data);
      setError(null);
    } catch (err) {
      setError(err.error || "Erreur lors du chargement du post");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/blog");
  };

  const getReactionCount = (emoji) => {
    return post?.reactions?.filter((r) => r.emoji === emoji).length || 0;
  };

  const hasUserReacted = (emoji) => {
    return post?.reactions?.some(
      (r) => r.emoji === emoji && r.user === currentUser?.id
    );
  };

  const handleReaction = async (emoji) => {
    if (!currentUser) return;

    const updatedReactions = [...(post.reactions || [])];
    const userReactionIndex = updatedReactions.findIndex(
      (r) => r.emoji === emoji && r.user === currentUser.id
    );

    if (userReactionIndex !== -1) {
      updatedReactions.splice(userReactionIndex, 1);
    } else {
      updatedReactions.push({
        emoji,
        user: currentUser.id,
        created_at: new Date().toISOString(),
      });
    }

    setPost((prev) => ({
      ...prev,
      reactions: updatedReactions,
    }));

    try {
      const updatedPost = await postService.toggleReaction(id, { emoji });
      setPost(updatedPost);
    } catch (err) {
      console.error("Erreur lors de la réaction:", err);
      fetchPost();
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);

    try {
      const newComment = await postService.addComment(id, {
        content: comment,
      });

      setPost((prevPost) => ({
        ...prevPost,
        comments: [...(prevPost.comments || []), newComment],
      }));

      setComment("");
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
      alert(
        err.error || "Une erreur est survenue lors de l'ajout du commentaire"
      );
    } finally {
      setSubmitting(false);
    }
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
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Post non trouvé
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour aux articles
          </button>
          
          {/* Bouton modifier pour les admins auteurs */}
          {currentUser && currentUser.is_staff && currentUser.id === post.author?.id && (
            <button
              onClick={() => navigate(`/blog/${id}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Modifier l'article
            </button>
          )}
        </div>
      </div>

      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>Par {post.author?.username || "Utilisateur inconnu"}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(post.tags || []).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleReaction("LIKE")}
                disabled={!currentUser}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition ${
                  hasUserReacted("LIKE")
                    ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span>👍</span>
                <span className="text-xs font-medium">
                  {getReactionCount("LIKE")}
                </span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleReaction("LOVE")}
                disabled={!currentUser}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition ${
                  hasUserReacted("LOVE")
                    ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span>❤️</span>
                <span className="text-xs font-medium">
                  {getReactionCount("LOVE")}
                </span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleReaction("HAHA")}
                disabled={!currentUser}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition ${
                  hasUserReacted("HAHA")
                    ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${!currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span>😂</span>
                <span className="text-xs font-medium">
                  {getReactionCount("HAHA")}
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Commentaires ({post.comments?.length || 0})
            </h2>

            {currentUser && (
              <form onSubmit={handleCommentSubmit} className="mb-6" noValidate>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                  required
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Envoi..." : "Commenter"}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {(post.comments || []).map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.author.username}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;
