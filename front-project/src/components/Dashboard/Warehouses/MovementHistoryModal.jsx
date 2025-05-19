import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { movementInventoryAPI } from '../../../api/movementInventory';

const MovementHistoryModal = ({ visible, onCancel, warehouse, availableProducts }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('all');

  useEffect(() => {
    if (visible && warehouse) {
      fetchMovements();
    }
  }, [visible, warehouse, selectedProduct]);

  const fetchMovements = async () => {
    if (!warehouse) return;
    
    setLoading(true);
    try {
      let response;
      
      if (selectedProduct === 'all') {
        response = await movementInventoryAPI.getMovementsByWarehouseId(warehouse.id_almacen);
      } else {
        response = await movementInventoryAPI.getMovementsByWarehouseAndProductId(
          warehouse.id_almacen, 
          selectedProduct
        );
      }
      
      if (response.status === 200) {
        setMovements(response.data);
      } else {
        console.error('Error fetching movements:', response);
      }
    } catch (error) {
      console.error('Error fetching movement history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = availableProducts?.find(p => p.id_producto === productId);
    return product ? product.nombre_producto : productId;
  };

  const getMovementType = (tipo) => {
    return tipo === true ? 'Entry' : 'Exit';
  };

  const handleProductFilterChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredMovements = movements.filter(movement => {
    const productName = getProductName(movement.id_producto).toLowerCase();
    return productName.includes(searchTerm.toLowerCase());
  });

  return (
    <Modal
      title={`Movement History - ${warehouse?.nombre_almacen || 'Warehouse'}`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ]}
      width={800}
    >
      <div className="filter-bar movement-filter-bar">
        <div className="search-field">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* <div className="filter-group">
          <select 
            className="filter-select"
            value={selectedProduct}
            onChange={handleProductFilterChange}
          >
            <option value="all">All Products</option>
            {availableProducts?.map(product => (
              <option key={product.id_producto} value={product.id_producto}>
                {product.nombre_producto}
              </option>
            ))}
          </select>
        </div> */}
      </div>
      
      {loading ? (
        <div className="loading-container">
          <Spin tip="Loading movement history..." />
        </div>
      ) : (
        <>
          {filteredMovements.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map(movement => (
                    <tr key={`${movement.id_producto}-${movement.fecha}`}>
                      <td>{new Date(movement.fecha).toLocaleString()}</td>
                      <td>{getProductName(movement.id_producto)}</td>
                      <td>
                        <span className={`status-badge ${movement.tipo ? 'active' : 'inactive'}`}>
                          {getMovementType(movement.tipo)}
                        </span>
                      </td>
                      <td>{movement.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-results">
              No movement history found.
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default MovementHistoryModal;