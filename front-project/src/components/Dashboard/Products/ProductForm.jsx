// // src/components/Dashboard/Inventory/ProductForm.jsx
// import React, { useState, useEffect } from 'react';
// import { Spin, Typography, Alert, Input, Select, InputNumber, DatePicker, Switch } from 'antd';
// import { useNavigate } from 'react-router-dom';
// import dayjs from 'dayjs';

// // import {
// //   createProduct,
// //   getAllCategories,
// //   getAllProviders,
// //   getAllAlmacenes,
// // } from '../../../api/product';
// import { productAPI } from '../../../api/product';


// const { Title } = Typography;
// const { Option } = Select;
// const { TextArea } = Input;

// const ProductForm = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     id_producto: '',
//     id_almacen: '',
//     nombre_producto: '',
//     categoria: '',
//     descripcion: '',
//     sku: '',
//     codigo_barras: '',
//     precio_unitario: 0,
//     cantidad_stock: 0,
//     nivel_reorden: 0,
//     ultima_reposicion: null,
//     fecha_vencimiento: null,
//     id_proveedor: '',
//     peso_kg: 0,
//     dimensiones_cm: '',
//     es_fragil: false,
//     requiere_refrigeracion: false,
//     estado: true,
//   });

//   const [categories, setCategories] = useState([]);
//   const [providers, setProviders] = useState([]);
//   const [almacenes, setAlmacenes] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [apiResponse, setApiResponse] = useState(null);

//   useEffect(() => {
//     const fetchDependencies = async () => {
//       try {
//         const [catRes, provRes, almRes] = await Promise.all([
//           productAPI.getAllCategories(),
//           productAPI.getAllProviders(),
//           productAPI.getAllAlmacenes(),
//         ]);

//         setCategories(catRes.data);
//         setProviders(provRes.data);
//         setAlmacenes(almRes.data);
//       } catch (err) {
//         setApiResponse({ type: 'error', message: 'Error cargando dependencias del sistema.' });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDependencies();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(f => ({ ...f, [name]: value }));
//   };


//   const handleSelectChange = (name, value) => {
//     setFormData(f => ({ ...f, [name]: value }));
//   };

//   const handleSwitchChange = (name, checked) => {
//     setFormData(f => ({ ...f, [name]: checked }));
//   };

//   const handleDateChange = (name, date) => {
//     setFormData(f => ({ ...f, [name]: date }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setApiResponse(null);
//     setSubmitting(true);

//     try {
//       const payload = {
//         ...formData,
//         codigo_barras: parseFloat(formData.codigo_barras),
//         precio_unitario: parseFloat(formData.precio_unitario),
//         cantidad_stock: parseInt(formData.cantidad_stock),
//         nivel_reorden: parseInt(formData.nivel_reorden),
//         peso_kg: parseFloat(formData.peso_kg),
//         ultima_reposicion: dayjs(formData.ultima_reposicion).format('D/M/YYYY'),
//         fecha_vencimiento: formData.fecha_vencimiento
//           ? dayjs(formData.fecha_vencimiento).format('D/M/YYYY')
//           : '',
//       };

//       console.log('submit');
//       const response = await productAPI.createProduct(payload);

//       console.log('Response:', response);
//       setApiResponse({
//         type: 'success',
//         message: 'Producto creado correctamente.',
//       });

//       setFormData({
//         id_producto: '',
//         id_almacen: '',
//         nombre_producto: '',
//         categoria: '',
//         descripcion: '',
//         sku: '',
//         codigo_barras: '',
//         precio_unitario: 0,
//         cantidad_stock: 0,
//         nivel_reorden: 0,
//         ultima_reposicion: null,
//         fecha_vencimiento: null,
//         id_proveedor: '',
//         peso_kg: 0,
//         dimensiones_cm: '',
//         es_fragil: false,
//         requiere_refrigeracion: false,
//         estado: true,
//       });

//       setTimeout(() => navigate('/dashboard/inventory'), 1500);

//     } catch (err) {
//       setApiResponse({
//         type: 'error',
//         message: err.response?.data?.message || 'Error al crear el producto.',
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <Spin tip="Cargando dependencias..." />;

//   return (
//     <div className="user-form-container">
//       <Title level={3}>Crear Nuevo Producto</Title>

//       {apiResponse && (
//         <Alert
//           message={apiResponse.message}
//           type={apiResponse.type}
//           showIcon
//           closable
//           style={{ marginBottom: 20 }}
//         />
//       )}

//       <form className="form" onSubmit={handleSubmit}>
//         <div className="form-row">
//           <div className="form-group">
//             <label>ID Producto</label>
//             <Input name="id_producto" value={formData.id_producto} onChange={handleChange} />
//           </div>
//           <div className="form-group">
//             <label>Almacén</label>
//             <Select
//               name="id_almacen"
//               value={formData.id_almacen}
//               onChange={(val) => handleSelectChange('id_almacen', val)}
//               style={{ width: '100%' }}
//             >
//               {almacenes.map(a => (
//                 <Option key={a.id_almacen} value={a.id_almacen}>{a.nombre_almacen}</Option>
//               ))}
//             </Select>
//           </div>
//           <div className="form-group">
//             <label>Nombre Producto</label>
//             <Input name="nombre_producto" value={formData.nombre_producto} onChange={handleChange} />
//           </div>
//           <div className="form-group">
//             <label>Categoría</label>
//             <Select
//               name="categoria"
//               value={formData.categoria}
//               onChange={(val) => handleSelectChange('categoria', val)}
//               style={{ width: '100%' }}
//             >
//               {categories.map(c => (
//                 <Option key={c.id} value={c.name}>{c.name}</Option>
//               ))}
//             </Select>
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>Descripción</label>
//             <TextArea name="descripcion" rows={3} value={formData.descripcion} onChange={handleChange} />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>SKU</label>
//             <Input name="sku" value={formData.sku} onChange={handleChange} />
//           </div>
//           <div className="form-group">
//             <label>Código de Barras</label>
//             <Input name="codigo_barras" value={formData.codigo_barras} onChange={handleChange} />
//           </div>
//           <div className="form-group">
//             <label>Precio Unitario</label>
//             <InputNumber name="precio_unitario" value={formData.precio_unitario} onChange={val => handleSelectChange('precio_unitario', val)} style={{ width: '100%' }} />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>Cantidad en Stock</label>
//             <InputNumber name="cantidad_stock" value={formData.cantidad_stock} onChange={val => handleSelectChange('cantidad_stock', val)} style={{ width: '100%' }} />
//           </div>
//           <div className="form-group">
//             <label>Nivel de Reorden</label>
//             <InputNumber name="nivel_reorden" value={formData.nivel_reorden} onChange={val => handleSelectChange('nivel_reorden', val)} style={{ width: '100%' }} />
//           </div>
//           <div className="form-group">
//             <label>Última Reposición</label>
//             <DatePicker
//               name="ultima_reposicion"
//               value={formData.ultima_reposicion ? dayjs(formData.ultima_reposicion) : null}
//               onChange={(date) => handleDateChange('ultima_reposicion', date)}
//               format="DD/MM/YYYY"
//               style={{ width: '100%' }}
//             />
//           </div>
//           <div className="form-group">
//             <label>Fecha de Vencimiento</label>
//             <DatePicker
//               name="fecha_vencimiento"
//               value={formData.fecha_vencimiento ? dayjs(formData.fecha_vencimiento) : null}
//               onChange={(date) => handleDateChange('fecha_vencimiento', date)}
//               format="DD/MM/YYYY"
//               style={{ width: '100%' }}
//             />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>Proveedor</label>
//             <Select
//               name="id_proveedor"
//               value={formData.id_proveedor}
//               onChange={(val) => handleSelectChange('id_proveedor', val)}
//               style={{ width: '100%' }}
//             >
//               {providers.map(p => (
//                 <Option key={p.id} value={p.id}>{p.name}</Option>
//               ))}
//             </Select>
//           </div>
//           <div className="form-group">
//             <label>Peso (kg)</label>
//             <InputNumber name="peso_kg" value={formData.peso_kg} onChange={val => handleSelectChange('peso_kg', val)} style={{ width: '100%' }} />
//           </div>
//           <div className="form-group">
//             <label>Dimensiones (cm)</label>
//             <Input name="dimensiones_cm" value={formData.dimensiones_cm} onChange={handleChange} />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>¿Es Frágil?</label><br />
//             <Switch checked={formData.es_fragil} onChange={(checked) => handleSwitchChange('es_fragil', checked)} />
//           </div>
//           <div className="form-group">
//             <label>¿Requiere Refrigeración?</label><br />
//             <Switch checked={formData.requiere_refrigeracion} onChange={(checked) => handleSwitchChange('requiere_refrigeracion', checked)} />
//           </div>
//           <div className="form-group">
//             <label>¿Está Activo?</label><br />
//             <Switch checked={formData.estado} onChange={(checked) => handleSwitchChange('estado', checked)} />
//           </div>
//         </div>

//         <div className="form-actions">
//           <button type="submit" className="button button-primary" disabled={submitting} onSubmit={ ()=> {console.log('submit')}}>
//             {submitting ? <Spin /> : 'Crear Producto'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ProductForm;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../../../api/product";
import { Alert, Spin } from "antd";
import "./Product.css";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    id_producto: "",
    nombre_producto: "",
    categoria_id: "",
    descripcion: "",
    sku: "",
    codigo_barras: "",
    precio_unitario: "",
    peso_kg: "",
    dimensiones_cm: "",
    es_fragil: false,
    requiere_refrigeracion: false,
    estado: true
  });

  const [errors, setErrors] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productAPI.getAllCategories();
        if (response.status === 200) {
          setCategories(response.data);
          if (!isEditing && response.data.length > 0) {
            setFormData(f => ({ ...f, categoria_id: response.data[0].id }));
          }
        } else {
          setApiResponse({ type: "error", message: "Error loading categories" });
        }
      } catch (error) {
        setApiResponse({ type: "error", message: "Connection error" });
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchProduct = async () => {
      if (isEditing) {
        try {
          const response = await productAPI.getProductById(id);
          if (response.status === 200) {
            const product = response.data;
            setFormData({
              id_producto: product.id_producto,
              nombre_producto: product.nombre_producto,
              categoria_id: product.categoria_id,
              descripcion: product.descripcion,
              sku: product.sku,
              codigo_barras: product.codigo_barras,
              precio_unitario: product.precio_unitario,
              peso_kg: product.peso_kg,
              dimensiones_cm: product.dimensiones_cm,
              es_fragil: product.es_fragil,
              requiere_refrigeracion: product.requiere_refrigeracion,
              estado: product.estado
            });
          } else {
            setApiResponse({ type: "error", message: "Product not found" });
            navigate("/dashboard/inventory");
          }
        } catch (error) {
          setApiResponse({ type: "error", message: "Connection error" });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id, isEditing, navigate]);

  const generateSKU = () => {
    const category = categories.find(c => c.id === formData.categoria_id);
    const categoryPrefix = category ? category.nombre.substring(0, 3).toUpperCase() : "PRD";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${categoryPrefix}-${randomNum}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({ 
      ...f, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(err => ({ ...err, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id_producto.trim()) newErrors.id_producto = "Product ID is required";
    if (!formData.nombre_producto.trim()) newErrors.nombre_producto = "Product name is required";
    if (!formData.categoria_id) newErrors.categoria_id = "Category is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    
    if (!formData.codigo_barras) {
      newErrors.codigo_barras = "Barcode is required";
    }
    
    if (!formData.precio_unitario) {
      newErrors.precio_unitario = "Price is required";
    } else if (isNaN(formData.precio_unitario) || parseFloat(formData.precio_unitario) <= 0) {
      newErrors.precio_unitario = "Price must be a positive number";
    }
    
    if (!formData.peso_kg) {
      newErrors.peso_kg = "Weight is required";
    } else if (isNaN(formData.peso_kg) || parseFloat(formData.peso_kg) <= 0) {
      newErrors.peso_kg = "Weight must be a positive number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiResponse(null);
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        precio_unitario: parseFloat(formData.precio_unitario),
        peso_kg: parseFloat(formData.peso_kg),
        codigo_barras: (formData.codigo_barras)
      };

      let response;
      if (isEditing) {
        delete payload.id_producto; // Remove ID from payload
        response = await productAPI.updateProduct(id, payload);
      } else {
        response = await productAPI.createProduct(payload);
      }

      if (response.status === 200 || response.status === 201) {
        setApiResponse({
          type: "success",
          message: isEditing ? "Product updated successfully" : "Product created successfully"
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/dashboard/inventory");
        }, 1500);
      } else {
        setApiResponse({
          type: "error",
          message: response.message || "Error saving product"
        });
      }
    } catch (error) {
      setApiResponse({
        type: "error",
        message: error.message || "Server error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="product-form-container">
        <Spin tip="Loading product..." />
      </div>
    );
  }

  return (
    <div className="product-form-container">
      <h1>{isEditing ? "Edit Product" : "Create New Product"}</h1>

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

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Product ID</label>
            <input
              name="id_producto"
              value={formData.id_producto}
              onChange={handleChange}
              className={errors.id_producto ? "input-error" : ""}
              disabled={isEditing}
            />
            {errors.id_producto && <span className="error-message">{errors.id_producto}</span>}
          </div>

          <div className="form-group">
            <label>Product Name</label>
            <input
              name="nombre_producto"
              value={formData.nombre_producto}
              onChange={handleChange}
              className={errors.nombre_producto ? "input-error" : ""}
            />
            {errors.nombre_producto && <span className="error-message">{errors.nombre_producto}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            {loadingCategories ? (
              <Spin />
            ) : (
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                className={errors.categoria_id ? "input-error" : ""}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            )}
            {errors.categoria_id && <span className="error-message">{errors.categoria_id}</span>}
          </div>

          <div className="form-group">
            <label>SKU</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={errors.sku ? "input-error" : ""}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setFormData(f => ({ ...f, sku: generateSKU() }))}
              >
                Generate
              </button>
            </div>
            {errors.sku && <span className="error-message">{errors.sku}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Barcode</label>
            <input
              name="codigo_barras"
              value={formData.codigo_barras}
              onChange={handleChange}
              className={errors.codigo_barras ? "input-error" : ""}
            />
            {errors.codigo_barras && <span className="error-message">{errors.codigo_barras}</span>}
          </div>

          <div className="form-group">
            <label>Unit Price</label>
            <input
              name="precio_unitario"
              type="number"
              step="0.01"
              value={formData.precio_unitario}
              onChange={handleChange}
              className={errors.precio_unitario ? "input-error" : ""}
            />
            {errors.precio_unitario && <span className="error-message">{errors.precio_unitario}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              name="peso_kg"
              type="number"
              step="0.01"
              value={formData.peso_kg}
              onChange={handleChange}
              className={errors.peso_kg ? "input-error" : ""}
            />
            {errors.peso_kg && <span className="error-message">{errors.peso_kg}</span>}
          </div>

          <div className="form-group">
            <label>Dimensions (cm)</label>
            <input
              name="dimensiones_cm"
              value={formData.dimensiones_cm}
              onChange={handleChange}
              placeholder="e.g. 10x20x30"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="es_fragil"
                checked={formData.es_fragil}
                onChange={handleChange}
              />
              Is Fragile
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="requiere_refrigeracion"
                checked={formData.requiere_refrigeracion}
                onChange={handleChange}
              />
              Requires Refrigeration
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="estado"
                checked={formData.estado}
                onChange={handleChange}
              />
              Active
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => navigate("/dashboard/inventory")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={submitting || loadingCategories}
          >
            {submitting ? <Spin /> : (isEditing ? "Update Product" : "Create Product")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;