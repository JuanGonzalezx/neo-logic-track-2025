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
      // Fetch detailed order information
      const response = await orderAPI.getOrderById(order.id);
      
      if (response.status === 200) {
        setOrderDetails(response.data);
        
        // Fetch product details for each product in the order
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
    >
      {loading ? (
        <div className="loading-container">
          <Spin tip="Loading order details..." />
        </div>
      ) : (
        <div className="order-details-container">
          <div className="order-details-section">
            <h3>Order Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Order ID:</span>
                <span className="detail-value">{order.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Creation Date:</span>
                <span className="detail-value">{formatDateTime(order.creation_date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Warehouse:</span>
                <span className="detail-value">{order.id_almacen}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location ID:</span>
                <span className="detail-value">{order.location_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Delivery Address:</span>
                <span className="detail-value">{order.delivery_address}</span>
              </div>
              {orderDetails?.deliveryUser && (
                <div className="detail-item">
                  <span className="detail-label">Delivery Person:</span>
                  <span className="detail-value">{orderDetails.deliveryUser.fullname}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="order-products-section">
            <h3>Order Products</h3>
            {order.OrderProducts && order.OrderProducts.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {order.OrderProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.product_id}</td>
                      <td>
                        {productsDetails.find(p => p.id === product.id)?.details?.nombre_producto || 
                         'Product name not available'}
                      </td>
                      <td>{product.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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