import React from 'react';
import { 
  User, Phone, MapPin, Package, Calendar, 
  FileText, UserCheck, UserX
} from 'lucide-react';

/**
 * Card component for displaying delivery worker information
 */
export const DeliveryWorkerCard = ({ worker, onAssign, onToggleStatus, onGenerateReport }) => {
  const { 
    id, nombre, email, ciudad, telefono, activo,
    pedidosPendientes, pedidosHoy 
  } = worker;
  
  return (
    <div className={`dl-delivery-worker-card ${!activo ? 'inactive' : ''}`}>
      <div className="dl-card-header">
        <div className="dl-worker-avatar">
          <User size={24} />
        </div>
        <div className="dl-worker-info">
          <h3>{nombre}</h3>
          <p className="dl-worker-email">{email}</p>
        </div>
        <div className="dl-worker-status">
          <span className={`dl-status-badge ${activo ? 'active' : 'inactive'}`}>
            {activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
      
      <div className="dl-card-body">
        <div className="dl-worker-details">
          <div className="dl-detail-item">
            <span className="dl-detail-label">ID:</span>
            <span className="dl-detail-value">{id}</span>
          </div>
          
          <div className="dl-detail-item">
            <Phone size={16} className="dl-detail-icon" />
            <span className="dl-detail-value">{telefono || 'No disponible'}</span>
          </div>
          
          <div className="dl-detail-item">
            <MapPin size={16} className="dl-detail-icon" />
            <span className="dl-detail-value">{ciudad || 'No especificada'}</span>
          </div>
        </div>
        
        <div className="dl-order-counts">
          <div className="dl-count-item">
            <Package size={16} className="dl-count-icon" />
            <span className="dl-count-label">Pendientes</span>
            <span className={`dl-count-value ${pedidosPendientes > 0 ? 'has-orders' : ''}`}>
              {pedidosPendientes}
            </span>
          </div>
          
          <div className="dl-count-item">
            <Calendar size={16} className="dl-count-icon" />
            <span className="dl-count-label">Hoy</span>
            <span className={`dl-count-value ${pedidosHoy > 0 ? 'has-orders' : ''}`}>
              {pedidosHoy}
            </span>
          </div>
        </div>
      </div>
      
      <div className="dl-card-actions">
        <div className="dl-main-actions">
          <button 
            className="dl-action-button dl-assign-button"
            onClick={onAssign}
            disabled={!activo}
            aria-label="Asignar pedido"
          >
            <Package size={16} />
            <span>Asignar</span>
          </button>
          
          <button 
            className={`dl-action-button dl-toggle-button ${activo ? 'deactivate' : 'activate'}`}
            onClick={onToggleStatus}
            aria-label={activo ? 'Desactivar repartidor' : 'Activar repartidor'}
          >
            {activo ? <UserX size={16} /> : <UserCheck size={16} />}
            <span>{activo ? 'Desactivar' : 'Activar'}</span>
          </button>
        </div>
        
        <button 
          className="dl-action-button dl-report-button"
          onClick={onGenerateReport}
          aria-label="Generar reporte"
        >
          <FileText size={16} />
          <span>Reporte</span>
        </button>
      </div>
    </div>
  );
};
