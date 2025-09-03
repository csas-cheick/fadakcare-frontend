import React, { useState } from "react";
import { ThemeToggleButton } from "../common/ThemeToggleButton";

interface VerifyCodeFormProps {
  onSubmit: (code: string) => void;
  loading: boolean;
}

const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ onSubmit, loading }) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold">Code de vérification</label>
        <ThemeToggleButton />
      </div>
      <div>
        <input
          type="text"
          className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 border-none dark:border-gray-700"
          placeholder="Entrez le code reçu par email"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-teal-300 dark:bg-teal-600 dark:hover:bg-teal-700 dark:disabled:bg-teal-800"
        disabled={loading}
      >
        {loading ? "Vérification..." : "Vérifier le code"}
      </button>
    </form>
  );
};

export default VerifyCodeForm;
