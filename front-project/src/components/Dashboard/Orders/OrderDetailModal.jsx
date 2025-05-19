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
      title="Order Details"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ]}
      width={700}
      // bodyStyle={{ padding: '24px 16px' }}
    >
      {loading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: 20 }}>
          <Spin tip="Loading order details..." />
        </div>
      ) : (
        <div className="order-details-container">
          <div className="order-details-section" style={{ marginBottom: 24 }}>
            <h3>Order Information</h3>
            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <div className="detail-item">
                <strong>Order ID:</strong> <br /> <span>{order.id}</span>
              </div>
              <div className="detail-item">
                <strong>Creation Date:</strong> <br /> <span>{formatDateTime(order.creation_date)}</span>
              </div>
              <div className="detail-item">
                <strong>Status:</strong> <br />
                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="detail-item">
                <strong>Warehouse:</strong> <br /> <span>{order.id_almacen}</span>
              </div>
              <div className="detail-item">
                <strong>Location ID:</strong> <br /> <span>{order.location_id}</span>
              </div>
              <div className="detail-item">
                <strong>Delivery Address:</strong> <br /> <span>{order.delivery_address}</span>
              </div>
              {orderDetails?.deliveryUser && (
                <div className="detail-item">
                  <strong>Delivery Person:</strong> <br /> <span>{orderDetails.deliveryUser.fullname}</span>
                </div>
              )}
            </div>
          </div>

          <div className="order-products-section">
            <h3>Order Products</h3>
            {order.OrderProducts && order.OrderProducts.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th style={{ maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Product ID</th>
                      <th style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Product Name</th>
                      <th style={{ maxWidth: 100 }}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.OrderProducts.map((product) => (
                      <tr key={product.id}>
                        <td style={{ maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.product_id}</td>
                        <td style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {productsDetails.find(p => p.id === product.id)?.details?.nombre_producto || 'Product name not available'}
                        </td>
                        <td style={{ maxWidth: 100 }}>{product.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-results">No products in this order</div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
