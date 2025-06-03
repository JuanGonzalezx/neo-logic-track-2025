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
    <div className={`dl-assignment-drawer ${isOpen ? 'open' : ''}`}>
      <div className="dl-drawer-backdrop" onClick={onClose}></div>
      <div className="dl-drawer-content">
        <div className="dl-drawer-header">
          <h2>Asignar pedido</h2>
          <button className="dl-close-button" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        
        <div className="dl-worker-summary">
          <div className="dl-worker-avatar">
            <User size={32} />
          </div>
          <div className="dl-worker-info">
            <h3>{worker.nombre}</h3>
            <p>{worker.email}</p>
            <div className="dl-worker-details">
              <div className="dl-detail-item">
                <Phone size={14} />
                <span>{worker.telefono || 'No disponible'}</span>
              </div>
              <div className="dl-detail-item">
                <MapPin size={14} />
                <span>{worker.ciudad || 'No especificada'}</span>
              </div>
            </div>
            <div className="dl-order-badges">
              <div className="dl-badge">
                <Package size={14} />
                <span>Pendientes: {worker.pedidosPendientes}</span>
              </div>
              <div className="dl-badge">
                <Calendar size={14} />
                <span>Hoy: {worker.pedidosHoy}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dl-drawer-divider"></div>
        
        <div className="dl-orders-section">
          <h3>Pedidos disponibles</h3>
          
          {isLoading ? (
            <div className="dl-loading-orders">
              <div className="dl-spinner"></div>
              <span>Cargando pedidos...</span>
            </div>
          ) : (
            <>
              {filteredOrders.length === 0 ? (
                <div className="dl-no-orders">
                  <ShoppingBag size={32} />
                  <p>No hay pedidos disponibles para asignar</p>
                </div>
              ) : (
                <div className="dl-orders-list">
                  {filteredOrders.map(order => {
                    const orderDate = order.fechaEntrega || order.fecha_entrega || 
                      (order.creation_date && order.creation_date.split('T')[0]);
                    const isTodayOrder = isToday(orderDate);
                    
                    return (
                      <div 
                        key={order.id}
                        className={`dl-order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                        onClick={() => handleSelectOrder(order)}
                      >
                        <div className="dl-order-header">
                          <div className="dl-order-id">Pedido #{order.id}</div>
                          {isTodayOrder && (
                            <div className="dl-today-badge">HOY</div>
                          )}
                        </div>
                        
                        <div className="dl-order-details">
                          <div className="dl-detail-row">
                            <User size={14} />
                            <span>{order.customer_name || 'Cliente no especificado'}</span>
                          </div>
                          
                          <div className="dl-detail-row">
                            <MapPin size={14} />
                            <span>{order.delivery_address || 'Dirección no especificada'}</span>
                          </div>
                          
                          <div className="dl-detail-row">
                            <Clock size={14} />
                            <span>Fecha: {formatDate(orderDate)}</span>
                          </div>
                          
                          {order.id_almacen && (
                            <div className="dl-detail-row">
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
        
        <div className="dl-drawer-actions">
          <button className="dl-cancel-button" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="dl-assign-button"
            onClick={handleAssign}
            disabled={!selectedOrder}
          >
            <Truck size={16} />
            <span>Asignar pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};