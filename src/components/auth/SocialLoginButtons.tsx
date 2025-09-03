import React from "react";
import GoogleIcon from "@mui/icons-material/Google";

interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onGoogleLogin }) => (
  <div className="mt-6">
    <button
      type="button"
      onClick={onGoogleLogin}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 font-medium text-gray-700 dark:text-gray-200"
    >
      <GoogleIcon className="mr-3" style={{ color: "#4285F4" }} />
      Continuer avec Google
    </button>
  </div>
);

export default SocialLoginButtons;
