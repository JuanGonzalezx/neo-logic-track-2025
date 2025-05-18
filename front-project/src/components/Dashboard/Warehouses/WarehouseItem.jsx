import React, { useState } from 'react';
import { almacenProductAPI } from '../../../api/almacenProduct';
import WarehouseProductList from './WarehouseProductList';
import { DownOutlined, RightOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import AddProductModal from './AddProductModal';
import MovementHistoryModal from './MovementHistoryModal';

const EstadoAlmacenLabel = {
  ACTIVO: { label: 'Activo', className: 'status-badge active' },
  MANTENIMIENTO: { label: 'Mantenimiento', className: 'status-badge warning' },
  INACTIVO: { label: 'Inactivo', className: 'status-badge inactive' },
};

const WarehouseItem = ({ warehouse, availableProducts, onApiResponse, availableProviders }) => {
  const [expanded, setExpanded] = useState(false);
  const [warehouseProducts, setWarehouseProducts] = useState(null);
  const [isAddProductModalVisible, setAddProductModalVisible] = useState(false);
  const [isMovementModalVisible, setMovementModalVisible] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const toggleExpand = async () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    
    if (newExpandedState && !warehouseProducts) {
      await fetchWarehouseProducts();
    }
  };
  
  const fetchWarehouseProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await almacenProductAPI.getStockByWarehouseId(warehouse.id_almacen);
      if (response.status === 200) {
        setWarehouseProducts(response.data);
      } else {
        onApiResponse({ 
          type: 'error', 
          message: `Error loading products for warehouse ${warehouse.nombre_almacen}` 
        });
      }
    } catch (error) {
      onApiResponse({ 
        type: 'error', 
        message: `Connection error when loading products for warehouse ${warehouse.nombre_almacen}` 
      });
      console.error('Error fetching warehouse products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const refreshWarehouseProducts = () => {
    if (expanded) {
      fetchWarehouseProducts();
    }
  };

  const capacityPercentage = Math.round((warehouse.capacidad_usada_m3 / warehouse.capacidad_m3) * 100);
  
  const capacityBarColor = 
    capacityPercentage < 50 ? '#4caf50' :
    capacityPercentage < 75 ? '#ff9800' :
    capacityPercentage < 90 ? '#f44336' : '#b71c1c';

  const getAddressString = (warehouse) => {
    if (!warehouse.direccion) return 'Sin dirección';
    
    const calle = warehouse.direccion.calle || '';
    const ciudadNombre = warehouse.direccion.ciudad?.nombre || '';
    const departamentoNombre = warehouse.direccion.ciudad?.departamento?.nombre || '';
    
    const parts = [calle, ciudadNombre, departamentoNombre].filter(Boolean);
    return parts.join(', ');
  };

  const handleAddProductSuccess = () => {
    refreshWarehouseProducts();
    onApiResponse({ type: 'success', message: 'Product added to warehouse successfully' });
  };

  return (
    <div className="warehouse-item">
      <div className="warehouse-header" onClick={toggleExpand}>
        <div className="warehouse-info">
          {expanded ? (
            <DownOutlined className="expand-icon" />
          ) : (
            <RightOutlined className="expand-icon" />
          )}
          <h3>{warehouse.nombre_almacen}</h3>
          <span className="warehouse-location">{getAddressString(warehouse)}</span>
          
          <span className={EstadoAlmacenLabel[warehouse.estado]?.className || 'status-badge'}>
            {EstadoAlmacenLabel[warehouse.estado]?.label || warehouse.estado}
          </span>
        </div>
        
        <div className="warehouse-capacity">
          <div className="capacity-info">
            <span>Capacity: {warehouse.capacidad_usada_m3} / {warehouse.capacidad_m3} m³</span>
            <div className="capacity-bar-container">
              <div 
                className="capacity-bar" 
                style={{
                  width: `${capacityPercentage}%`,
                  backgroundColor: capacityBarColor
                }}
              ></div>
            </div>
          </div>
          
          <div className="warehouse-actions">
            <button 
              className="button button-secondary"
              onClick={(e) => {
                e.stopPropagation();
                setMovementModalVisible(true);
              }}
            >
              <HistoryOutlined style={{ marginRight: '8px' }} /> Movements
            </button>
            
            <button 
              className="button button-primary"
              onClick={(e) => {
                e.stopPropagation();
                setAddProductModalVisible(true);
              }}
            >
              <PlusOutlined style={{ marginRight: '8px' }} /> Add Product
            </button>
          </div>
        </div>
      </div>
      
      {expanded && (
        <WarehouseProductList 
          warehouseId={warehouse.id_almacen} 
          products={warehouseProducts} 
          loading={loadingProducts}
          availableProducts={availableProducts}
          onRefresh={refreshWarehouseProducts}
          onApiResponse={onApiResponse}
        />
      )}
      
      <AddProductModal 
        visible={isAddProductModalVisible}
        onCancel={() => setAddProductModalVisible(false)}
        warehouse={warehouse}
        availableProducts={availableProducts}
        availableProviders= {availableProviders}
        onSuccess={handleAddProductSuccess}
        onError={(message) => onApiResponse({ type: 'error', message })}
      />
      
      <MovementHistoryModal
        visible={isMovementModalVisible}
        onCancel={() => setMovementModalVisible(false)}
        warehouse={warehouse}
        availableProducts={availableProducts}
      />
    </div>
  );
};

export default WarehouseItem;