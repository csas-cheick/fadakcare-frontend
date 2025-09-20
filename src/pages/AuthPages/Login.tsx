import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLogoSection from "../../components/auth/AuthLogoSection";
import SocialLoginButtons from "../../components/auth/SocialLoginButtons";
import LoginForm from "../../components/auth/LoginForm";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";
import GoogleAuthService, { GoogleUserInfo } from "../../services/googleAuthService";

const Login: React.FC = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 1. Authentification avec Google
      const googleUserInfo: GoogleUserInfo = await GoogleAuthService.signInWithGoogle();
      
      // 2. Authentification avec notre backend
      const backendResponse = await GoogleAuthService.authenticateWithBackend(googleUserInfo);
      
      // 3. Sauvegarder les tokens et informations utilisateur
      localStorage.setItem('authToken', backendResponse.accessToken);
      localStorage.setItem('refreshToken', backendResponse.refreshToken);
      localStorage.setItem('userId', backendResponse.id.toString());
      localStorage.setItem('userRole', backendResponse.role);
      localStorage.setItem('userEmail', backendResponse.email);
     navigate('/home'); // Redirection générique en attendant la gestion des rôles
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la connexion avec Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row relative">
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggleButton />
          </div>
          <AuthLogoSection />
          <div className="lg:w-1/2 p-10">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Connexion</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Veuillez entrer vos identifiants</p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md flex items-center">
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
                </div>
              )}
              <LoginForm onError={setError} onLoading={setIsLoading} />
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">OU</span>
                </div>
              </div>
              
              {/* Google Auth Button avec état de chargement */}
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <SocialLoginButtons onGoogleLogin={handleGoogleLogin} />
              )}
              
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-teal-600 dark:text-teal-400 hover:underline">
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
