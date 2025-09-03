import React, { useState } from "react";

interface ResetPasswordFormProps {
  onSubmit: (passwords: { newPassword: string; confirmPassword: string }) => void;
  loading: boolean;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit, loading }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ newPassword, confirmPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Nouveau mot de passe</label>
        <input
          type="password"
          className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none"
          placeholder="Entrez votre nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Confirmer le mot de passe</label>
        <input
          type="password"
          className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none"
          placeholder="Confirmez votre mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white p-3 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-teal-300 dark:disabled:bg-teal-800"
        disabled={loading}
      >
        {loading ? "Traitement en cours..." : "Réinitialiser"}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
