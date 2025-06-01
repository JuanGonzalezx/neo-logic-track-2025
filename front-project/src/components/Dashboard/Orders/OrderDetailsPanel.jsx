import React from 'react';

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
        <div className="order-details-container">
            <div className="order-details-section">
                <h3>Información de la Orden</h3>
                <div className="details-grid">
                    <div className="detail-item"><strong>Order ID:</strong><br />{order.id}</div>
                    <div className="detail-item"><strong>Fecha creación:</strong><br />{formatDateTime(order.creation_date)}</div>
                    <div className="detail-item">
                        <strong>Status:</strong><br />
                        <span className={`status-badge ${order.status}`}>{order.status}</span>
                    </div>
                    <div className="detail-item"><strong>Cliente:</strong><br />{order.customer_name}</div>
                    <div className="detail-item"><strong>Email cliente:</strong><br />{order.customer_email}</div>
                    <div className="detail-item"><strong>Destino:</strong><br />{order.delivery_address}</div>
                </div>
                <h3>Información del Almacen</h3>
                <div className="details-grid">
                    <div className="detail-item"><strong>Almacén:</strong><br />{warehouse.nombre_almacen}</div>
                    <div className="detail-item"><strong>Dirección almacén:</strong><br />{warehouse.direccion?.calle}</div>
                </div>
                <h3>Información del Repartidor</h3>
                <div className="details-grid">
                    <div className="detail-item"><strong>Nombre:</strong><br />{order.delivery_name}</div>
                    <div className="detail-item"><strong>Email:</strong><br />{order.delivery_email}</div>
                </div>
            </div>
            <div className="order-products-section">
                <h3>Productos de la Orden</h3>
                {productsDetails.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ maxWidth: 100 }}>ID</th>
                                    <th style={{ maxWidth: 250 }}>Producto</th>
                                    <th style={{ maxWidth: 100 }}>Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productsDetails.map((p, i) => (
                                    <tr key={i}>
                                        <td style={{ maxWidth: 100 }}>{p.product_id}</td>
                                        <td style={{ maxWidth: 250 }}>{p.details?.nombre_producto || 'N/A'}</td>
                                        <td style={{ maxWidth: 100 }}>{p.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-results">No hay productos en esta orden</div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailsPanel;
