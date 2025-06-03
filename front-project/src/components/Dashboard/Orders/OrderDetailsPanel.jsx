import React from 'react';
import './OrderDetailsPanel.css';
const OrderDetailsPanel = ({ order, warehouse, productsDetails }) => {
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <section className="order-details-panel">
      <div className="panel-section">
        <h3 className="panel-title">Información de la Orden</h3>
        <div className="details-grid">
          <div className="detail-item"><b>ID de Orden:</b> <span>{order.id}</span></div>
          <div className="detail-item"><b>Fecha de creación:</b> <span>{formatDateTime(order.creation_date)}</span></div>
          <div className="detail-item">
            <b>Estado:</b> 
            <span className={`status-badge ${order.status}`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <div className="detail-item"><b>Cliente:</b> <span>{order.customer_name}</span></div>
          <div className="detail-item"><b>Correo del cliente:</b> <span>{order.customer_email}</span></div>
          <div className="detail-item full-width"><b>Dirección de entrega:</b> <span>{order.delivery_address}</span></div>
        </div>
      </div>

      <div className="panel-section">
        <h3 className="panel-title">Información del Almacén</h3>
        <div className="details-grid">
          <div className="detail-item"><b>Almacén:</b> <span>{warehouse.nombre_almacen}</span></div>
          <div className="detail-item full-width"><b>Dirección del almacén:</b> <span>{warehouse.direccion?.calle}</span></div>
        </div>
      </div>

      <div className="panel-section">
        <h3 className="panel-title">Información del Repartidor</h3>
        <div className="details-grid">
          <div className="detail-item"><b>Nombre:</b> <span>{order.delivery_name}</span></div>
          <div className="detail-item full-width"><b>Correo electrónico:</b> <span>{order.delivery_email}</span></div>
        </div>
      </div>

      <div className="panel-section order-products-section">
        <h3 className="panel-title">Productos de la Orden</h3>
        {productsDetails.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {productsDetails.map((p, i) => (
                  <tr key={i}>
                    <td>{p.product_id}</td>
                    <td>{p.details?.nombre_producto || 'N/A'}</td>
                    <td>{p.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-results">No hay productos en esta orden</div>
        )}
      </div>
    </section>
  );
};

export default OrderDetailsPanel;
