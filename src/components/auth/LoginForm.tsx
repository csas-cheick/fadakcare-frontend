import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";

interface LoginFormProps {
  onError: (msg: string) => void;
  onLoading: (loading: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onError, onLoading }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");
    setIsLoading(true);
    onLoading(true);

    if (!email || !password) {
      onError("Veuillez remplir tous les champs.");
      setIsLoading(false);
      onLoading(false);
      return;
    }

    try {
      const { ok, data } = await authService.login(email, password);
      if (!ok) {
        if (data.isBlocked) {
          onError(data.message || "Votre compte a été bloqué. Veuillez contacter l'administrateur à l'adresse : fadakcare@gmail.com");
        } else {
          onError(data.message || "Erreur lors de la connexion.");
        }
        return;
      }
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userId", String(data.id));
      navigate(`/home`); // Redirect to home page after successful login..../dashboard/${data.role}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      onError("Erreur de connexion au serveur.");
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input
          type="email"
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="exemple@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
        <input
          type="password"
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex justify-between items-center text-sm">
        <label className="flex items-center text-gray-700 dark:text-gray-300">
          <input type="checkbox" className="h-4 w-4 text-teal-600 dark:text-teal-500 mr-2" />
          Se souvenir de moi
        </label>
        <Link to="/forgotPassword" className="text-teal-600 dark:text-teal-400 hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white p-3 rounded-md transition duration-200 ${isLoading ? "opacity-70 cursor-not-allowed dark:opacity-50" : ""}`}
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
};

export default LoginForm;
