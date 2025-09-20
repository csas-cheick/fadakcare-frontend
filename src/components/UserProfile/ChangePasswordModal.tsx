import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { LockIcon } from '../../icons';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(oldPassword, newPassword, confirmPassword);
      handleClose();
    } catch (error) {
      // L'erreur sera gérée par le parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const inputClassName = `
    w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 
    shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden 
    focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 
    dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800
  `;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-md p-6"
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-brand-100 rounded-lg mr-3">
            <LockIcon className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Changer le mot de passe
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Modifiez votre mot de passe de connexion
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Ancien mot de passe
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClassName}
              placeholder="Entrez votre ancien mot de passe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClassName}
              placeholder="Entrez le nouveau mot de passe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClassName}
              placeholder="Confirmez le nouveau mot de passe"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-brand-500 hover:bg-brand-600"
            disabled={loading}
          >
            {loading ? 'Changement...' : 'Changer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
