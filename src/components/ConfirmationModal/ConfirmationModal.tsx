import React from 'react';
import './ConfirmationModal.css';
import { Warning, Close } from '@mui/icons-material';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="confirmation-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="confirmation-modal">
        <button
          type="button"
          className="confirmation-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <Close />
        </button>

        <div className={`confirmation-modal-icon ${type}`}>
          <Warning />
        </div>

        <h2 className="confirmation-modal-title">{title}</h2>
        <p className="confirmation-modal-message">{message}</p>

        <div className="confirmation-modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
