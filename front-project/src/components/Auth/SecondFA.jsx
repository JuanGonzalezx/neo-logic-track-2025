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
      setError('Enter a valid 6 digit code');
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
          Code Authentication
        </h2>

        <p className="authentication-description">
          We have sent a code to your {contactMethod}. Enter it to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="authentication-form-group">
            <label className="authentication-label">Code Authentication</label>
            <input
              className="authentication-input"
              type="text"
              value={authenticationCode}
              onChange={(e) => setAuthenticationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6 digits"
              maxLength={6}
            />
            {error && <span className="authentication-error">{error}</span>}
          </div>

          <button type="submit" className="authentication-submit-btn">
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecondFA;
