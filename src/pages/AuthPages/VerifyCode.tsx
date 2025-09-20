import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../../services/authService";
import VerifyCodeForm from "../../components/auth/VerifyCodeForm";
import AuthLogoSection from "../../components/auth/AuthLogoSection";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";

const VerifyCode: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("resetEmail");

  const handleSubmit = async (code: string) => {
    if (!code) {
      toast.error("Veuillez entrer le code de vérification");
      return;
    }

    if (!email) {
      toast.error("Aucun email trouvé. Veuillez recommencer la procédure");
      return;
    }

    setLoading(true);

    try {
      const { ok, data } = await authService.verifyCode(email, code);
      
      if (ok) {
        localStorage.setItem("resetEmail", email);
        localStorage.setItem("resetCode", code);
        toast.success("Code vérifié avec succès");
        navigate("/resetPassword");
      } else {
        toast.error(data.message || "Le code de vérification est incorrect");
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
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Vérification du code</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Entrez le code reçu par email</p>
              <VerifyCodeForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </section>
  );
};

export default VerifyCode;
