// src/components/Dashboard/Inventory/ProductList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Debes crear estas funciones en tu api/product.js o similar
import { getAllProducts, deleteProduct, updateProduct, getAllCategories, getAllProviders } from '../../../api/product'; 
import {
  Alert, Spin, Modal, Input, Select, Button, InputNumber, Image // Añadir Image para la URL
} from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'; // Añadir EyeOutlined si quieres vista previa

const { Option } = Select;
const { TextArea } = Input;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);

  // Filtros y Paginación (similar a UserList)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // O el valor que prefieras

  // Edición
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Eliminación
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getCategoryName = (id) => categories.find(c => (c.id_categoria_producto || c.id) === id)?.nombre_categoria || id;
  const getProviderName = (id) => providers.find(p => (p.id_proveedor || p.id) === id)?.nombre_proveedor || id;

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [productsRes, categoriesRes, providersRes] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
          getAllProviders(),
        ]);

        if (categoriesRes.status === 200) setCategories(categoriesRes.data);
        else console.error("Error cargando categorías");

        if (providersRes.status === 200) setProviders(providersRes.data);
        else console.error("Error cargando proveedores");
        
        if (productsRes.status === 200) {
          setProducts(productsRes.data.map(p => ({
            ...p,
            // Asegúrate que los nombres de las propiedades coincidan con tu API de productos
            id: p.id_producto || p.id, 
            categoryName: getCategoryName(p.id_categoria_producto), // Pre-calcular para filtrado/display
            providerName: getProviderName(p.id_proveedor_producto)  // Pre-calcular para filtrado/display
          })));
        } else {
          setApiResponse({ type: 'error', message: 'Error cargando productos' });
        }
      } catch (error) {
        setApiResponse({ type: 'error', message: 'Error de conexión o al cargar datos' });
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []); // Carga inicial

 useEffect(() => { // Recalcular nombres si cambian las categorías o proveedores (poco común después de carga inicial)
    setProducts(prevProducts => prevProducts.map(p => ({
        ...p,
        categoryName: getCategoryName(p.id_categoria_producto),
        providerName: getProviderName(p.id_proveedor_producto)
    })));
  }, [categories, providers]);


  const handleDeleteProduct = async () => {
    setDeleting(true);
    try {
      const { status, message } = await deleteProduct(deletingProductId); // Debes implementar deleteProduct
      setApiResponse({
        type: status === 200 ? 'success' : 'error',
        message: message || (status === 200 ? 'Producto eliminado' : 'Error al eliminar producto'),
      });
      if (status === 200) {
        setProducts(prev => prev.filter(p => (p.id_producto || p.id) !== deletingProductId));
      }
    } catch (error) {
      setApiResponse({ type: 'error', message: 'Error de conexión al eliminar' });
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    // Asegúrate que los nombres de campo coincidan con tu estado y el objeto 'product'
    setEditForm({
      nombre_producto: product.nombre_producto,
      descripcion_producto: product.descripcion_producto,
      precio_producto: product.precio_producto,
      id_categoria_producto: product.id_categoria_producto,
      stock_disponible_producto: product.stock_disponible_producto,
      unidad_medida_producto: product.unidad_medida_producto,
      id_proveedor_producto: product.id_proveedor_producto,
      codigo_barras_producto: product.codigo_barras_producto,
      estado_producto: product.estado_producto,
      imagen_producto_url: product.imagen_producto_url,
    });
    setEditErrors({});
    setEditModalVisible(true);
  };
  
  const validateEdit = () => {
    const errs = {};
    if (!editForm.nombre_producto?.trim()) errs.nombre_producto = 'Nombre requerido';
    if (editForm.precio_producto <= 0) errs.precio_producto = 'Precio debe ser mayor a 0';
    // Añade más validaciones según necesites
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEdit()) return;
    setSavingEdit(true);

    try {
      const productId = editingProduct.id_producto || editingProduct.id;
      const payload = { 
        ...editForm,
        precio_producto: parseFloat(editForm.precio_producto),
        stock_disponible_producto: parseInt(editForm.stock_disponible_producto, 10),
        id_categoria_producto: parseInt(editForm.id_categoria_producto, 10),
        id_proveedor_producto: parseInt(editForm.id_proveedor_producto, 10),
      };
      const response = await updateProduct(productId, payload); // Debes implementar updateProduct

      if (response.status === 200) {
        setApiResponse({ type: 'success', message: 'Producto actualizado' });
        setProducts(prev => prev.map(p =>
            (p.id_producto || p.id) === productId ? { ...p, ...payload, categoryName: getCategoryName(payload.id_categoria_producto), providerName: getProviderName(payload.id_proveedor_producto) } : p
        ));
        setEditModalVisible(false);
      } else {
        setApiResponse({ type: 'error', message: response.data?.message || 'Error al guardar producto' });
      }
    } catch (error) {
      setApiResponse({ type: 'error', message: 'Error de servidor al actualizar' });
      console.error("Error updating product:", error);
    } finally {
      setSavingEdit(false);
    }
  };

  // Filtrado
   const filteredProducts = products.filter(p => {
    const searchMatch = searchTerm ? 
        (p.nombre_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.codigo_barras_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.descripcion_producto?.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

    // Para filtrar por categoría y proveedor, necesitamos sus nombres en el objeto producto o buscarlos aquí.
    // Es mejor tenerlos pre-calculados como 'categoryName' y 'providerName'.
    const categoryMatch = filterCategory ? p.categoryName === filterCategory : true;
    const providerMatch = filterProvider ? p.providerName === filterProvider : true;
    const statusMatch = filterStatus ? p.estado_producto === filterStatus : true;
    
    return searchMatch && categoryMatch && providerMatch && statusMatch;
  });


  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loadingData) {
    return <div className="user-list-container"><Spin tip="Cargando productos..." /></div>;
  }

  return (
    <div className="user-list-container"> {/* Reutiliza clase contenedora */}
      {apiResponse && (
        <Alert
          type={apiResponse.type}
          message={apiResponse.message}
          showIcon
          closable
          onClose={() => setApiResponse(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <div className="page-header">
        <h1>Administración de Productos</h1>
        <Link to="/dashboard/inventory/add" className="button button-primary"> {/* Ruta para añadir producto */}
          <span className="button-icon add" /> Nuevo Producto
        </Link>
      </div>

      <div className="filter-bar">
        <Input.Search
          placeholder="Buscar producto (nombre, código)"
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          placeholder="Categoría"
          onChange={value => { setFilterCategory(value); setCurrentPage(1); }}
          style={{ width: 200 }}
          allowClear
        >
          <Option value="">Todas las categorías</Option>
          {categories.map(cat => (
            <Option key={cat.id_categoria_producto || cat.id} value={cat.nombre_categoria || cat.name}>
              {cat.nombre_categoria || cat.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Proveedor"
          onChange={value => { setFilterProvider(value); setCurrentPage(1); }}
          style={{ width: 200 }}
          allowClear
        >
          <Option value="">Todos los proveedores</Option>
          {providers.map(prov => (
            <Option key={prov.id_proveedor || prov.id} value={prov.nombre_proveedor || prov.name}>
              {prov.nombre_proveedor || prov.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Estado"
          onChange={value => { setFilterStatus(value); setCurrentPage(1); }}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="">Todos los estados</Option>
          <Option value="activo">Activo</Option>
          <Option value="inactivo">Inactivo</Option>
          <Option value="descontinuado">Descontinuado</Option>
        </Select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Proveedor</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map(product => (
              <tr key={product.id_producto || product.id}>
                <td>
  {product.imagen_producto_url ? (
    <Image 
      src={product.imagen_producto_url} 
      alt={product.nombre_producto} 
      width={50} 
      height={50} 
      style={{ objectFit: 'cover' }}
      preview={{
        visible: false,
        mask: (
          <EyeOutlined 
            onClick={() => Modal.info({
              title: product.nombre_producto,
              content: (
                <Image 
                  src={product.imagen_producto_url} 
                  alt={product.nombre_producto} 
                  style={{ maxWidth: '100%' }} 
                />
              )
            })} 
          />
        )
      }}
    />
  ) : 'N/A'}
</td>

                <td>{product.nombre_producto}</td>
                <td>{product.categoryName}</td>
                <td>{product.providerName}</td>
                <td>${product.precio_producto?.toFixed(2)}</td>
                <td>{product.stock_disponible_producto} {product.unidad_medida_producto}</td>
                <td>
                  <span className={`status-badge ${product.estado_producto?.toLowerCase()}`}>
                    {product.estado_producto}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(product)}
                      className="action-button edit"
                    />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setDeletingProductId(product.id_producto || product.id);
                        setDeleteModalVisible(true);
                      }}
                      className="action-button delete"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {paginatedProducts.length === 0 && (
                <tr><td colSpan="8" className="no-results">No se encontraron productos.</td></tr>
            )}
          </tbody>
        </table>
      </div>

        <div className="pagination">
            <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                Anterior
            </Button>
            <span> Página {currentPage} de {totalPages} </span>
            <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                Siguiente
            </Button>
        </div>

      {/* Modal de Edición */}
      <Modal
        title={`Editar ${editingProduct?.nombre_producto || ''}`}
        open={isEditModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSave}
        confirmLoading={savingEdit}
        destroyOnClose
        width={800} // Puedes ajustar el ancho
      >
        {/* El formulario de edición puede ser muy similar al ProductForm, o puedes simplificarlo */}
        {/* Aquí un ejemplo básico de campos en el modal */}
        <div className="form"> {/* Reutiliza clases si es posible */}
            <div className="form-row">
                <div className="form-group">
                    <label>Nombre del Producto</label>
                    <Input value={editForm.nombre_producto} onChange={e => setEditForm({...editForm, nombre_producto: e.target.value})} className={editErrors.nombre_producto ? 'input-error' : ''}/>
                    {editErrors.nombre_producto && <span className="error-message">{editErrors.nombre_producto}</span>}
                </div>
                 <div className="form-group">
                    <label>Código de Barras</label>
                    <Input value={editForm.codigo_barras_producto} onChange={e => setEditForm({...editForm, codigo_barras_producto: e.target.value})} />
                </div>
            </div>
            <div className="form-group">
                <label>Descripción</label>
                <TextArea rows={3} value={editForm.descripcion_producto} onChange={e => setEditForm({...editForm, descripcion_producto: e.target.value})} />
            </div>
             <div className="form-row">
                <div className="form-group">
                    <label>Precio</label>
                    <InputNumber value={editForm.precio_producto} onChange={value => setEditForm({...editForm, precio_producto: value})} min={0} step={0.01} stringMode style={{width: '100%'}} className={editErrors.precio_producto ? 'input-error' : ''}/>
                    {editErrors.precio_producto && <span className="error-message">{editErrors.precio_producto}</span>}
                </div>
                <div className="form-group">
                    <label>Stock</label>
                    <InputNumber value={editForm.stock_disponible_producto} onChange={value => setEditForm({...editForm, stock_disponible_producto: value})} min={0} style={{width: '100%'}}/>
                </div>
                 <div className="form-group">
                    <label>Unidad Medida</label>
                    <Input value={editForm.unidad_medida_producto} onChange={e => setEditForm({...editForm, unidad_medida_producto: e.target.value})} />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Categoría</label>
                    <Select value={editForm.id_categoria_producto} onChange={value => setEditForm({...editForm, id_categoria_producto: value})} style={{width: '100%'}}>
                        {categories.map(cat => <Option key={cat.id_categoria_producto || cat.id} value={cat.id_categoria_producto || cat.id}>{cat.nombre_categoria || cat.name}</Option>)}
                    </Select>
                </div>
                <div className="form-group">
                    <label>Proveedor</label>
                    <Select value={editForm.id_proveedor_producto} onChange={value => setEditForm({...editForm, id_proveedor_producto: value})} style={{width: '100%'}}>
                        {providers.map(prov => <Option key={prov.id_proveedor || prov.id} value={prov.id_proveedor || prov.id}>{prov.nombre_proveedor || prov.name}</Option>)}
                    </Select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Estado</label>
                    <Select value={editForm.estado_producto} onChange={value => setEditForm({...editForm, estado_producto: value})} style={{width: '100%'}}>
                        <Option value="activo">Activo</Option>
                        <Option value="inactivo">Inactivo</Option>
                        <Option value="descontinuado">Descontinuado</Option>
                    </Select>
                </div>
                <div className="form-group">
                    <label>URL Imagen</label>
                    <Input value={editForm.imagen_producto_url} onChange={e => setEditForm({...editForm, imagen_producto_url: e.target.value})} />
                </div>
            </div>
        </div>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        title="Confirmar Eliminación"
        open={isDeleteModalVisible}
        onOk={handleDeleteProduct}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Eliminar"
        cancelText="Cancelar"
        confirmLoading={deleting}
      >
        <p>¿Está seguro que desea eliminar este producto permanentemente?</p>
        <p>Esta acción no puede deshacerse.</p>
      </Modal>
    </div>
  );
};

export default ProductList;