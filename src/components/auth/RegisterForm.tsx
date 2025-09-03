import React, { useState } from "react";

export interface RegisterFormValues {
  nom: string;
  dateNaissance: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone: string;
  adresse: string;
}

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void;
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error }) => {
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nom, dateNaissance, email, password, confirmPassword, telephone, adresse });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 dark:text-red-400 text-sm col-span-2">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Nom complet</label>
            <input type="text" name="nom" className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none" placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Date de naissance</label>
            <input type="date" name="dateNaissance" className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Mot de passe</label>
            <input type="password" name="password" className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Email</label>
            <input type="email" name="email" className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none" placeholder="exemple@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Téléphone</label>
            <input type="tel" name="telephone" className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none" placeholder="+227 90 00 00 00" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Confirmer le mot de passe</label>
            <input type="password" name="confirmPassword" className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none" placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Adresse</label>
        <input type="text" name="adresse" className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 border-none" placeholder="Votre adresse complète" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
      </div>
      <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white p-3 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 font-semibold mt-4">
        S'inscrire
      </button>
    </form>
  );
};

export default RegisterForm;
