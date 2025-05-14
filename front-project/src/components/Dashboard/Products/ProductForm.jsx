// src/components/Dashboard/Inventory/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { Spin, Typography, Alert, Input, Select, InputNumber } from 'antd'; // Asegúrate de importar InputNumber
import { useNavigate } from 'react-router-dom'; // Para redireccionar después de crear
// Debes crear estas funciones en tu api/product.js o similar
import { createProduct, getAllCategories, getAllProviders } from '../../../api/product'; // Ajusta la ruta
import '../Users/User.css'; // Reutilizamos los estilos existentes

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre_producto: '',
    descripcion_producto: '',
    precio_producto: 0,
    id_categoria_producto: '',
    stock_disponible_producto: 0,
    unidad_medida_producto: 'unidad', // Valor por defecto
    id_proveedor_producto: '',
    codigo_barras_producto: '',
    estado_producto: 'activo', // Valor por defecto
    imagen_producto_url: '',
  });

  const [errors, setErrors] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [categoriesRes, providersRes] = await Promise.all([
          getAllCategories(), // Debes implementar esta función API
          getAllProviders(),   // Debes implementar esta función API
        ]);

        if (categoriesRes.status === 200 && categoriesRes.data.length > 0) {
          setCategories(categoriesRes.data);
          setFormData(f => ({ ...f, id_categoria_producto: categoriesRes.data[0]?.id || '' }));
        } else {
          setApiResponse({ type: 'error', message: 'Error cargando categorías o no hay categorías disponibles.' });
        }

        if (providersRes.status === 200 && providersRes.data.length > 0) {
          setProviders(providersRes.data);
          setFormData(f => ({ ...f, id_proveedor_producto: providersRes.data[0]?.id || '' }));
        } else {
           setApiResponse(prev => ({ ...prev, type: 'error', message: `${prev?.message || ''} Error cargando proveedores o no hay proveedores disponibles.` }));
        }

      } catch (error) {
        setApiResponse({
          type: 'error',
          message: 'Error cargando categorías o proveedores.',
        });
        console.error("Error fetching dependencies:", error);
      } finally {
        setLoadingDependencies(false);
      }
    };
    fetchDependencies();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }));
  };

  const handleNumberChange = (name, value) => {
    setFormData(f => ({ ...f, [name]: value }));
     if (errors[name]) setErrors(err => ({ ...err, [name]: '' }));
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre_producto.trim()) newErrors.nombre_producto = 'Nombre del producto requerido';
    if (formData.precio_producto <= 0) newErrors.precio_producto = 'Precio debe ser mayor a 0';
    if (!formData.id_categoria_producto) newErrors.id_categoria_producto = 'Categoría requerida';
    if (formData.stock_disponible_producto < 0) newErrors.stock_disponible_producto = 'Stock no puede ser negativo';
    if (!formData.unidad_medida_producto.trim()) newErrors.unidad_medida_producto = 'Unidad de medida requerida';
    if (!formData.id_proveedor_producto) newErrors.id_proveedor_producto = 'Proveedor requerido';
    if (!formData.codigo_barras_producto.trim()) newErrors.codigo_barras_producto = 'Código de barras requerido';
    // Puedes añadir más validaciones (ej. formato URL para imagen_producto_url)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiResponse(null);
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // El payload debe coincidir con lo que espera tu backend
      const payload = {
        ...formData,
        precio_producto: parseFloat(formData.precio_producto),
        stock_disponible_producto: parseInt(formData.stock_disponible_producto, 10),
        // Asegúrate que los IDs se envían como números si el backend así lo espera
        id_categoria_producto: parseInt(formData.id_categoria_producto, 10),
        id_proveedor_producto: parseInt(formData.id_proveedor_producto, 10),
      };
      
      console.log("Enviando producto:", payload); // Para depuración
      const response = await createProduct(payload); // Debes implementar createProduct

      setApiResponse({
        type: response.status === 201 ? 'success' : 'error',
        message: response.message || (response.status === 201 ? 'Producto creado exitosamente' : 'Error al crear producto'),
      });

      if (response.status === 201) {
        setFormData({ // Reset form
            nombre_producto: '',
            descripcion_producto: '',
            precio_producto: 0,
            id_categoria_producto: categories[0]?.id || '',
            stock_disponible_producto: 0,
            unidad_medida_producto: 'unidad',
            id_proveedor_producto: providers[0]?.id || '',
            codigo_barras_producto: '',
            estado_producto: 'activo',
            imagen_producto_url: '',
        });
        // Opcional: Redirigir a la lista de productos
        // setTimeout(() => navigate('/dashboard/inventory'), 2000); 
      }
    } catch (err) {
      setApiResponse({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Error del servidor creando producto',
      });
      console.error("Error creating product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDependencies) {
    return <div className="user-form-container"><Spin tip="Cargando dependencias..." /></div>;
  }

  return (
    <div className="user-form-container"> {/* Reutiliza la clase contenedora */}
      <Title level={3}>Crear Nuevo Producto</Title>

      {apiResponse && (
        <Alert
          message={apiResponse.message}
          type={apiResponse.type}
          showIcon
          closable
          onClose={() => setApiResponse(null)}
          style={{ marginBottom: 20 }}
        />
      )}

      <form className="form" onSubmit={handleSubmit}> {/* Reutiliza la clase de formulario */}
        <div className="form-row">
          <div className="form-group">
            <label>Nombre del Producto</label>
            <Input
              name="nombre_producto"
              value={formData.nombre_producto}
              onChange={handleChange}
              className={errors.nombre_producto ? 'input-error' : ''}
            />
            {errors.nombre_producto && <span className="error-message">{errors.nombre_producto}</span>}
          </div>
          <div className="form-group">
            <label>Código de Barras</label>
            <Input
              name="codigo_barras_producto"
              value={formData.codigo_barras_producto}
              onChange={handleChange}
              className={errors.codigo_barras_producto ? 'input-error' : ''}
            />
            {errors.codigo_barras_producto && <span className="error-message">{errors.codigo_barras_producto}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Descripción</label>
            <TextArea
              name="descripcion_producto"
              rows={3}
              value={formData.descripcion_producto}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Precio</label>
            <InputNumber
              name="precio_producto"
              value={formData.precio_producto}
              onChange={(value) => handleNumberChange('precio_producto', value)}
              min={0}
              step={0.01}
              stringMode // Recomendado para decimales para evitar problemas de precisión
              style={{ width: '100%' }}
              className={errors.precio_producto ? 'input-error' : ''}
            />
            {errors.precio_producto && <span className="error-message">{errors.precio_producto}</span>}
          </div>
          <div className="form-group">
            <label>Stock Disponible</label>
            <InputNumber
              name="stock_disponible_producto"
              value={formData.stock_disponible_producto}
              onChange={(value) => handleNumberChange('stock_disponible_producto', value)}
              min={0}
              style={{ width: '100%' }}
              className={errors.stock_disponible_producto ? 'input-error' : ''}
            />
            {errors.stock_disponible_producto && <span className="error-message">{errors.stock_disponible_producto}</span>}
          </div>
           <div className="form-group">
            <label>Unidad de Medida</label>
            <Input
              name="unidad_medida_producto"
              value={formData.unidad_medida_producto}
              onChange={handleChange}
              className={errors.unidad_medida_producto ? 'input-error' : ''}
            />
            {errors.unidad_medida_producto && <span className="error-message">{errors.unidad_medida_producto}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Categoría</label>
            <Select
              name="id_categoria_producto"
              value={formData.id_categoria_producto}
              onChange={(value) => handleSelectChange('id_categoria_producto', value)}
              className={errors.id_categoria_producto ? 'input-error' : ''}
              loading={loadingDependencies}
            >
              {categories.map(cat => (
                <Option key={cat.id_categoria_producto || cat.id} value={cat.id_categoria_producto || cat.id}>
                  {cat.nombre_categoria || cat.name} {/* Ajusta según la estructura de tu API de categorías */}
                </Option>
              ))}
            </Select>
            {errors.id_categoria_producto && <span className="error-message">{errors.id_categoria_producto}</span>}
          </div>
           <div className="form-group">
            <label>Proveedor</label>
            <Select
              name="id_proveedor_producto"
              value={formData.id_proveedor_producto}
              onChange={(value) => handleSelectChange('id_proveedor_producto', value)}
              className={errors.id_proveedor_producto ? 'input-error' : ''}
              loading={loadingDependencies}
            >
              {providers.map(prov => (
                <Option key={prov.id_proveedor || prov.id} value={prov.id_proveedor || prov.id}>
                  {prov.nombre_proveedor || prov.name} {/* Ajusta según la estructura de tu API de proveedores */}
                </Option>
              ))}
            </Select>
            {errors.id_proveedor_producto && <span className="error-message">{errors.id_proveedor_producto}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Estado</label>
            <Select
              name="estado_producto"
              value={formData.estado_producto}
              onChange={(value) => handleSelectChange('estado_producto', value)}
            >
              <Option value="activo">Activo</Option>
              <Option value="inactivo">Inactivo</Option>
              <Option value="descontinuado">Descontinuado</Option>
            </Select>
          </div>
          <div className="form-group">
            <label>URL de Imagen (Opcional)</label>
            <Input
              name="imagen_producto_url"
              value={formData.imagen_producto_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="button button-primary" // Reutiliza clases de botón
            disabled={submitting || loadingDependencies}
          >
            {submitting ? <Spin /> : 'Crear Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;