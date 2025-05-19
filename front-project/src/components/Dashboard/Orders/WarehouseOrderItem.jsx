import React, { useState, useEffect } from 'react';
import { DownOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { orderAPI } from '../../../api/order';
import AddOrderModal from './AddOrderModal';

const EstadoAlmacenLabel = {
  ACTIVO: { label: 'Active', className: 'status-badge active' },
  MANTENIMIENTO: { label: 'Maintenance', className: 'status-badge warning' },
  INACTIVO: { label: 'Inactive', className: 'status-badge inactive' },
};

const WarehouseOrderItem = ({ warehouse, onApiResponse }) => {
  const [expanded, setExpanded] = useState(false);
  const [warehouseOrders, setWarehouseOrders] = useState([]);
  const [isAddOrderModalVisible, setAddOrderModalVisible] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const toggleExpand = async () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    
    if (newExpandedState && warehouseOrders.length === 0) {
      await fetchWarehouseOrders();
    }
  };
  
  const fetchWarehouseOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await orderAPI.getOrdersByAlmacen(warehouse.id_almacen);
      if (response.status === 200) {
        setWarehouseOrders(response.data);
      } else {
        onApiResponse({ 
          type: 'error', 
          message: `Error loading orders for warehouse ${warehouse.nombre_almacen}` 
        });
      }
    } catch (error) {
      onApiResponse({ 
        type: 'error', 
        message: `Connection error when loading orders for warehouse ${warehouse.nombre_almacen}` 
      });
      console.error('Error fetching warehouse orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const refreshWarehouseOrders = () => {
    if (expanded) {
      fetchWarehouseOrders();
    }
  };

  const getAddressString = (warehouse) => {
    if (!warehouse.direccion) return 'No address';
    
    const calle = warehouse.direccion.calle || '';
    const ciudadNombre = warehouse.direccion.ciudad?.nombre || '';
    const departamentoNombre = warehouse.direccion.ciudad?.departamento?.nombre || '';
    
    const parts = [calle, ciudadNombre, departamentoNombre].filter(Boolean);
    return parts.join(', ');
  };

  const handleAddOrderSuccess = () => {
    refreshWarehouseOrders();
    onApiResponse({ type: 'success', message: 'Order created successfully' });
  };
  
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="warehouse-order-item">
      <div className="warehouse-order-header" onClick={toggleExpand}>
        <div className="warehouse-order-info">
          {expanded ? (
            <DownOutlined className="expand-icon" />
          ) : (
            <RightOutlined className="expand-icon" />
          )}
          <h3>{warehouse.nombre_almacen}</h3>
          <span className="warehouse-order-location">{getAddressString(warehouse)}</span>
          
          <span className={EstadoAlmacenLabel[warehouse.estado]?.className || 'status-badge'}>
            {EstadoAlmacenLabel[warehouse.estado]?.label || warehouse.estado}
          </span>
        </div>
        
        <div className="warehouse-order-actions">
          <button 
            className="button button-primary"
            onClick={(e) => {
              e.stopPropagation();
              setAddOrderModalVisible(true);
            }}
          >
            <PlusOutlined style={{ marginRight: '8px' }} /> Add Order
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="order-content">
          {loadingOrders ? (
            <div className="loading-orders">
              <Spin size="small" /> Loading orders...
            </div>
          ) : warehouseOrders.length > 0 ? (
            <div className="warehouse-orders-list">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Delivery Address</th>
                    <th>Status</th>
                    <th>Products</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id.substring(0, 8)}...</td>
                      <td>{formatDateTime(order.creation_date)}</td>
                      <td>{order.delivery_address}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.OrderProducts.length} items</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-results">
              No orders for this warehouse
            </div>
          )}
        </div>
      )}
      
      <AddOrderModal 
        visible={isAddOrderModalVisible}
        onCancel={() => setAddOrderModalVisible(false)}
        warehouse={warehouse}
        onSuccess={handleAddOrderSuccess}
        onError={(message) => onApiResponse({ type: 'error', message })}
      />
    </div>
  );
};

export default WarehouseOrderItem;