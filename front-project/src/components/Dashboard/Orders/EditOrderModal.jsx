import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { orderAPI } from '../../../api/order';
import { productAPI } from '../../../api/product';
import { almacenProductAPI } from '../../../api/almacenProduct';

const EditOrderModal = ({ visible, order, onCancel, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    delivery_id: '',
    location_id: '',
    delivery_address: '',
    status: '',
    orderProducts: []
  });
  
  const [warehouseProducts, setWarehouseProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({
    product_id: '',
    amount: 1
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  // Initialize form with order data when opened
  useEffect(() => {
    if (visible && order) {
      setFormData({
        delivery_id: order.delivery_id,
        location_id: order.location_id,
        delivery_address: order.delivery_address,
        status: order.status,
        orderProducts: order.OrderProducts.map(product => ({
          product_id: product.product_id,
          amount: product.amount
        }))
      });
      
      fetchWarehouseProducts(order.id_almacen);
    }
  }, [visible, order]);

  const fetchWarehouseProducts = async (warehouseId) => {
    if (!warehouseId) return;
    
    setProductLoading(true);
    try {
      const response = await almacenProductAPI.getStockByWarehouseId(warehouseId);
      if (response.status === 200) {
        setWarehouseProducts(response.data);
        // Set default selection to first product if available
        if (response.data.length > 0) {
          setSelectedProduct(prev => ({
            ...prev,
            product_id: response.data[0].id_producto
          }));
        }
      } else {
        onError('Error loading warehouse products');
      }
    } catch (error) {
      onError('Connection error when loading products');
      console.error('Error fetching warehouse products:', error);
    } finally {
      setProductLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct(prev => ({ ...prev, [name]: value }));
  };

  const addProductToList = () => {
    // Validate product selection
    if (!selectedProduct.product_id) {
      setFormErrors(prev => ({ ...prev, product_id: 'Please select a product' }));
      return;
    }
    
    // Validate amount
    if (!selectedProduct.amount || selectedProduct.amount <= 0) {
      setFormErrors(prev => ({ ...prev, amount: 'Please enter a valid amount' }));
      return;
    }
    
    // Check if product already exists in the list
    const existingProductIndex = formData.orderProducts.findIndex(
      p => p.product_id === selectedProduct.product_id
    );
    
    if (existingProductIndex >= 0) {
      // Update existing product amount
      const updatedProducts = [...formData.orderProducts];
      updatedProducts[existingProductIndex].amount += parseFloat(selectedProduct.amount);
      
      setFormData(prev => ({
        ...prev,
        orderProducts: updatedProducts
      }));
    } else {
      // Add new product to the list
      setFormData(prev => ({
        ...prev,
        orderProducts: [
          ...prev.orderProducts, 
          {
            product_id: selectedProduct.product_id,
            amount: parseFloat(selectedProduct.amount)
          }
        ]
      }));
    }
    
    // Reset selection for next product
    setSelectedProduct({
      product_id: warehouseProducts.length > 0 ? warehouseProducts[0].id_producto : '',
      amount: 1
    });
    
    // Clear any errors
    setFormErrors(prev => ({ ...prev, product_id: '', amount: '' }));
  };

  const removeProduct = (index) => {
    const updatedProducts = [...formData.orderProducts];
    updatedProducts.splice(index, 1);
    setFormData(prev => ({ ...prev, orderProducts: updatedProducts }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.location_id) {
      errors.location_id = 'Location ID is required';
    }
    
    if (!formData.delivery_address) {
      errors.delivery_address = 'Delivery address is required';
    }
    
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    
    if (formData.orderProducts.length === 0) {
      errors.orderProducts = 'At least one product must be added to the order';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const payload = {
        delivery_id: formData.delivery_id,
        location_id: formData.location_id,
        delivery_address: formData.delivery_address,
        status: formData.status,
        orderProducts: formData.orderProducts
      };
      
      const response = await orderAPI.updateOrder(order.id, payload);
      
      if (response.status === 200) {
        onSuccess('Order updated successfully');
      } else {
        onError(response.message || 'Error updating order');
      }
    } catch (error) {
      onError(error.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = warehouseProducts.find(p => p.id_producto === productId);
    if (!product) return productId;
    
    // Find the product's full details from product list
    return product.nombre_producto || productId;
  };

  if (!order) return null;

  return (
    <Modal
      title="Edit Order"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          disabled={loading}
          className="button button-primary"
        >
          {loading ? <Spin size="small" /> : 'Update Order'}
        </Button>
      ]}
      width={700}
    >
      <div className="order-form">
        <div className="form-row">
          <div className="form-group">
            <label>Location ID*</label>
            <input
              type="text"
              name="location_id"
              value={formData.location_id}
              onChange={handleFormChange}
              className={formErrors.location_id ? "input-error" : ""}
              placeholder="Enter location ID"
              disabled={loading}
            />
            {formErrors.location_id && (
              <span className="error-message">{formErrors.location_id}</span>
            )}
          </div>

          <div className="form-group">
            <label>Delivery Address*</label>
            <input
              type="text"
              name="delivery_address"
              value={formData.delivery_address}
              onChange={handleFormChange}
              className={formErrors.delivery_address ? "input-error" : ""}
              placeholder="Enter delivery address"
              disabled={loading}
            />
            {formErrors.delivery_address && (
              <span className="error-message">{formErrors.delivery_address}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status*</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className={formErrors.status ? "input-error" : ""}
              disabled={loading}
            >
              <option value="PENDING">PENDING</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="ON_ROUTE">ON_ROUTE</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            {formErrors.status && (
              <span className="error-message">{formErrors.status}</span>
            )}
          </div>

          <div className="form-group">
            <label>Warehouse ID</label>
            <input
              type="text"
              value={order.id_almacen}
              disabled={true}
              className="disabled-input"
            />
          </div>
        </div>

        <div className="form-divider"></div>
        
        <h3>Order Products</h3>
        {productLoading ? (
          <div className="loading-container">
            <Spin tip="Loading products..." />
          </div>
        ) : (
          <>
            {formData.orderProducts.length > 0 ? (
              <div className="selected-products-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.orderProducts.map((product, index) => (
                      <tr key={index}>
                        <td>{getProductName(product.product_id)}</td>
                        <td>{product.amount}</td>
                        <td>
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => removeProduct(index)}
                            disabled={loading}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-results">
                No products in this order
              </div>
            )}

            <div className="form-divider"></div>
            <h3>Add Products</h3>

            <div className="product-selector">
              <div className="form-group">
                <label>Product*</label>
                <select
                  name="product_id"
                  value={selectedProduct.product_id}
                  onChange={handleProductFormChange}
                  className={formErrors.product_id ? "input-error" : ""}
                  disabled={loading || warehouseProducts.length === 0}
                >
                  <option value="">Select a product</option>
                  {warehouseProducts.map(product => (
                    <option key={product.id_producto} value={product.id_producto}>
                      {product.nombre_producto || product.id_producto} - Stock: {product.cantidad_stock}
                    </option>
                  ))}
                </select>
                {formErrors.product_id && (
                  <span className="error-message">{formErrors.product_id}</span>
                )}
              </div>

              <div className="form-group">
                <label>Amount*</label>
                <input
                  type="number"
                  name="amount"
                  value={selectedProduct.amount}
                  onChange={handleProductFormChange}
                  className={formErrors.amount ? "input-error" : ""}
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                  disabled={loading}
                />
                {formErrors.amount && (
                  <span className="error-message">{formErrors.amount}</span>
                )}
              </div>

              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={addProductToList}
                disabled={loading || warehouseProducts.length === 0}
                style={{ marginBottom: '16px' }}
              >
                Add
              </Button>
            </div>
          </>
        )}

        {formErrors.orderProducts && (
          <div className="error-message">{formErrors.orderProducts}</div>
        )}

        <div className="form-note">
          <p><small>* Required fields</small></p>
        </div>
      </div>
    </Modal>
  );
};

export default EditOrderModal;