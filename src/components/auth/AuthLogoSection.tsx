import React from "react";
import FadakCareLogo from "../../images/fadakcare.png";

const AuthLogoSection: React.FC = () => (
  <div className="lg:w-1/2 bg-gradient-to-br from-teal-600 to-teal-400 dark:from-teal-800 dark:to-teal-600 flex flex-col items-center justify-center p-10">
    <img src={FadakCareLogo} alt="FadakCare Logo" className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-200 mb-4 bounce-logo" />
    <h3 className="text-white text-2xl font-semibold text-center">Bienvenue sur FadakCare</h3>
    <p className="text-white text-center mt-2 opacity-90 dark:opacity-80">Connectez-vous pour accéder à votre tableau de bord.</p>
  </div>
);

export default AuthLogoSection;
