import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin } from 'antd';
import { productAPI } from '../../../api/product';
import { categoryApi } from '../../../api/category';
import { almacenProductAPI } from '../../../api/almacenProduct';

const AddProductModal = ({ 
  visible, 
  onCancel, 
  warehouse, 
  availableProducts, 
  availableProviders,
  onSuccess,
  onError 
}) => {
  const [formData, setFormData] = useState({
    id_producto: availableProducts?.length > 0 ? availableProducts[0].id_producto : '',
    cantidad_stock: '',
    nivel_reorden: '',
    ultima_reposicion: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    id_proveedor: availableProviders?.length > 0 ? availableProviders[0].id : ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.id_producto) {
      errors.id_producto = 'Product is required';
    }
    
    if (!formData.cantidad_stock) {
      errors.cantidad_stock = 'Stock quantity is required';
    } else if (isNaN(formData.cantidad_stock) || parseInt(formData.cantidad_stock) < 0) {
      errors.cantidad_stock = 'Stock quantity must be a positive number';
    }
    
    if (!formData.nivel_reorden) {
      errors.nivel_reorden = 'Reorder level is required';
    } else if (isNaN(formData.nivel_reorden) || parseInt(formData.nivel_reorden) < 0) {
      errors.nivel_reorden = 'Reorder level must be a positive number';
    }
    
    if (!formData.ultima_reposicion) {
      errors.ultima_reposicion = 'Last restocked date is required';
    }
    
    // Check date format for fecha_vencimiento if provided
    if (formData.fecha_vencimiento && !/^\d{4}-\d{2}-\d{2}$/.test(formData.fecha_vencimiento)) {
      errors.fecha_vencimiento = 'Expiry date must be in YYYY-MM-DD format';
    }

    if (!formData.id_proveedor)  {
        errors.id_proveedor = 'Supplier is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      // Format date to DD/MM/YYYY as required by backend
      const formatDateForBackend = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };

      const payload = {
        id_producto: formData.id_producto,
        id_almacen: warehouse.id_almacen,
        cantidad_stock: parseInt(formData.cantidad_stock),
        nivel_reorden: parseInt(formData.nivel_reorden),
        ultima_reposicion: formatDateForBackend(formData.ultima_reposicion),
        fecha_vencimiento: formData.fecha_vencimiento ? formatDateForBackend(formData.fecha_vencimiento) : '',
        id_proveedor: formData.id_proveedor,
      };
      
      // Get product details to include in the create request
      const productResponse = await productAPI.getProductById(formData.id_producto);
      if (productResponse.status !== 200) {
        throw new Error('Error retrieving product information');
      }
      
      const productData = productResponse.data;

      const categoriaResponse = await categoryApi.getCategoryById(productData.categoria_id);
      if (categoriaResponse.status !== 200) {
        throw new Error('Error retrieving category');
      }

      const categoriaNombre = categoriaResponse.data.nombre;

      // Combine product data with almacen producto data
      let fullPayload = {
        ...payload,
        nombre_producto: productData.nombre_producto,
        categoria: categoriaNombre,
        descripcion: productData.descripcion,
        sku: productData.sku,
        codigo_barras: productData.codigo_barras,
        precio_unitario: productData.precio_unitario,
        peso_kg: productData.peso_kg,
        dimensiones_cm: productData.dimensiones_cm,
        es_fragil: productData.es_fragil,
        requiere_refrigeracion: productData.requiere_refrigeracion,
        estado: productData.estado
      };

      const response = await productAPI.asignProductToWarehouse(fullPayload);
      
      if (response.status === 200 || response.status === 201) {
        onSuccess();
        resetForm();
        onCancel();
      } else {
        onError(response.message || 'Error adding product to warehouse');
      }
    } catch (error) {
      onError(error.message || 'Server error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_producto: availableProducts?.length > 0 ? availableProducts[0].id_producto : '',
      cantidad_stock: '',
      nivel_reorden: '',
      ultima_reposicion: new Date().toISOString().split('T')[0],
      fecha_vencimiento: ''
    });
    setFormErrors({});
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Modal
      title={`Add Product to ${warehouse?.nombre_almacen || 'Warehouse'}`}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={submitting}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          disabled={submitting}
          className="button button-primary"
        >
          {submitting ? <Spin size="small" /> : 'Add Product'}
        </Button>
      ]}
      width={700}
    >
      <div className="stock-form">
        <div className="form-group">
          <label>Product</label>
          <select
            name="id_producto"
            value={formData.id_producto}
            onChange={handleFormChange}
            className={formErrors.id_producto ? "input-error" : ""}
            disabled={submitting}
          >
            <option value="">Select a product</option>
            {availableProducts?.map(product => (
              <option key={product.id_producto} value={product.id_producto}>
                {product.nombre_producto} - SKU: {product.sku}
              </option>
            ))}
          </select>
          {formErrors.id_producto && (
            <span className="error-message">{formErrors.id_producto}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Stock Quantity*</label>
            <input
              type="number"
              name="cantidad_stock"
              value={formData.cantidad_stock}
              onChange={handleFormChange}
              className={formErrors.cantidad_stock ? "input-error" : ""}
              placeholder="Enter quantity"
              min="0"
              disabled={submitting}
            />
            {formErrors.cantidad_stock && (
              <span className="error-message">{formErrors.cantidad_stock}</span>
            )}
          </div>

          <div className="form-group">
            <label>Reorder Level*</label>
            <input
              type="number"
              name="nivel_reorden"
              value={formData.nivel_reorden}
              onChange={handleFormChange}
              className={formErrors.nivel_reorden ? "input-error" : ""}
              placeholder="Minimum stock level"
              min="0"
              disabled={submitting}
            />
            {formErrors.nivel_reorden && (
              <span className="error-message">{formErrors.nivel_reorden}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Last Restocked Date*</label>
            <input
              type="date"
              name="ultima_reposicion"
              value={formData.ultima_reposicion}
              onChange={handleFormChange}
              className={formErrors.ultima_reposicion ? "input-error" : ""}
              disabled={submitting}
            />
            {formErrors.ultima_reposicion && (
              <span className="error-message">{formErrors.ultima_reposicion}</span>
            )}
          </div>

          <div className="form-group">
            <label>Expiry Date (Optional)</label>
            <input
              type="date"
              name="fecha_vencimiento"
              value={formData.fecha_vencimiento}
              onChange={handleFormChange}
              className={formErrors.fecha_vencimiento ? "input-error" : ""}
              disabled={submitting}
            />
            {formErrors.fecha_vencimiento && (
              <span className="error-message">{formErrors.fecha_vencimiento}</span>
            )}
          </div>
        </div>

        <div className="form-group">
            <label>Proveedor</label>
            <select
                name="id_proveedor"
                value={formData.id_proveedor}
                onChange={handleFormChange}
                className={formErrors.id_proveedor ? "input-error" : ""}
                disabled={submitting}
            >
                <option value="">Selecciona un proveedor</option>
                {availableProviders?.map((prov) => (
                <option key={prov.id} value={prov.id}>
                    {prov.nombre ?? 'Proveedor sin nombre'} - {prov.id}
                </option>
                ))}
            </select>
            {formErrors.id_proveedor && (
                <span className="error-message">{formErrors.id_proveedor}</span>
            )}
        </div>

        <div className="form-note">
          <p><small>* Required fields</small></p>
        </div>
      </div>
    </Modal>
  );
};

export default AddProductModal;
