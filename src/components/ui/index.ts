/**
 * Point d'entrée pour tous les composants UI réutilisables
 * Ces composants sont génériques et peuvent être utilisés partout dans l'application
 */

// Composants de base
export { default as Button } from './button/Button';
export { default as Badge } from './badge/Badge';
export { Modal } from './modal';

// Composants de formulaire
export { default as DatePicker } from './DatePicker';
export { default as TimePicker } from './TimePicker';

// Composants d'affichage
export { default as Avatar } from './avatar/Avatar';
export { default as Alert } from './alert/Alert';

// Composants de feedback
export { default as ConfirmDialog } from './ConfirmDialog';
export { NotificationContainer, showSuccess, showError, showWarning, showInfo } from './notification';

// Types pour les composants UI
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}
