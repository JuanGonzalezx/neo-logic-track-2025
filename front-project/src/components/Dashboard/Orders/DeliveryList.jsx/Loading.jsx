import React from 'react';
import { Package } from 'lucide-react';

/**
 * Loading component for when data is being fetched
 */
export const Loading = () => {
  return (
    <div className="dl-loading-container">
      <div className="dl-loading-content">
        <Package size={32} className="dl-loading-icon" />
        <div className="dl-spinner"></div>
        <p>Cargando repartidores...</p>
      </div>
    </div>
  );
};
