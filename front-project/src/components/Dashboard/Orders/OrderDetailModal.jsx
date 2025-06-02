import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin } from 'antd';
import { orderAPI } from '../../../api/order';
import { productAPI } from '../../../api/product';

const OrderDetailModal = ({ visible, order, onCancel }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [productsDetails, setProductsDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && order) {
      fetchOrderDetails();
    }
  }, [visible, order]);

  const fetchOrderDetails = async () => {
    if (!order) return;

    setLoading(true);
    try {
      const response = await orderAPI.getOrderById(order.id);

      if (response.status === 200) {
        setOrderDetails(response.data);

        const productPromises = response.data.OrderProducts.map(async (product) => {
          try {
            const productResponse = await productAPI.getProductById(product.product_id);
            return {
              ...product,
              details: productResponse.status === 200 ? productResponse.data : null
            };
          } catch (error) {
            console.error(`Error fetching product ${product.product_id}:`, error);
            return {
              ...product,
              details: null
            };
          }
        });

        const productsWithDetails = await Promise.all(productPromises);
        setProductsDetails(productsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!order) return null;

  return (
    <Modal
      title="Detalles de la Orden"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Cerrar
        </Button>
      ]}
      width={700}
      // bodyStyle={{ padding: '24px 16px' }}
    >
      {loading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: 20 }}>
          <Spin tip="Cargando detalles de la orden..." />
        </div>
      ) : (
        <div className="order-details-container">
          <div className="order-details-section" style={{ marginBottom: 24 }}>
            <h3>Información de la Orden</h3>
            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <div className="detail-item">
                <strong>ID de Orden:</strong> <br /> <span>{order.id}</span>
              </div>
              <div className="detail-item">
                <strong>Fecha de Creación:</strong> <br /> <span>{formatDateTime(order.creation_date)}</span>
              </div>
              <div className="detail-item">
                <strong>Estado:</strong> <br />
                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="detail-item">
                <strong>Almacén:</strong> <br /> <span>{order.id_almacen}</span>
              </div>
              <div className="detail-item">
                <strong>ID de Ubicación:</strong> <br /> <span>{order.location_id}</span>
              </div>
              <div className="detail-item">
                <strong>Dirección de Entrega:</strong> <br /> <span>{order.delivery_address}</span>
              </div>
              {orderDetails?.deliveryUser && (
                <div className="detail-item">
                  <strong>Persona de Entrega:</strong> <br /> <span>{orderDetails.deliveryUser.fullname}</span>
                </div>
              )}
            </div>
          </div>

          <div className="order-products-section">
            <h3>Productos de la Orden</h3>
            {order.OrderProducts && order.OrderProducts.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th style={{ maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ID de Producto</th>
                      <th style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Nombre del Producto</th>
                      <th style={{ maxWidth: 100 }}>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.OrderProducts.map((product) => (
                      <tr key={product.id}>
                        <td style={{ maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.product_id}</td>
                        <td style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {productsDetails.find(p => p.id === product.id)?.details?.nombre_producto || 'Nombre del producto no disponible'}
                        </td>
                        <td style={{ maxWidth: 100 }}>{product.amount}</td>
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
      )}
    </Modal>
  );
};

export default OrderDetailModal;
