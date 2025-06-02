import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { Modal, Spin, Button } from 'antd';
import { orderAPI } from '../../../api/order';
import OrderDetailModal from './OrderDetailModal';
import EditOrderModal from './EditOrderModal';

const OrdersTable = ({ orders, onSort, sortField, sortDirection, onApiResponse }) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // Estado para mostrar/ocultar modal de confirmación de borrado
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showDetailModal = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const showEditModal = (order) => {
    setSelectedOrder(order);
    setEditModalVisible(true);
  };

  // Abrir modal confirmación borrado
  const showDeleteModal = (order) => {
    setOrderToDelete(order);
    setDeleteModalVisible(true);
  };

  // Confirmar y ejecutar borrado
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeleting(true);
    try {
      const response = await orderAPI.deleteOrder(orderToDelete.id);
      if (response.status === 204) {
        onApiResponse({ type: 'success', message: 'Order deleted successfully' });
      } else {
        onApiResponse({ type: 'error', message: response.message || 'Error deleting order' });
      }
    } catch (error) {
      onApiResponse({ type: 'error', message: error.message || 'Server error' });
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
      setOrderToDelete(null);
    }
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

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin tip="Procesando..." />
      </div>
    );
  }
  const goToTrackingPage = (order) => {
    navigate(`/dashboard/inventory/orders/${order.id}/tracking`);
  }

  return (
    <div className="table-container">
      {orders.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => onSort('id')}>
                ID de Orden {getSortIcon('id')}
              </th>
              <th onClick={() => onSort('creation_date')}>
                Fecha {getSortIcon('creation_date')}
              </th>
              <th>Dirección de entrega</th>
              <th>ID de repartidor</th>
              <th onClick={() => onSort('status')}>
                Estado {getSortIcon('status')}
              </th>
              <th>Almacén</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id.substring(0, 8)}...</td>
                <td>{formatDateTime(order.creation_date)}</td>
                <td>{order.delivery_address}</td>
                <td>{order.delivery_id == "00000000-0000-0000-0000-000000000000" ? "Sin repartidor asignado" : order.delivery_id}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.id_almacen}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="action-button view"
                      onClick={() => goToTrackingPage(order)}
                      title="Ver detalles de la orden"
                    >
                      <EyeOutlined />
                    </button>
                    <button
                      className="action-button edit"
                      onClick={() => showEditModal(order)}
                      title="Editar orden"
                    >
                      <EditOutlined />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => showDeleteModal(order)}
                      title="Eliminar orden"
                      disabled={loading || deleting}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">No se encontraron órdenes</div>
      )}

      {selectedOrder && (
        <>
          <OrderDetailModal
            visible={detailModalVisible}
            order={selectedOrder}
            onCancel={() => setDetailModalVisible(false)}
          />
          <EditOrderModal
            visible={editModalVisible}
            order={selectedOrder}
            onCancel={() => setEditModalVisible(false)}
            onSuccess={(message) => {
              setEditModalVisible(false);
              onApiResponse({ type: 'success', message });
            }}
            onError={(message) => {
              onApiResponse({ type: 'error', message });
            }}
          />
        </>
      )}

      {/* Modal personalizado para confirmar borrado */}
      <Modal
        title="Confirmar eliminación"
        open={deleteModalVisible}
        onCancel={() => {
          if (!deleting) {
            setDeleteModalVisible(false);
            setOrderToDelete(null);
          }
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            if (!deleting) {
              setDeleteModalVisible(false);
              setOrderToDelete(null);
            }
          }} disabled={deleting}>
            Cancelar
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={deleting}
            onClick={confirmDeleteOrder}
          >
            Eliminar
          </Button>,
        ]}
        maskClosable={!deleting}
        closable={!deleting}
      >
        <p>¿Está seguro que desea eliminar esta orden? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
};

export default OrdersTable;
