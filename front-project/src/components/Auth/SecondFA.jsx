import React, { useState } from 'react';
import { X } from 'lucide-react';
import { auth } from '../../api/auth';
import "./SecondFA.css";

const SecondFA = ({ isOpen, onClose, contactMethod, onVerificationSuccess, id }) => {
  const [authenticationCode, setAuthenticationCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authenticationCode.length !== 6) {
      setError('Ingresa un código válido de 6 dígitos');
      return;
    }
    setError('');
    onVerificationSuccess(authenticationCode);
  };

  return (
    <div className="authentication-modal-overlay">
      <div className="authentication-modal-container">
        <button onClick={onClose} className="authentication-close-button">
          <X size={24} />
        </button>

        <h2 className="authentication-title">
          Autenticación por código
        </h2>

        <p className="authentication-description">
          Hemos enviado un código a tu {contactMethod}. Ingresa el código para continuar.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="authentication-form-group">
            <label className="authentication-label">Código de autenticación</label>
            <input
              className="authentication-input"
              type="text"
              value={authenticationCode}
              onChange={(e) => setAuthenticationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6 dígitos"
              maxLength={6}
            />
            {error && <span className="authentication-error">{error}</span>}
          </div>

          <button type="submit" className="authentication-submit-btn">
            Autenticar
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecondFA;
