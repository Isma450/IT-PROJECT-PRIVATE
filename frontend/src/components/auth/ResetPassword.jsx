import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const isDevelopment =
  import.meta.env.DEV || import.meta.env.MODE === "development";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { resetPasswordRequest } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }

    try {
      setError("");
      setLoading(true);
      console.log("Tentative de réinitialisation pour:", email);

      
      try {
        await resetPasswordRequest(email);
        setSuccess(true);
      } catch (apiError) {
        console.error("Erreur API:", apiError);

        if (isDevelopment) {
          console.warn(
            "Mode développement: simulation de succès malgré l'erreur API"
          );
          setSuccess(true);
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Erreur capturée dans le composant:", err);
      setError(
        err.error ||
          "Erreur lors de la demande de réinitialisation. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mt-8 mb-4 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Réinitialisation du mot de passe
        </h1>

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
              Un email de réinitialisation a été envoyé à votre adresse.
            </span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Entrez votre adresse email pour recevoir un lien de
              réinitialisation de mot de passe.
            </p>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  "Envoyer le lien de réinitialisation"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center mt-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Vérifiez votre boîte de réception et suivez les instructions dans
              l'email.
            </p>
            {isDevelopment && (
              <p className="text-sm text-amber-600 mt-2">
                Mode développement: pour tester la réinitialisation, utilisez le
                lien:
                <Link
                  to="/reset-password/test-token"
                  className="ml-1 underline"
                >
                  /reset-password/test-token
                </Link>
              </p>
            )}
          </div>
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

export default ResetPassword;
