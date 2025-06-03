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
import EditOrderModal from './EditOrderModal';
import { getUserFromToken } from '../../../api/auth';

const OrdersTable = ({ orders, onSort, sortField, sortDirection, onApiResponse }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);


  // Estado para mostrar/ocultar modal de confirmación de borrado
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const userResp = await getUserFromToken({ token });
      if (userResp && userResp.id && userResp.role?.id) {
        setUserId(userResp.id);
        setRoleId(userResp.role.id);
      }
    };
    fetchUser();
  }, []);

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

  const goToTrackingPage = (order) => {
    navigate(`/dashboard/inventory/orders/${order.id}/tracking`);
  }

  // Filtrar órdenes si es repartidor
  let filteredOrders = orders;
  if (roleId === '68146313ef7752d9d59866da' && userId) {
    filteredOrders = orders.filter(order => order.delivery_id === userId);
  }

  return (
    <div className="table-container">
      {filteredOrders.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => onSort('id')}>
                ID de Orden {getSortIcon('id')}
              </th>
              <th onClick={() => onSort('creation_date')}>
                Fecha {getSortIcon('creation_date')}
              </th>
              <th>Dirección de Entrega</th>
              <th>ID de Repartidor</th>
              <th onClick={() => onSort('status')}>
                Status {getSortIcon('status')}
              </th>
              {/* Ocultar almacén si es repartidor */}
              {roleId !== '68146313ef7752d9d59866da' && <th>Warehouse</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id.substring(0, 8)}...</td>
                <td>{formatDateTime(order.creation_date)}</td>
                <td>{order.delivery_address}</td>
                <td>{order.delivery_id == "00000000-0000-0000-0000-000000000000" ? "Sin asignar Delivery aun" : order.delivery_id}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                {/* Ocultar almacén si es repartidor */}
                {roleId !== '68146313ef7752d9d59866da' && <td>{order.id_almacen}</td>}
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
                      disabled={deleting}
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

      {/* Modal personalizado para confirmar borrado */}
      <Modal
        title="Confirm Delete"
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
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={deleting}
            onClick={confirmDeleteOrder}
          >
            Delete
          </Button>,
        ]}
        maskClosable={!deleting}
        closable={!deleting}
      >
        <p>Are you sure you want to delete this order? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default OrdersTable;
