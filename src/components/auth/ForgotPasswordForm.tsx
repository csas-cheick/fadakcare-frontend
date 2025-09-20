import React, { useState } from "react";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void;
  loading: boolean;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSubmit, loading }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Email</label>
        <input
          type="email"
          className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none"
          placeholder="exemple@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white p-3 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-teal-300 dark:disabled:bg-teal-800"
        disabled={loading}
      >
        {loading ? "Envoi en cours..." : "Envoyer le code"}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
