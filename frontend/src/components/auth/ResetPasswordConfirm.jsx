import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";

const isDevelopment =
  import.meta.env.DEV || import.meta.env.MODE === "development";

const ResetPasswordConfirm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { token } = useParams();
  const { resetPasswordConfirm } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Token invalide");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    try {
      setError("");
      setLoading(true);
      console.log("Tentative de réinitialisation avec token:", token);

      try {
        await resetPasswordConfirm(token, password);
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (apiError) {
        console.error("Erreur API:", apiError);

        // En mode développement, simuler un succès pour le token de test
        if (isDevelopment && token === "test-token") {
          console.warn(
            "Mode développement: simulation de succès pour le token de test"
          );
          setSuccess(true);
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Erreur capturée dans le composant:", err);
      setError(
        err.error || "Erreur lors de la réinitialisation du mot de passe"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mt-8 mb-4 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Nouveau mot de passe
        </h1>

        {isDevelopment && token === "test-token" && (
          <div
            className="bg-amber-100 border border-amber-400 text-amber-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="block sm:inline font-medium">
              Mode développement
            </span>
            <span className="block sm:inline">
              {" "}
              - Vous utilisez un token de test. La réinitialisation sera
              simulée.
            </span>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="block sm:inline">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être
              redirigé vers la page de connexion.
            </span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Minimum 8 caractères
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
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
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
