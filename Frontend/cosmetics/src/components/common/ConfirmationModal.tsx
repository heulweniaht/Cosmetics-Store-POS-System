import React from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  showReasonInput?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                               isOpen,
                                                               title = "Xác nhận",
                                                               message,
                                                               confirmText = "Xác nhận",
                                                               cancelText = "Hủy",
                                                               onConfirm,
                                                               onCancel,
                                                               showReasonInput = false,
                                                             }) => {
  const [reason, setReason] = React.useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  return (
      <div className="modal-overlay-confirm" onClick={handleOverlayClick}>
        <div className="modal-content-confirm" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-confirm">
            <h3>{title}</h3>
          </div>

          <div className="modal-body-confirm">
            <p className="confirm-text-confirm">{message}</p>

            {showReasonInput && (
                <div className="reason-input">
                  <label htmlFor="reason">Lý do:</label>
                  <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Nhập lý do..."
                  />
                </div>
            )}
          </div>

          <div className="modal-footer-confirm">
            <button
                className="btn btn-secondary-confirm"
                onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
                className="btn btn-danger-confirm"
                onClick={handleConfirm}
                disabled={showReasonInput && reason.trim() === ''}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
  );
};

export default ConfirmationModal;

