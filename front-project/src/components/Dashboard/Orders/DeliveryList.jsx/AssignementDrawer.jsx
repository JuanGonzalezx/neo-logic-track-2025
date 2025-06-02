import React, { useState, useEffect } from 'react';
import { 
  User, Phone, MapPin, Package, Calendar, X,
  Clock, Truck, ShoppingBag, MapPinOff
} from 'lucide-react';
import { warehouseAPI } from '../../../../api/warehouse';
import { getUserFromToken } from '../../../../api/auth';

/**
 * Drawer component for assigning orders to delivery workers
 */
export const AssignmentDrawer = ({ 
  isOpen, 
  onClose, 
  worker, 
  orders,
  selectedOrder,
  setSelectedOrder,
  onAssign
}) => {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedUserId, setLoggedUserId] = useState(null);

  // Obtener el usuario logueado al abrir el Drawer
  useEffect(() => {
    async function fetchLoggedUserId() {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await getUserFromToken({ token });
        if (res && res.id) setLoggedUserId(res.id);
      }
    }
    if (isOpen) fetchLoggedUserId();
  }, [isOpen]);

  // Filter orders based on logged user (no el worker seleccionado)
  useEffect(() => {
    async function filterOrders() {
      if (isOpen && worker && loggedUserId) {
        setIsLoading(true);
        let allowedWarehouses = [];
        let isAdmin = false;
        // Detectar si el usuario es admin (por rol)
        if (worker.role && typeof worker.role === 'string') {
          isAdmin = worker.role.toLowerCase().includes('admin');
        } else if (worker.role && worker.role.name) {
          isAdmin = worker.role.name.toLowerCase().includes('admin');
        }
        // Obtener almacenes donde el usuario logueado es gerente o despachador
        let allWarehouses = [];
        if (!isAdmin) {
          const res = await warehouseAPI.getAllWarehouses();
          if (res.status === 200 && Array.isArray(res.data)) {
            allWarehouses = res.data;
            allowedWarehouses = allWarehouses
              .filter(a => String(a.gerenteId).trim() === String(loggedUserId).trim() || String(a.despachadorId).trim() === String(loggedUserId).trim())
              .map(a => a.id_almacen || a.id);
          }
        }
        // Si no es admin y no tiene almacenes, no mostrar pedidos
        if (!isAdmin && allowedWarehouses.length === 0) {
          setFilteredOrders([]);
          setIsLoading(false);
          return;
        }
        // Get PENDING orders que no estén asignadas y solo de almacenes permitidos (o todos si admin)
        const availableOrders = orders.filter(order => 
          order.status === 'PENDING' && 
          (!order.delivery_id || order.delivery_id === '00000000-0000-0000-0000-000000000000') &&
          (isAdmin || allowedWarehouses.includes(order.id_almacen))
        );
        setFilteredOrders(availableOrders);
        setIsLoading(false);
      }
    }
    filterOrders();
  }, [isOpen, worker, orders, loggedUserId]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Check if a date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const orderDate = new Date(dateString).toISOString().split('T')[0];
    
    return today === orderDate;
  };
  
  // Handle order selection
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };
  
  // Handle order assignment
  const handleAssign = () => {
    if (!selectedOrder) return;
    onAssign(selectedOrder);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={`assignment-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <div className="drawer-content">
        <div className="drawer-header">
          <h2>Asignar Pedido</h2>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        
        <div className="worker-summary">
          <div className="worker-avatar">
            <User size={32} />
          </div>
          <div className="worker-info">
            <h3>{worker.nombre}</h3>
            <p>{worker.email}</p>
            <div className="worker-details">
              <div className="detail-item">
                <Phone size={14} />
                <span>{worker.telefono || 'No disponible'}</span>
              </div>
              <div className="detail-item">
                <MapPin size={14} />
                <span>{worker.ciudad || 'No especificada'}</span>
              </div>
            </div>
            <div className="order-badges">
              <div className="badge">
                <Package size={14} />
                <span>Pendientes: {worker.pedidosPendientes}</span>
              </div>
              <div className="badge">
                <Calendar size={14} />
                <span>Hoy: {worker.pedidosHoy}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="drawer-divider"></div>
        
        <div className="orders-section">
          <h3>Pedidos Disponibles</h3>
          
          {isLoading ? (
            <div className="loading-orders">
              <div className="spinner"></div>
              <span>Cargando pedidos...</span>
            </div>
          ) : (
            <>
              {filteredOrders.length === 0 ? (
                <div className="no-orders">
                  <ShoppingBag size={32} />
                  <p>No hay pedidos disponibles para asignar</p>
                </div>
              ) : (
                <div className="orders-list">
                  {filteredOrders.map(order => {
                    const orderDate = order.fechaEntrega || order.fecha_entrega || 
                      (order.creation_date && order.creation_date.split('T')[0]);
                    const isTodayOrder = isToday(orderDate);
                    
                    return (
                      <div 
                        key={order.id}
                        className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                        onClick={() => handleSelectOrder(order)}
                      >
                        <div className="order-header">
                          <div className="order-id">Pedido #{order.id}</div>
                          {isTodayOrder && (
                            <div className="today-badge">HOY</div>
                          )}
                        </div>
                        
                        <div className="order-details">
                          <div className="detail-row">
                            <User size={14} />
                            <span>{order.customer_name || 'Cliente no especificado'}</span>
                          </div>
                          
                          <div className="detail-row">
                            <MapPin size={14} />
                            <span>{order.delivery_address || 'Dirección no especificada'}</span>
                          </div>
                          
                          <div className="detail-row">
                            <Clock size={14} />
                            <span>Fecha: {formatDate(orderDate)}</span>
                          </div>
                          
                          {order.id_almacen && (
                            <div className="detail-row">
                              <Truck size={14} />
                              <span>Almacén: {order.id_almacen}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="drawer-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="assign-button"
            onClick={handleAssign}
            disabled={!selectedOrder}
          >
            <Truck size={16} />
            <span>Asignar Pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};