import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../../services/authService";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import AuthLogoSection from "../../components/auth/AuthLogoSection";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (email: string) => {
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    setLoading(true);

    try {
      const { ok, data } = await authService.forgotPassword(email);
      
      if (ok) {
        toast.success(data.message);
        setTimeout(() => navigate("/verifyCode"), 2000);
        sessionStorage.setItem("resetEmail", email);
      } else {
        toast.error(data.message || "Erreur lors de l'envoi du code");
      }
    } catch (error) {
      toast.error(`Erreur de connexion au serveur : ${error}`);
    } finally {
      setLoading(false);
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
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Mot de passe oublié</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Entrez votre email pour recevoir un code de récupération</p>
              <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} />
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </section>
  );
};

export default ForgotPassword;
