import React, { useState } from 'react';
import './TrackingInput.css';

const TrackingInput = ({ onSubmit }) => {
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      setError('Por favor, ingrese un número de seguimiento');
      return;
    }
    
    // Basic validation for tracking ID format (could be customized)
    const trackingRegex = /^[A-Za-z0-9-]{6,}$/;
    if (!trackingRegex.test(trackingId)) {
      setError('El número de seguimiento debe tener al menos 6 caracteres alfanuméricos');
      return;
    }
    
    setError('');
    onSubmit(trackingId);
  };

  return (
    <div className="tracking-input-container">
      <form onSubmit={handleSubmit} className="tracking-form">
        <div className="input-group">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => {
              setTrackingId(e.target.value);
              if (error) setError('');
            }}
            placeholder="Ingrese su número de seguimiento"
            className={`tracking-input ${error ? 'error' : ''}`}
            aria-label="Número de seguimiento"
          />
          <button type="submit" className="tracking-button">
            Rastrear Pedido
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
      
      <div className="tracking-help">
        <p>
          <span className="help-icon">?</span>
          <span className="help-text">¿No tiene un número de seguimiento? <a href="#">Contacte con soporte</a></span>
        </p>
      </div>
    </div>
  );
};

export default TrackingInput;