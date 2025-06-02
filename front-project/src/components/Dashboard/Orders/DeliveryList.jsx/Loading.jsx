import React from 'react';
import { Package } from 'lucide-react';

/**
 * Loading component for when data is being fetched
 */
export const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <Package size={32} className="loading-icon" />
        <div className="spinner"></div>
        <p>Cargando repartidores...</p>
      </div>
    </div>
  );
};