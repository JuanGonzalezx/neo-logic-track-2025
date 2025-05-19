import React, { useState } from 'react';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { Modal, Spin } from 'antd';
import { orderAPI } from '../../../api/order';
import OrderDetailModal from './OrderDetailModal';
import EditOrderModal from './EditOrderModal';

const OrdersTable = ({ orders, onSort, sortField, sortDirection, onApiResponse }) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const showDetailModal = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const showEditModal = (order) => {
    setSelectedOrder(order);
    setEditModalVisible(true);
  };

  const handleDeleteOrder = (order) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this order?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await orderAPI.deleteOrder(order.id);
          if (response.status === 200) {
            onApiResponse({ 
              type: 'success', 
              message: 'Order deleted successfully' 
            });
          } else {
            onApiResponse({ 
              type: 'error', 
              message: response.message || 'Error deleting order' 
            });
          }
        } catch (error) {
          onApiResponse({ 
            type: 'error', 
            message: error.message || 'Server error' 
          });
        } finally {
          setLoading(false);
        }
      }
    });
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
        <Spin tip="Processing..." />
      </div>
    );
  }

  return (
    <div className="table-container">
      {orders.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => onSort('id')}>
                Order ID {getSortIcon('id')}
              </th>
              <th onClick={() => onSort('creation_date')}>
                Date {getSortIcon('creation_date')}
              </th>
              <th>Delivery Address</th>
              <th onClick={() => onSort('status')}>
                Status {getSortIcon('status')}
              </th>
              <th>Warehouse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id.substring(0, 8)}...</td>
                <td>{formatDateTime(order.creation_date)}</td>
                <td>{order.delivery_address}</td>
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
                      onClick={() => showDetailModal(order)}
                      title="View order details"
                    >
                      <EyeOutlined />
                    </button>
                    <button
                      className="action-button edit"
                      onClick={() => showEditModal(order)}
                      title="Edit order"
                    >
                      <EditOutlined />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteOrder(order)}
                      title="Delete order"
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
        <div className="no-results">No orders found</div>
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
    </div>
  );
};

export default OrdersTable;