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
    <div className={`delivery-worker-card ${!activo ? 'inactive' : ''}`}>
      <div className="card-header">
        <div className="worker-avatar">
          <User size={24} />
        </div>
        <div className="worker-info">
          <h3>{nombre}</h3>
          <p className="worker-email">{email}</p>
        </div>
        <div className="worker-status">
          <span className={`status-badge ${activo ? 'active' : 'inactive'}`}>
            {activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
      
      <div className="card-body">
        <div className="worker-details">
          <div className="detail-item">
            <span className="detail-label">ID:</span>
            <span className="detail-value">{id}</span>
          </div>
          
          <div className="detail-item">
            <Phone size={16} className="detail-icon" />
            <span className="detail-value">{telefono || 'No disponible'}</span>
          </div>
          
          <div className="detail-item">
            <MapPin size={16} className="detail-icon" />
            <span className="detail-value">{ciudad || 'No especificada'}</span>
          </div>
        </div>
        
        <div className="order-counts">
          <div className="count-item">
            <Package size={16} className="count-icon" />
            <span className="count-label">Pendientes</span>
            <span className={`count-value ${pedidosPendientes > 0 ? 'has-orders' : ''}`}>
              {pedidosPendientes}
            </span>
          </div>
          
          <div className="count-item">
            <Calendar size={16} className="count-icon" />
            <span className="count-label">Hoy</span>
            <span className={`count-value ${pedidosHoy > 0 ? 'has-orders' : ''}`}>
              {pedidosHoy}
            </span>
          </div>
        </div>
      </div>
      
      <div className="card-actions">
        <div className="main-actions">
          <button 
            className="action-button assign-button"
            onClick={onAssign}
            disabled={!activo}
            aria-label="Asignar pedido"
          >
            <Package size={16} />
            <span>Asignar</span>
          </button>
          
          <button 
            className={`action-button toggle-button ${activo ? 'deactivate' : 'activate'}`}
            onClick={onToggleStatus}
            aria-label={activo ? 'Desactivar repartidor' : 'Activar repartidor'}
          >
            {activo ? <UserX size={16} /> : <UserCheck size={16} />}
            <span>{activo ? 'Desactivar' : 'Activar'}</span>
          </button>
        </div>
        
        <button 
          className="action-button report-button"
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
