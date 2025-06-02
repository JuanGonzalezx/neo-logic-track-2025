import React, { useState } from 'react';
import { X } from 'lucide-react';
import { auth } from '../../api/auth';
import "./VerificationModal.css";

const VerificationModal = ({ isOpen, onClose, contactMethod, onVerificationSuccess, email }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError('Ingresa un código válido de 6 dígitos');
      return;
    }
    setError('');
    onVerificationSuccess(verificationCode);
  };

  const handleResend = async () => {
    try {
      const response = await auth.resend(email);
      const result = await response.json();

      setResendMessage(result.message || "Código reenviado");
    } catch (err) {
      setResendMessage("Error al reenviar el código");
    }
  };

  return (
    <div className="verification-modal-overlay">
      <div className="verification-modal-container">
        <button onClick={onClose} className="verification-close-button">
          <X size={24} />
        </button>

        <h2 className="verification-title">
          Verificación de identidad
        </h2>

        <p className="verification-description">
          Te hemos enviado un código a tu {contactMethod}. Ingresa el código para continuar.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="verification-form-group">
            <label className="verification-label">Código de verificación</label>
            <input
              className="verification-input"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6 dígitos"
              maxLength={6}
            />
            {error && <span className="verification-error">{error}</span>}
          </div>

          <button type="submit" className="verification-submit-btn">
            Verificar
          </button>
        </form>

        <div className="verification-resend-text">
          ¿No recibiste el código?{' '}
          <button onClick={handleResend} className="verification-resend-link">
            Reenviar
          </button>
        </div>
        {resendMessage && (
          <p className="verification-success-message">{resendMessage}</p>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;
