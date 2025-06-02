import React, { useState, useEffect } from 'react';
import { DeliveryWorkerCard } from './DeliveryWorkerCard';
import { AssignmentDrawer } from './AssignementDrawer';
import { ReportMenu } from './ReportMenu';
import { Filters } from './Filters';
import { Loading } from './Loading';
import { getAllUsers } from '../../../../api/user';
import { orderAPI } from '../../../../api/order';
import { getAllCiudades } from '../../../../api/ciudad';
import { Search, RefreshCw } from 'lucide-react';

// Constants
const REPARTIDOR_ROLE_ID = '68146313ef7752d9d59866da';

/**
 * Component for displaying and managing delivery workers
 */
export const DeliveryWorkerList = () => {
  // State for workers and filtering
  const [repartidores, setRepartidores] = useState([]);
  const [filteredRepartidores, setFilteredRepartidores] = useState([]);
  const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
  const [selectedRepartidor, setSelectedRepartidor] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [reportMenuVisible, setReportMenuVisible] = useState(false);
  const [reportWorker, setReportWorker] = useState(null);
  
  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = window.innerWidth <= 640 ? 4 : 8;

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch cities
        const ciudadesRes = await getAllCiudades();
        let ciudadesData = [];
        if (ciudadesRes.status === 200 && Array.isArray(ciudadesRes.data)) {
          ciudadesData = ciudadesRes.data;
        }
        
        // Fetch orders
        const ordersRes = await orderAPI.getAllOrders();
        let ordersData = [];
        if (ordersRes.status === 200 && Array.isArray(ordersRes.data)) {
          ordersData = ordersRes.data.filter(o => o.status !== 'CANCELLED');
          setPedidosDisponibles(ordersData);
        }
        
        // Fetch users with delivery role
        const usersRes = await getAllUsers();
        if (usersRes.status === 200 && Array.isArray(usersRes.data)) {
          const today = new Date().toISOString().split('T')[0];
          
          // Filter users with delivery role and map data
          const deliveryWorkers = usersRes.data
            .filter(u => u.roleId === REPARTIDOR_ROLE_ID)
            .map(u => {
              // Find city name
              let cityName = '';
              if (u.ciudadId) {
                const city = ciudadesData.find(c => c.id === u.ciudadId || c._id === u.ciudadId);
                cityName = city ? city.nombre : '';
              } else if (u.ciudad && typeof u.ciudad === 'object') {
                cityName = u.ciudad.nombre;
              } else if (typeof u.ciudad === 'string') {
                cityName = u.ciudad;
              }
              
              // Calculate pending orders and today's orders
              const pendingOrders = ordersData.filter(o => 
                o.delivery_id === u.id && 
                o.status !== 'DELIVERED'
              );
              
              const todayOrders = pendingOrders.filter(o => {
                const deliveryDate = o.fechaEntrega || o.fecha_entrega || 
                  (o.creation_date && o.creation_date.split('T')[0]) || '';
                return deliveryDate === today;
              });
              
              return {
                id: u.id,
                nombre: u.fullname,
                email: u.email,
                ciudad: cityName,
                telefono: u.number || '',
                status: u.status,
                activo: u.status === 'ACTIVE',
                pedidosPendientes: pendingOrders.length,
                pedidosHoy: todayOrders.length
              };
            });
            
          setRepartidores(deliveryWorkers);
          setFilteredRepartidores(deliveryWorkers);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        showNotification('error', 'Error cargando datos', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters when filter values change
  useEffect(() => {
    let filtered = [...repartidores];
    
    // Filter by name
    if (nameFilter) {
      filtered = filtered.filter(worker => 
        worker.nombre.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    
    // Filter by city
    if (cityFilter) {
      filtered = filtered.filter(worker => 
        worker.ciudad.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== null) {
      filtered = filtered.filter(worker => worker.activo === statusFilter);
    }
    
    setFilteredRepartidores(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [repartidores, nameFilter, cityFilter, statusFilter]);
  
  // Handle opening the assignment drawer
  const handleOpenAssignDrawer = (worker) => {
    if (!worker.activo) {
      showNotification('warning', 'Repartidor Inactivo', 'No se pueden asignar pedidos a repartidores inactivos.');
      return;
    }
    
    setSelectedRepartidor(worker);
    setDrawerVisible(true);
    setPedidoSeleccionado(null);
  };
  
  // Handle opening the report menu
  const handleOpenReportMenu = (worker) => {
    setReportWorker(worker);
    setReportMenuVisible(true);
  };
  
  // Handle toggling worker status
  const handleToggleStatus = async (worker) => {
    try {
      // In a real app, this would call an API to update the worker's status
      const updatedRepartidores = repartidores.map(r => {
        if (r.id === worker.id) {
          return { ...r, activo: !r.activo };
        }
        return r;
      });
      
      setRepartidores(updatedRepartidores);
      
      showNotification(
        'success', 
        'Estado Actualizado', 
        `${worker.nombre} ahora está ${!worker.activo ? 'activo' : 'inactivo'}.`
      );
    } catch (error) {
      showNotification('error', 'Error', 'No se pudo actualizar el estado del repartidor.');
    }
  };
  
  // Handle assigning an order to a worker
  const handleAssignOrder = async (order) => {
    try {
      if (!selectedRepartidor || !order) {
        showNotification('error', 'Error', 'Selecciona un pedido para asignar.');
        return;
      }
      
      // Update order in the backend
      const updateResult = await orderAPI.updateOrder(order.id, {
        delivery_id: selectedRepartidor.id,
        delivery_name: selectedRepartidor.nombre,
        delivery_email: selectedRepartidor.email,
        status: 'ASSIGNED'
      });
      
      if (updateResult.status === 200 || updateResult.status === 201) {
        // Refresh orders data
        const ordersRes = await orderAPI.getAllOrders();
        if (ordersRes.status === 200 && Array.isArray(ordersRes.data)) {
          const updatedOrders = ordersRes.data.filter(o => o.status !== 'CANCELLED');
          setPedidosDisponibles(updatedOrders);
          
          // Update worker's pending orders count
          const updatedRepartidores = repartidores.map(r => {
            if (r.id === selectedRepartidor.id) {
              const isToday = new Date().toISOString().split('T')[0] === 
                (order.fechaEntrega || order.fecha_entrega || 
                (order.creation_date && order.creation_date.split('T')[0]));
                
              return {
                ...r,
                pedidosPendientes: r.pedidosPendientes + 1,
                pedidosHoy: isToday ? r.pedidosHoy + 1 : r.pedidosHoy
              };
            }
            return r;
          });
          
          setRepartidores(updatedRepartidores);
        }
        
        setDrawerVisible(false);
        showNotification(
          'success', 
          'Pedido Asignado', 
          `Pedido asignado a ${selectedRepartidor.nombre} correctamente.`
        );
      } else {
        showNotification(
          'error', 
          'Error al asignar pedido', 
          updateResult.message || 'No se pudo asignar el pedido.'
        );
      }
    } catch (error) {
      showNotification('error', 'Error', error.message || 'No se pudo asignar el pedido.');
    }
  };
  
  // Show notification (in a real app, this would use a notification system)
  const showNotification = (type, title, message) => {
    // This is a simple implementation - in a real app, you would use
    // a notification component or library
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification notification-${type}`;
    notificationEl.innerHTML = `
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    `;
    
    document.body.appendChild(notificationEl);
    
    setTimeout(() => {
      notificationEl.classList.add('show');
      
      setTimeout(() => {
        notificationEl.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notificationEl);
        }, 300);
      }, 3000);
    }, 100);
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setNameFilter("");
    setCityFilter("");
    setStatusFilter(null);
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredRepartidores.length / itemsPerPage);
  const paginatedWorkers = filteredRepartidores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="delivery-workers-container">
      <div className="delivery-workers-header">
        <h1>Gestión de Repartidores</h1>
        <button 
          className="refresh-button"
          onClick={handleResetFilters}
          aria-label="Resetear filtros"
        >
          <RefreshCw size={16} />
          <span>Resetear Filtros</span>
        </button>
      </div>
      
      <Filters 
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {filteredRepartidores.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron repartidores con los filtros seleccionados</p>
            </div>
          ) : (
            <>
              <div className="delivery-workers-grid">
                {paginatedWorkers.map(worker => (
                  <DeliveryWorkerCard 
                    key={worker.id}
                    worker={worker}
                    onAssign={() => handleOpenAssignDrawer(worker)}
                    onToggleStatus={() => handleToggleStatus(worker)}
                    onGenerateReport={() => handleOpenReportMenu(worker)}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Anterior
                  </button>
                  <span className="pagination-info">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button 
                    className="pagination-button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {/* Assignment Drawer */}
      {selectedRepartidor && (
        <AssignmentDrawer 
          isOpen={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          worker={selectedRepartidor}
          orders={pedidosDisponibles}
          selectedOrder={pedidoSeleccionado}
          setSelectedOrder={setPedidoSeleccionado}
          onAssign={handleAssignOrder}
        />
      )}
      
      {/* Report Menu */}
      {reportWorker && (
        <ReportMenu 
          isOpen={reportMenuVisible}
          onClose={() => setReportMenuVisible(false)}
          worker={reportWorker}
          orders={pedidosDisponibles}
        />
      )}
    </div>
  );
};