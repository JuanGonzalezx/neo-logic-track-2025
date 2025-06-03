import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Autocomplete, useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { orderAPI } from '../../../api/order';
import { almacenProductAPI } from '../../../api/almacenProduct';

const EditOrderModal = ({ visible, order, onCancel, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    delivery_name: '',
    delivery_email: '',
    delivery_address: '',
    status: '',
    orderProducts: [],
    coordinate_id: null,
  });

  const [warehouseProducts, setWarehouseProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ product_id: '', amount: 1 });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  // Google Maps autocomplete refs
  const autocompleteRef = useRef(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // On open, load order data and warehouse products
  useEffect(() => {
    if (visible && order) {
      setFormData({
        delivery_name: order.delivery_name || '',
        delivery_email: order.delivery_email || '',
        delivery_address: order.delivery_address || '',
        status: order.status || '',
        orderProducts: order.OrderProducts.map(p => ({
          product_id: p.product_id,
          amount: p.amount,
        })) || [],
        coordinate_id: order.coordinate_id || null,
      });

      if (order.latitude && order.longitude) {
        setLatitude(order.latitude);
        setLongitude(order.longitude);
      } else {
        setLatitude(null);
        setLongitude(null);
      }

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    // if (!formData.delivery_name) errors.delivery_name = 'Delivery name is required';
    // if (!formData.delivery_email || !formData.delivery_email.includes('@')) errors.delivery_email = 'Valid delivery email is required';
    // if (!formData.delivery_address) errors.delivery_address = 'Delivery address is required';
    // if (!formData.status) errors.status = 'Status is required';
    // if (formData.orderProducts.length === 0) errors.orderProducts = 'Add at least one product';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    console.log('Form data before submission:', formData);
    setLoading(true);
    try {
      const payload = {
        delivery_name: formData.delivery_name,
        delivery_email: formData.delivery_email,
        delivery_address: formData.delivery_address,
        status: formData.status,
        orderProducts: formData.orderProducts,
        coordinate_id: formData.coordinate_id,
        // latitude, longitude could be sent if backend supports
      };

      const response = await orderAPI.updateOrder(order.id, payload);

      if (response.status === 200) {
        onSuccess('Order updated successfully');
        onCancel();
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
    return product?.nombre_producto || productId;
  };

  if (!order) return null;

  return (
    <Modal
      title={`Edit Order (ID: ${order.id}) - Post-Delivery`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>Cancelar</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spin size="small" /> : 'Actualizar orden'}
        </Button>
      ]}
      width={800}
    >
      <div className="order-form">
        <div className="form-row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1 1 30%' }}>
            <label>Nombre del delivery*</label>
            <input
              type="text"
              name="delivery_name"
              value={formData.delivery_name}
              onChange={handleFormChange}
              className={formErrors.delivery_name ? 'input-error' : ''}
              placeholder="Introduce el nombre del delivery"
              disabled={loading}
            />
            {formErrors.delivery_name && <span className="error-message">{formErrors.delivery_name}</span>}
          </div>

          <div className="form-group" style={{ flex: '1 1 30%' }}>
            <label>Correo del delivery*</label>
            <input
              type="email"
              name="delivery_email"
              value={formData.delivery_email}
              onChange={handleFormChange}
              className={formErrors.delivery_email ? 'input-error' : ''}
              placeholder="Introduce el correo del delivery"
              disabled={loading}
            />
            {formErrors.delivery_email && <span className="error-message">{formErrors.delivery_email}</span>}
          </div>

          <div className="form-group" style={{ flex: '1 1 30%' }}>
            <label>Estatus*</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className={formErrors.status ? 'input-error' : ''}
              disabled={loading}
            >
              <option value="">Selecciona el estatus</option>
              <option value="PENDING">PENDIENTE</option>
              <option value="ASSIGNED">ASIGNADO</option>
              <option value="ON_ROUTE">EN RUTA</option>
              <option value="DELIVERED">ENTREGADO</option>
              <option value="CANCELLED">CANCELALDO</option>
            </select>
            {formErrors.status && <span className="error-message">{formErrors.status}</span>}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label>Direccion del delivery*</label>
          {isLoaded ? (
            <Autocomplete onLoad={ac => autocompleteRef.current = ac} onPlaceChanged={handlePlaceChanged}>
              <input
                type="text"
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleFormChange}
                className={formErrors.delivery_address ? 'input-error' : ''}
                placeholder="Dirección del delivery"
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
              placeholder="Dirección del delivery"
              disabled={loading}
            />
          )}
          {formErrors.delivery_address && <span className="error-message">{formErrors.delivery_address}</span>}
        </div>

        <div className="form-divider"></div>

        <h3>Order Products</h3>
        {productLoading ? (
          <Spin tip="Cargando productos..." />
        ) : (
          <>
            {formData.orderProducts.length > 0 ? (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Aciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.orderProducts.map((product, idx) => (
                    <tr key={idx}>
                      <td>{getProductName(product.product_id)}</td>
                      <td>{product.amount}</td>
                      <td>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeProduct(idx)}
                          disabled={loading}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay productos en esta orden.</p>
            )}

            <div style={{ marginTop: 20, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 45%' }}>
                <label>Producto*</label>
                <select
                  name="product_id"
                  value={selectedProduct.product_id}
                  onChange={handleProductFormChange}
                  disabled={loading || warehouseProducts.length === 0}
                  className={formErrors.product_id ? 'input-error' : ''}
                  style={{ width: '100%', padding: '4px' }}
                >
                  <option value="">Selecione un producto</option>
                  {warehouseProducts.map(p => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {(p.nombre || p.id_producto)} - Stock: {p.cantidad_stock}
                    </option>
                  ))}
                </select>
                {formErrors.product_id && <span className="error-message">{formErrors.product_id}</span>}
              </div>

              <div style={{ flex: '1 1 25%' }}>
                <label>Cantidad*</label>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  step="1"
                  value={selectedProduct.amount}
                  onChange={handleProductFormChange}
                  disabled={loading}
                  className={formErrors.amount ? 'input-error' : ''}
                  style={{ width: '100%', padding: '4px' }}
                />
                {formErrors.amount && <span className="error-message">{formErrors.amount}</span>}
              </div>

              <div style={{ flex: '1 1 20%', alignSelf: 'flex-end' }}>
                <Button
                  type="default"
                  icon={<PlusOutlined />}
                  onClick={addProductToList}
                  disabled={loading || warehouseProducts.length === 0}
                  style={{ width: '100%' }}
                >
                  Agregar
                </Button>
              </div>
            </div>
          </>
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
      </div>
    </Modal>
  );
};

export default EditOrderModal;
