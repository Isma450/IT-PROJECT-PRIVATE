import { useState } from "react";
import { useNavigate } from "react-router-dom";
import postService from "../services/postService";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagList, setTagList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== "") {
      const newTag = tagInput.trim();
      if (!tagList.includes(newTag)) {
        setTagList([...tagList, newTag]);
      }
      setTagInput("");
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTagList(tagList.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // Créer un objet avec les données du post
      const postData = {
        title,
        content,
        tag_names: tagList,
      };

      await postService.createPost(postData);

      setSuccess("Votre article a été publié avec succès !");

      // Réinitialiser le formulaire
      setTitle("");
      setContent("");
      setTagInput("");
      setTagList([]);

      // Rediriger vers la page d'accueil après 2 secondes
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.error || "Erreur lors de la création de l'article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 relative">
      {/* Fond texturé et bordure décorative */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-gray-800 opacity-50 rounded-xl border-4 border-double border-blue-200 dark:border-gray-600 transform rotate-1"></div>

      <div className="relative p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl border-2 border-blue-100 dark:border-gray-700 transform -rotate-1">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 dark:text-blue-300 mb-2">
            Tech Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 italic">
            Partagez vos connaissances informatiques
          </p>
          <div className="h-1 w-24 mx-auto mt-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded"></div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border-l-4 border-red-500">
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg border-l-4 border-green-500">
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-slate-50/50 dark:bg-gray-700/30 p-6 rounded-lg border border-blue-100 dark:border-gray-600">
            <label
              htmlFor="title"
              className="block text-lg font-medium text-blue-800 dark:text-blue-300 mb-2"
            >
              Titre de l'article <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
              placeholder="Ex: Comment mettre en place un serveur NGINX"
              required
            />
          </div>

          <div className="bg-slate-50/50 dark:bg-gray-700/30 p-6 rounded-lg border border-blue-100 dark:border-gray-600">
            <label
              htmlFor="content"
              className="block text-lg font-medium text-blue-800 dark:text-blue-300 mb-2"
            >
              Contenu <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="14"
              className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
              placeholder="Décrivez votre solution technique ou partagez vos connaissances..."
              required
            ></textarea>
          </div>

          <div className="bg-slate-50/50 dark:bg-gray-700/30 p-6 rounded-lg border border-blue-100 dark:border-gray-600">
            <label
              htmlFor="tags"
              className="block text-lg font-medium text-blue-800 dark:text-blue-300 mb-2"
            >
              Tags techniques
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="javascript, docker, cloud..."
                className="flex-1 px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-5 py-3 font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-200"
              >
                Ajouter
              </button>
            </div>

            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tagList.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 inline-flex text-blue-600 dark:text-blue-400 focus:outline-none hover:text-blue-800 dark:hover:text-blue-200 transition duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Publication en cours...
                </span>
              ) : (
                "Publier l'article"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-blue-100 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400 italic">
          "Le code est comme l'humour. Quand vous devez l'expliquer, il est
          mauvais." — Cory House
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
