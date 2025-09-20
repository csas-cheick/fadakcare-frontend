import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../../services/authService";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import AuthLogoSection from "../../components/auth/AuthLogoSection";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async ({ newPassword, confirmPassword }: { newPassword: string; confirmPassword: string }) => {
    if (!newPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.resetPassword({
        email: localStorage.getItem("resetEmail") || "",
        code: localStorage.getItem("resetCode") || "",
        newPassword
      });

      if (result.success) {
        toast.success(result.message);
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetCode");
        navigate("/login");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Une erreur inattendue est survenue : ${error}`);
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
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Réinitialisation du mot de passe</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Choisissez un nouveau mot de passe</p>
              <ResetPasswordForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </section>
  );
};

export default ResetPassword;
