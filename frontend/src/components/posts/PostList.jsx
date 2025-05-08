import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/postService';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (err) {
      setError(err.error || 'Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId, emoji) => {
    if (!currentUser) return;
    try {
      const updatedPost = await postService.toggleReaction(postId, emoji);
      setPosts(posts.map(post => post.id === postId ? updatedPost : post));
    } catch (err) {
      console.error('Erreur lors de la réaction:', err);
    }
  };

  const truncateContent = (content, maxLines = 5) => {
    const lines = content.split('\n');
    if (lines.length <= maxLines) return content;
    return lines.slice(0, maxLines).join('\n') + '...';
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
    <div className="space-y-8">
      {currentUser?.is_staff && (
        <div className="flex justify-end">
          <Link
            to="/posts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Nouveau post
          </Link>
        </div>
      )}

      {posts.map(post => (
        <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {post.title}
            </h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>Par {post.author.username}</span>
              <span className="mx-2">•</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="prose dark:prose-invert max-w-none mb-4">
              {expandedPost === post.id ? (
                <p className="whitespace-pre-wrap">{post.content}</p>
              ) : (
                <p className="whitespace-pre-wrap">{truncateContent(post.content)}</p>
              )}
            </div>

            {post.content.split('\n').length > 5 && (
              <button
                onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                {expandedPost === post.id ? 'Voir moins' : 'Voir plus'}
              </button>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReaction(post.id, '👍')}
                  disabled={!currentUser}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    !currentUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  👍
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {post.reactions?.find(r => r.emoji === '👍')?.count || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReaction(post.id, '❤️')}
                  disabled={!currentUser}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    !currentUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  ❤️
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {post.reactions?.find(r => r.emoji === '❤️')?.count || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReaction(post.id, '😂')}
                  disabled={!currentUser}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    !currentUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  😂
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {post.reactions?.find(r => r.emoji === '😂')?.count || 0}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to={`/posts/${post.id}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                Voir les commentaires ({post.comments?.length || 0})
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default PostList; 