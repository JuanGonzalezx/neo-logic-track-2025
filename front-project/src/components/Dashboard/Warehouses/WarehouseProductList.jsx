import React from 'react';
import { Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { almacenProductAPI } from '../../../api/almacenProduct';

const WarehouseProductList = ({ 
  warehouseId, 
  products, 
  loading, 
  availableProducts, 
  onRefresh,
  onApiResponse 
}) => {
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [formData, setFormData] = React.useState({
    cantidad_stock: '',
    nivel_reorden: ''
  });
  const [submitting, setSubmitting] = React.useState(false);

  const getProductName = (productId) => {
    const product = availableProducts?.find(p => p.id_producto === productId);
    return product ? product.nombre_producto : productId;
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      cantidad_stock: product.cantidad_stock.toString(),
      nivel_reorden: product.nivel_reorden.toString()
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.cantidad_stock || !formData.nivel_reorden) {
      onApiResponse({ 
        type: 'error', 
        message: 'Please fill in all required fields' 
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        id_producto: editingProduct.id_producto,
        id_almacen: warehouseId,
        cantidad_stock: parseInt(formData.cantidad_stock),
        nivel_reorden: parseInt(formData.nivel_reorden),
        ultima_reposicion: editingProduct.ultima_reposicion,
        fecha_vencimiento: editingProduct.fecha_vencimiento
      };
      
      const response = await almacenProductAPI.updateStock(editingProduct.id, payload);
      
      if (response.status === 200) {
        onApiResponse({ 
          type: 'success', 
          message: 'Product updated successfully' 
        });
        setEditingProduct(null);
        onRefresh();
      } else {
        onApiResponse({ 
          type: 'error', 
          message: response.message || 'Error updating product' 
        });
      }
    } catch (error) {
      onApiResponse({ 
        type: 'error', 
        message: error.message || 'Server error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isLowStock = (product) => {
    return product.cantidad_stock <= product.nivel_reorden;
  };

  if (loading) {
    return (
      <div className="warehouse-stock loading-stock">
        <Spin size="small" /> Loading inventory...
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="warehouse-stock">
        <div className="no-results">No products in this warehouse</div>
      </div>
    );
  }

  return (
    <div className="warehouse-stock">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock Quantity</th>
            <th>Reorder Level</th>
            <th>Last Restocked</th>
            <th>Expiry Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} className={editingProduct?.id === product.id ? 'editing-row' : ''}>
              {editingProduct?.id === product.id ? (
                <>
                  <td>{getProductName(product.id_producto)}</td>
                  <td>
                    <input
                      type="number"
                      name="cantidad_stock"
                      value={formData.cantidad_stock}
                      onChange={handleFormChange}
                      className="edit-input"
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="nivel_reorden"
                      value={formData.nivel_reorden}
                      onChange={handleFormChange}
                      className="edit-input"
                      min="0"
                    />
                  </td>
                  <td>
                    {new Date(product.ultima_reposicion).toLocaleDateString()}
                  </td>
                  <td>
                    {product.fecha_vencimiento 
                      ? new Date(product.fecha_vencimiento).toLocaleDateString() 
                      : "—"}
                  </td>
                  <td>
                    <div className="edit-actions">
                      <button 
                        className="button button-primary button-small" 
                        onClick={handleSubmitEdit}
                        disabled={submitting}
                      >
                        {submitting ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        className="button button-secondary button-small" 
                        onClick={handleCancelEdit}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{getProductName(product.id_producto)}</td>
                  <td>
                    <span className={isLowStock(product) ? "low-stock" : ""}>
                      {product.cantidad_stock}
                    </span>
                  </td>
                  <td>{product.nivel_reorden}</td>
                  <td>
                    {new Date(product.ultima_reposicion).toLocaleDateString()}
                  </td>
                  <td>
                    {product.fecha_vencimiento 
                      ? new Date(product.fecha_vencimiento).toLocaleDateString() 
                      : "—"}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="action-button edit"
                        onClick={() => handleEditClick(product)}
                      >
                        <EditOutlined />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseProductList;