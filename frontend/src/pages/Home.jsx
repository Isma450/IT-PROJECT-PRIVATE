import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 animate-fade-in">
      {/* En-tête */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-6 gradient-text">
          Moboutu
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          blog
        </p>
      </div>

      {/* Contenu principal */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-8 animate-slide-up">
        {currentUser ? (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Bonjour, {currentUser.username} !
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Vous êtes connecté à votre compte. Vous pouvez maintenant accéder à toutes les fonctionnalités de l'application.
            </p>
            <Link 
              to="/profile"
              className="btn-primary inline-block"
            >
              Accéder à mon profil
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Bienvenue
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Veuillez vous connecter ou créer un compte pour accéder à toutes les fonctionnalités de l'application.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login"
                  className="btn-primary text-center"
                >
                  Se connecter
                </Link>
                <Link 
                  to="/register"
                  className="btn-secondary text-center"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 mt-8 md:mt-0">
              <div className="bg-gradient-to-br from-orange-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10"></div>
                <h3 className="text-xl font-semibold mb-4 relative z-10">Fonctionnalités disponibles</h3>
                <ul className="space-y-2 relative z-10">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 dark:text-gray-200">Inscription et connexion sécurisées</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 dark:text-gray-200">Gestion de profil utilisateur</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 dark:text-gray-200">Récupération de mot de passe</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 dark:text-gray-200">Protection des routes privées</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;