import React, { useState } from 'react';
import { DownOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import OrdersTable from './OrdersTable';
import AddOrderModal from './AddOrderModal';

const EstadoAlmacenLabel = {
  ACTIVO: { label: 'Activo', className: 'status-badge active' },
  MANTENIMIENTO: { label: 'Mantenimiento', className: 'status-badge warning' },
  INACTIVO: { label: 'Inactivo', className: 'status-badge inactive' },
};

const WarehouseOrderItem = ({
  warehouse,
  orders,             // órdenes filtradas para este almacén
  onApiResponse,
  onSort,
  sortField,
  sortDirection,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isAddOrderModalVisible, setAddOrderModalVisible] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const getAddressString = (warehouse) => {
    if (!warehouse.direccion) return 'No address';

    const calle = warehouse.direccion.calle || '';
    const ciudadNombre = warehouse.direccion.ciudad?.nombre || '';
    const departamentoNombre = warehouse.direccion.ciudad?.departamento?.nombre || '';

    const parts = [calle, ciudadNombre, departamentoNombre].filter(Boolean);
    return parts.join(', ') || 'Sin dirección';
  };

  const handleAddOrderSuccess = () => {
    setAddOrderModalVisible(false);
    onApiResponse({ type: 'success', message: 'Orden creada exitosamente' });
  };

  return (
    <div className="warehouse-order-item">
      <div className="warehouse-order-header" onClick={toggleExpand} style={{ cursor: 'pointer' }}>
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
            <PlusOutlined style={{ marginRight: '8px' }} /> Agregar orden
          </button>
        </div>
      </div>

      {expanded && (
        <div className="order-content">
          {orders === null ? (
            <div className="loading-orders">
              <Spin size="small" /> Cargando órdenes...
            </div>
          ) : orders.length > 0 ? (
            <OrdersTable
              orders={orders}
              onSort={onSort}
              sortField={sortField}
              sortDirection={sortDirection}
              onApiResponse={onApiResponse}
            />
          ) : (
            <div className="no-results">Sin órdenes para este almacén</div>
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
