import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import postService from "../services/postService";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagList, setTagList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // États pour l'IA
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [aiError, setAiError] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptOptions, setShowPromptOptions] = useState(false);

  // Prompts prédéfinis
  const predefinedPrompts = [
    {
      label: "🔧 Améliorer la clarté",
      prompt: "Réécris ce texte en le rendant plus clair et plus facile à comprendre, en gardant tous les aspects techniques :"
    },
    {
      label: "✨ Ajouter du clean code",
      prompt: "Réécris ce texte en ajoutant plus d'aspects sur les bonnes pratiques et le clean code :"
    },
    {
      label: "🚀 Optimiser pour le SEO",
      prompt: "Réécris ce texte en l'optimisant pour le référencement tout en gardant la qualité technique :"
    },
    {
      label: "📚 Rendre plus pédagogique",
      prompt: "Réécris ce texte en le rendant plus pédagogique avec des exemples et explications step-by-step :"
    },
    {
      label: "💡 Ajouter des bonnes pratiques",
      prompt: "Réécris ce texte en y intégrant davantage de bonnes pratiques et de conseils d'expert :"
    }
  ];

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const post = await postService.getPostById(id);
      setTitle(post.title);
      setContent(post.content);
      setTagList(post.tags?.map(tag => tag.name) || []);
      setError("");
    } catch (err) {
      setError(err.error || "Erreur lors du chargement du post");
    } finally {
      setLoadingPost(false);
    }
  };

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

      const postData = {
        title,
        content,
        tag_names: tagList,
      };

      await postService.updatePost(id, postData);

      setSuccess("Votre article a été mis à jour avec succès !");

      // Rediriger vers la page de détail après 2 secondes
      setTimeout(() => {
        navigate(`/blog/${id}`);
      }, 2000);
    } catch (err) {
      setError(err.error || "Erreur lors de la mise à jour de l'article");
    } finally {
      setLoading(false);
    }
  };

  const handleGetAiSuggestion = async (specificPrompt = null) => {
    if (!content.trim()) {
      setAiError("Veuillez d'abord saisir du contenu à améliorer");
      return;
    }

    const promptToUse = specificPrompt || customPrompt || "Réécris ce texte en français, de manière fluide et enrichie, prêt à être publié :";

    try {
      setAiLoading(true);
      setAiError("");
      
      // On utilise le service avec le texte modifié pour inclure le prompt
      const textWithPrompt = `${promptToUse}\n\n${content}`;
      const data = await postService.explainPost(id, textWithPrompt);
      setAiSuggestion(data.réponse);
      setShowAiSuggestion(true);
      setShowPromptOptions(false);
      
    } catch (err) {
      setAiError(err.error || "Impossible d'obtenir une suggestion pour le moment");
    } finally {
      setAiLoading(false);
    }
  };

  const handleUseAiSuggestion = () => {
    setContent(aiSuggestion);
    setShowAiSuggestion(false);
    setSuccess("Contenu remplacé par la suggestion IA !");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loadingPost) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 relative">
      {/* Fond texturé et bordure décorative */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-gray-800 opacity-50 rounded-xl border-4 border-double border-orange-200 dark:border-gray-600 transform rotate-1"></div>

      <div className="relative p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl border-2 border-orange-100 dark:border-gray-700 transform -rotate-1">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-800 dark:text-orange-300 mb-2">
            Modifier l'article
          </h1>
          <p className="text-gray-600 dark:text-gray-400 italic">
            Peaufinez votre contenu technique
          </p>
          <div className="h-1 w-24 mx-auto mt-4 bg-gradient-to-r from-orange-400 to-red-500 rounded"></div>
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
          <div className="bg-slate-50/50 dark:bg-gray-700/30 p-6 rounded-lg border border-orange-100 dark:border-gray-600">
            <label
              htmlFor="title"
              className="block text-lg font-medium text-orange-800 dark:text-orange-300 mb-2"
            >
              Titre de l'article <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-orange-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
              placeholder="Ex: Comment mettre en place un serveur NGINX"
              required
            />
          </div>

          <div className="bg-slate-50/50 dark:bg-gray-700/30 p-6 rounded-lg border border-orange-100 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="content"
                className="block text-lg font-medium text-orange-800 dark:text-orange-300"
              >
                Contenu <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPromptOptions(!showPromptOptions)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                  Options IA
                </button>
                <button
                  type="button"
                  onClick={() => handleGetAiSuggestion()}
                  disabled={aiLoading || !content.trim()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {aiLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      IA en cours...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      ✨ Améliorer avec l'IA
                    </>
                  )}
                </button>
              </div>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="14"
              className="w-full px-4 py-3 border-2 border-orange-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
              placeholder="Décrivez votre solution technique ou partagez vos connaissances..."
              required
            ></textarea>
            
            {/* Gestion des erreurs IA */}
            {aiError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{aiError}</span>
                </div>
              </div>
            )}
            
            {/* Suggestion IA */}
            {showAiSuggestion && aiSuggestion && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-purple-600 dark:text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                      Suggestion d'amélioration IA
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiSuggestion(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="prose dark:prose-invert max-w-none mb-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                    {aiSuggestion}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-purple-600 dark:text-purple-400 italic">
                    💡 Suggestion générée par IA - Vous pouvez l'utiliser ou vous en inspirer
                  </div>
                  <button
                    type="button"
                    onClick={handleUseAiSuggestion}
                    className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200"
                  >
                    Utiliser cette version
                  </button>
                </div>
              </div>
            )}
            
            {/* Options de prompts IA */}
            {showPromptOptions && (
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3">
                  Choisissez le type d'amélioration :
                </h4>
                
                {/* Boutons prédéfinis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {predefinedPrompts.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleGetAiSuggestion(preset.prompt)}
                      disabled={aiLoading || !content.trim()}
                      className="px-3 py-2 text-sm text-left text-purple-700 bg-white dark:bg-gray-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                
                {/* Prompt personnalisé */}
                <div>
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                    Ou créez votre propre instruction :
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ex: Rajoute plus d'exemples pratiques et de snippets de code..."
                      className="flex-1 px-3 py-2 text-sm border border-purple-200 dark:border-purple-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleGetAiSuggestion(customPrompt)}
                      disabled={aiLoading || !content.trim() || !customPrompt.trim()}
                      className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              💡 Astuce : Écrivez votre contenu puis cliquez sur "Améliorer avec l'IA" pour obtenir une version optimisée
            </p>
          </div>

          <div className="bg-slate-50/50 dark:bg-gray-700/30 p-6 rounded-lg border border-orange-100 dark:border-gray-600">
            <label
              htmlFor="tags"
              className="block text-lg font-medium text-orange-800 dark:text-orange-300 mb-2"
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
                className="flex-1 px-4 py-3 border-2 border-orange-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-5 py-3 font-medium bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition duration-200"
              >
                Ajouter
              </button>
            </div>

            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tagList.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border border-orange-200 dark:border-orange-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 inline-flex text-orange-600 dark:text-orange-400 focus:outline-none hover:text-orange-800 dark:hover:text-orange-200 transition duration-200"
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
              onClick={() => navigate(`/blog/${id}`)}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 font-medium bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
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
                  Mise à jour en cours...
                </span>
              ) : (
                "Mettre à jour l'article"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-orange-100 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400 italic">
          "La perfection n'est pas atteignable, mais si nous pourchassons la perfection, nous pouvons attraper l'excellence." — Vince Lombardi
        </div>
      </div>
    </div>
  );
};

export default EditPost; 