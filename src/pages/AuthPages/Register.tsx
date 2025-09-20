import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RegisterForm, { RegisterFormValues } from "../../components/auth/RegisterForm";
import AuthLogoSection from "../../components/auth/AuthLogoSection";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (values: RegisterFormValues) => {
    const { nom, dateNaissance, email, password, confirmPassword, telephone, adresse } = values;
    if (!nom || !dateNaissance || !email || !password || !confirmPassword || !telephone || !adresse) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError("");
    const formattedDate = new Date(dateNaissance).toISOString().split("T")[0];
    const userData = {
      nom,
      dateNaissance: formattedDate,
      email,
      motDePasse: password,
      telephone,
      adresse,
      role: "patient",
    };
    try {
      const { ok, data } = await authService.register(userData);
      if (!ok) {
        toast.error(data.message || "Erreur lors de l'inscription.");
        return;
      }
      await toast.promise(
        Promise.resolve(),
        {
          pending: 'Traitement en cours...',
          success: {
            render: "Demande de création de compte envoyée ! Un administrateur va examiner votre demande sous 24-48h. Vous recevrez un email de confirmation une fois votre compte approuvé.",
            onClose: () => navigate("/login"),
          },
          error: "Erreur lors de l'inscription",
        },
        { autoClose: 5000 }
      );
    } catch (error) {
      toast.error(`Erreur de connexion au serveur: ${error}`);
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
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Créer un compte</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Remplissez les informations pour vous inscrire</p>
              <RegisterForm onSubmit={handleSubmit} error={error} />
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Vous avez déjà un compte ?{" "}
                <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
                  Se connecter
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

export default Register;
