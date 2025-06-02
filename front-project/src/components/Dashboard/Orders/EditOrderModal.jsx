import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { orderAPI } from '../../../api/order';
import { almacenProductAPI } from '../../../api/almacenProduct';

const EditOrderModal = ({ visible, order, onCancel, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    delivery_id: '',
    location_id: '',
    delivery_address: '',
    status: '',
    orderProducts: [],
  });

  const [warehouseProducts, setWarehouseProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({
    product_id: '',
    amount: 1,
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
        orderProducts: order.OrderProducts.map((product) => ({
          product_id: product.product_id,
          amount: product.amount,
        })),
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
        if (response.data.length > 0) {
          setSelectedProduct((prev) => ({
            ...prev,
            product_id: response.data[0].id_producto,
          }));
        }
      } else {
        onError('Error al cargar los productos del almacén');
      }
    } catch (error) {
      onError('Error de conexión al cargar los productos');
      console.error('Error fetching warehouse products:', error);
    } finally {
      setProductLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const addProductToList = () => {
    if (!selectedProduct.product_id) {
      setFormErrors((prev) => ({ ...prev, product_id: 'Por favor seleccione un producto' }));
      return;
    }

    if (!selectedProduct.amount || selectedProduct.amount <= 0) {
      setFormErrors((prev) => ({ ...prev, amount: 'Por favor ingrese una cantidad válida' }));
      return;
    }

    const existingProductIndex = formData.orderProducts.findIndex(
      (p) => p.product_id === selectedProduct.product_id,
    );

    if (existingProductIndex >= 0) {
      const updatedProducts = [...formData.orderProducts];
      updatedProducts[existingProductIndex].amount += parseFloat(selectedProduct.amount);

      setFormData((prev) => ({
        ...prev,
        orderProducts: updatedProducts,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        orderProducts: [
          ...prev.orderProducts,
          {
            product_id: selectedProduct.product_id,
            amount: parseFloat(selectedProduct.amount),
          },
        ],
      }));
    }

    setSelectedProduct({
      product_id: warehouseProducts.length > 0 ? warehouseProducts[0].id_producto : '',
      amount: 1,
    });

    setFormErrors((prev) => ({ ...prev, product_id: '', amount: '' }));
  };

  const removeProduct = (index) => {
    const updatedProducts = [...formData.orderProducts];
    updatedProducts.splice(index, 1);
    setFormData((prev) => ({ ...prev, orderProducts: updatedProducts }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.location_id) {
      errors.location_id = 'El ID de ubicación es obligatorio';
    }

    if (!formData.delivery_address) {
      errors.delivery_address = 'La dirección de entrega es obligatoria';
    }

    if (!formData.status) {
      errors.status = 'El estado es obligatorio';
    }

    if (formData.orderProducts.length === 0) {
      errors.orderProducts = 'Se debe agregar al menos un producto a la orden';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        id_almacen: order.id_almacen,
        location_id: formData.location_id,
        delivery_address: formData.delivery_address,
        status: formData.status,
        orderProducts: formData.orderProducts,
      };

      const response = await orderAPI.updateOrder(order.id, payload);

      if (response.status === 200) {
        onSuccess('Orden actualizada con éxito');
      } else {
        onError(response.message || 'Error al actualizar la orden');
      }
    } catch (error) {
      onError(error.message || 'Error del servidor');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const getProductName = (productId) => {
    const product = warehouseProducts.find((p) => p.id_producto === productId);
    if (!product) return productId;
    return product.nombre_producto || productId;
  };

  return (
    <Modal
      title="Editar Orden"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={loading}
          className="button button-primary"
        >
          {loading ? <Spin size="small" /> : 'Guardar cambios'}
        </Button>,
      ]}
      width={700}
    >
      <div className="order-form">
        <div className="form-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1 1 45%' }}>
            <label>ID de Ubicación*</label>
            <input
              type="text"
              name="location_id"
              value={formData.location_id}
              onChange={handleFormChange}
              className={formErrors.location_id ? 'input-error' : ''}
              placeholder="Ingrese el ID de ubicación"
              disabled={loading}
            />
            {formErrors.location_id && (
              <span className="error-message">{formErrors.location_id}</span>
            )}
          </div>

          <div className="form-group" style={{ flex: '1 1 45%' }}>
            <label>Dirección de Entrega*</label>
            <input
              type="text"
              name="delivery_address"
              value={formData.delivery_address}
              onChange={handleFormChange}
              className={formErrors.delivery_address ? 'input-error' : ''}
              placeholder="Ingrese la dirección de entrega"
              disabled={loading}
            />
            {formErrors.delivery_address && (
              <span className="error-message">{formErrors.delivery_address}</span>
            )}
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1 1 45%' }}>
            <label>Estado*</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className={formErrors.status ? 'input-error' : ''}
              disabled={loading}
            >
              <option value="PENDING">PENDIENTE</option>
              <option value="ASSIGNED">ASIGNADO</option>
              <option value="ON_ROUTE">EN RUTA</option>
              <option value="DELIVERED">ENTREGADO</option>
              <option value="CANCELLED">CANCELADO</option>
            </select>
            {formErrors.status && (
              <span className="error-message">{formErrors.status}</span>
            )}
          </div>

          <div className="form-group" style={{ flex: '1 1 45%' }}>
            <label>ID de Almacén</label>
            <input
              type="text"
              value={order.id_almacen}
              disabled={true}
              className="disabled-input"
            />
          </div>
        </div>

        <div className="form-divider"></div>

        <h3>Productos de la Orden</h3>
        {productLoading ? (
          <div className="loading-container">
            <Spin tip="Cargando productos..." />
          </div>
        ) : (
          <>
            {formData.orderProducts.length > 0 ? (
              <div className="selected-products-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Acciones</th>
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
              <div className="no-results">No hay productos en esta orden</div>
            )}

            <div className="form-divider"></div>
            <h3>Agregar Productos</h3>

            <div className="product-selector" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 45%' }}>
                <label>Producto*</label>
                <select
                  name="product_id"
                  value={selectedProduct.product_id}
                  onChange={handleProductFormChange}
                  className={formErrors.product_id ? 'input-error' : ''}
                  disabled={loading || warehouseProducts.length === 0}
                >
                  <option value="">Seleccione un producto</option>
                  {warehouseProducts.map((product) => (
                    <option key={product.id_producto} value={product.id_producto}>
                      {product.nombre_producto || product.id_producto} - Stock: {product.cantidad_stock}
                    </option>
                  ))}
                </select>
                {formErrors.product_id && (
                  <span className="error-message">{formErrors.product_id}</span>
                )}
              </div>

              <div className="form-group" style={{ flex: '1 1 25%' }}>
                <label>Cantidad*</label>
                <input
                  type="number"
                  name="amount"
                  value={selectedProduct.amount}
                  onChange={handleProductFormChange}
                  className={formErrors.amount ? 'input-error' : ''}
                  placeholder="Ingrese la cantidad"
                  min="1"
                  step="1"
                  disabled={loading}
                />
                {formErrors.amount && (
                  <span className="error-message">{formErrors.amount}</span>
                )}
              </div>

              <div style={{ flex: '1 1 20%', marginBottom: '16px' }}>
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

        {formErrors.orderProducts && (
          <div className="error-message">{formErrors.orderProducts}</div>
        )}

        <div className="form-note">
          <p>
            <small>* Campos obligatorios</small>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default EditOrderModal;
