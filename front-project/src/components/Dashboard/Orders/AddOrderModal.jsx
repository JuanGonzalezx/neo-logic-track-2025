// COMPLETO AddOrderModal.jsx con Autocomplete + Mapa Google Integrado
import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { Modal, Button, Spin, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { orderAPI } from '../../../api/order';
import { almacenProductAPI } from '../../../api/almacenProduct';

const AddOrderModal = ({ visible, onCancel, warehouse, onSuccess, onError }) => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const [formData, setFormData] = useState({
    delivery_address: '',
    customer_name: '',
    customer_email: '',
    auto_assign: true,
    status: 'ASSIGNED',
    id_almacen: warehouse?.id_almacen || '',
    orderProducts: []
  });

  const [warehouseProducts, setWarehouseProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ product_id: '', amount: 1 });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  useEffect(() => {
    if (visible && warehouse) {
      fetchWarehouseProducts();
      setFormData(prev => ({
        ...prev,
        id_almacen: warehouse.id_almacen,
        orderProducts: [],
        auto_assign: true,
        status: 'ASSIGNED'
      }));
    }
  }, [visible, warehouse]);

  const fetchWarehouseProducts = async () => {
    if (!warehouse) return;
    setProductLoading(true);
    try {
      const response = await almacenProductAPI.getStockByWarehouseId(warehouse.id_almacen);
      if (response.status === 200) {
        setWarehouseProducts(response.data);
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
    } finally {
      setProductLoading(false);
    }
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.formatted_address) {
      setFormData(prev => ({ ...prev, delivery_address: place.formatted_address }));
      if (place.geometry?.location) {
        setLatitude(place.geometry.location.lat());
        setLongitude(place.geometry.location.lng());
      }
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setLatitude(lat);
    setLongitude(lng);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setFormData(prev => ({ ...prev, delivery_address: results[0].formatted_address }));
      }
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => {
      const updated = { ...prev, [name]: val };
      if (name === 'auto_assign') {
        updated.status = checked ? 'ASSIGNED' : 'PENDING';
      }
      return updated;
    });
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct(prev => ({ ...prev, [name]: value }));
  };

  const addProductToList = () => {
    if (!selectedProduct.product_id) {
      setFormErrors(prev => ({ ...prev, product_id: 'Please select a product' }));
      return;
    }
    if (!selectedProduct.amount || selectedProduct.amount <= 0) {
      setFormErrors(prev => ({ ...prev, amount: 'Please enter a valid amount' }));
      return;
    }
    const index = formData.orderProducts.findIndex(p => p.product_id === selectedProduct.product_id);
    if (index >= 0) {
      const updated = [...formData.orderProducts];
      updated[index].amount += parseFloat(selectedProduct.amount);
      setFormData(prev => ({ ...prev, orderProducts: updated }));
    } else {
      setFormData(prev => ({
        ...prev,
        orderProducts: [...prev.orderProducts, {
          product_id: selectedProduct.product_id,
          amount: parseFloat(selectedProduct.amount)
        }]
      }));
    }
    setSelectedProduct({ product_id: warehouseProducts[0]?.id_producto || '', amount: 1 });
    setFormErrors({});
  };

  const removeProduct = (index) => {
    const updated = [...formData.orderProducts];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, orderProducts: updated }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customer_name) errors.customer_name = 'Customer name is required';
    if (!formData.customer_email || !formData.customer_email.includes('@')) errors.customer_email = 'Valid email is required';
    if (!formData.delivery_address) errors.delivery_address = 'Delivery address is required';
    if (!formData.status) errors.status = 'Status is required';
    if (formData.orderProducts.length === 0) errors.orderProducts = 'Add at least one product';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await orderAPI.createOrder({ ...formData, latitude, longitude });
      if (response.status === 201) {
        onSuccess();
        resetForm();
        onCancel();
      } else {
        onError(response.message || 'Error creating order');
      }
    } catch (error) {
      onError(error.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      delivery_address: '',
      customer_name: '',
      customer_email: '',
      auto_assign: true,
      status: 'ASSIGNED',
      id_almacen: warehouse?.id_almacen || '',
      orderProducts: []
    });
    setSelectedProduct({ product_id: warehouseProducts[0]?.id_producto || '', amount: 1 });
    setLatitude(null);
    setLongitude(null);
    setFormErrors({});
  };

  const getProductName = (id) => {
    const product = warehouseProducts.find(p => p.id_producto === id);
    return product?.nombre_producto || id;
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Modal
      title={`Create Order for ${warehouse?.nombre_almacen || 'Warehouse'}`}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spin size="small" /> : 'Create Order'}
        </Button>
      ]}
      width={800}
    >
      <div className="order-form">
        <div className="form-row">
          <div className="form-group">
            <label>Customer Name*</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleFormChange}
              className={formErrors.customer_name ? 'input-error' : ''}
              placeholder="Enter customer name"
              disabled={loading}
            />
            {formErrors.customer_name && <span className="error-message">{formErrors.customer_name}</span>}
          </div>

          <div className="form-group">
            <label>Customer Email*</label>
            <input
              type="email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleFormChange}
              className={formErrors.customer_email ? 'input-error' : ''}
              placeholder="Enter customer email"
              disabled={loading}
            />
            {formErrors.customer_email && <span className="error-message">{formErrors.customer_email}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Delivery Address*</label>
          {isLoaded ? (
            <Autocomplete onLoad={ac => autocompleteRef.current = ac} onPlaceChanged={handlePlaceChanged}>
              <input
                type="text"
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleFormChange}
                className={formErrors.delivery_address ? 'input-error' : ''}
                placeholder="Enter delivery address"
                disabled={loading}
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              name="delivery_address"
              value={formData.delivery_address}
              onChange={handleFormChange}
              className={formErrors.delivery_address ? 'input-error' : ''}
              placeholder="Enter delivery address"
              disabled={loading}
            />
          )}
          {formErrors.delivery_address && <span className="error-message">{formErrors.delivery_address}</span>}
        </div>

        <Checkbox
          name="auto_assign"
          checked={formData.auto_assign}
          onChange={handleFormChange}
          disabled={loading}
          style={{ marginBottom: '1rem' }}
        >
          Assign delivery automatically based on proximity
        </Checkbox>

        <div className="product-selector">
          <div className="form-group">
            <label>Product*</label>
            <select
              name="product_id"
              value={selectedProduct.product_id}
              onChange={handleProductFormChange}
              className={formErrors.product_id ? 'input-error' : ''}
              disabled={loading || warehouseProducts.length === 0}
            >
              <option value="">Select a product</option>
              {warehouseProducts.map(product => (
                <option key={product.id_producto} value={product.id_producto}>
                  {product.nombre_producto} - Stock: {product.cantidad_stock}
                </option>
              ))}
            </select>
            {formErrors.product_id && <span className="error-message">{formErrors.product_id}</span>}
          </div>

          <div className="form-group">
            <label>Amount*</label>
            <input
              type="number"
              name="amount"
              value={selectedProduct.amount}
              onChange={handleProductFormChange}
              className={formErrors.amount ? 'input-error' : ''}
              min="1"
              step="1"
              placeholder="Enter amount"
              disabled={loading}
            />
            {formErrors.amount && <span className="error-message">{formErrors.amount}</span>}
          </div>

          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={addProductToList}
            disabled={loading || warehouseProducts.length === 0}
          >
            Add
          </Button>
        </div>

        {formErrors.orderProducts && (
          <div className="error-message">{formErrors.orderProducts}</div>
        )}

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
          <div className="no-results">No products added to this order yet</div>
        )}

        {isLoaded && latitude && longitude && (
          <div style={{ height: 250, marginTop: 20 }}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: latitude, lng: longitude }}
              zoom={15}
              onClick={handleMapClick}
            >
              <Marker position={{ lat: latitude, lng: longitude }} />
            </GoogleMap>
          </div>
        )}

        <div className="form-note">
          <p><small>* Required fields</small></p>
        </div>
      </div>
    </Modal>
  );
};

export default AddOrderModal;
