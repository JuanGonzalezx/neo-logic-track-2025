import React, { useState, useEffect } from "react";
import { Alert, Spin } from "antd";
import { warehouseAPI } from "../../../api/warehouse";
import { orderAPI } from "../../../api/order";
import { getUserFromToken } from "../../../api/auth";
import WarehouseOrderItem from "./WarehouseOrderItem";
import OrdersTable from "./OrdersTable";
import "./orders.css";

const OrderList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("warehouses"); // warehouses or orders
  const [sortField, setSortField] = useState("creation_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserIdAndRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getUserFromToken({ token });
          if (res) {
            setUserId(res.id);
            setUserRole(res.role?.name || null);
          }
        } catch {
          // Swallow error
        }
      }
    };
    fetchUserIdAndRole();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch warehouses and all orders in parallel
        const [warehousesResponse, ordersResponse] = await Promise.all([
          warehouseAPI.getAllWarehouses(),
          orderAPI.getAllOrders(),
        ]);

        if (warehousesResponse.status === 200) {
          setWarehouses(warehousesResponse.data);
        } else {
          setApiResponse({ type: "error", message: "Error al cargar los almacenes" });
        }

        if (ordersResponse.status === 200) {
          setOrders(ordersResponse.data);
        } else {
          setApiResponse({ type: "error", message: "Error al cargar las órdenes" });
        }
      } catch (error) {
        setApiResponse({ type: "error", message: "Error de conexión" });
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleApiResponse = (response) => {
    setApiResponse(response);
    if (response.type === "success") {
      setTimeout(() => setApiResponse(null), 3000);
      refreshData();
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const ordersResponse = await orderAPI.getAllOrders();
      if (ordersResponse.status === 200) {
        setOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Si el usuario es repartidor, bloquear la vista de almacenes
  const isRepartidor = userRole && (userRole.toLowerCase() === "repartidor" || userRole === "68146313ef7752d9d59866da");
  // Si es repartidor, forzar el modo de vista a 'orders'
  React.useEffect(() => {
    if (isRepartidor && viewMode !== "orders") {
      setViewMode("orders");
    }
    // eslint-disable-next-line
  }, [isRepartidor]);

  // Filter warehouses by search term
  let filteredWarehouses = warehouses;

  // Only show warehouses associated to gerente/despachador
  if ((userRole === "GERENTE" || userRole === "Despachador") && userId) {
    filteredWarehouses = warehouses.filter(
      (warehouse) =>
        (userRole === "GERENTE" && String(warehouse.gerenteId) === String(userId)) ||
        (userRole === "Despachador" && String(warehouse.despachadorId) === String(userId))
    );
  }

  filteredWarehouses = filteredWarehouses.filter((warehouse) => {
    const warehouseName = warehouse.nombre_almacen.toLowerCase();
    const addressString = warehouse.direccion
      ? `${warehouse.direccion.calle || ""}, ${warehouse.direccion.ciudad?.nombre || ""}, ${warehouse.direccion.ciudad?.departamento?.nombre || ""}`.toLowerCase()
      : "";

    const searchLower = searchTerm.toLowerCase();
    return warehouseName.includes(searchLower) || addressString.includes(searchLower);
  });

  // Filter and sort orders (for "all orders" tab)
  const filteredOrders = orders.filter((order) => {
    const orderId = order.id.toLowerCase();
    const address = order.delivery_address.toLowerCase();
    const warehouseId = order.id_almacen?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    return (
      orderId.includes(searchLower) ||
      address.includes(searchLower) ||
      warehouseId.includes(searchLower)
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === "creation_date") {
      const dateA = new Date(a.creation_date);
      const dateB = new Date(b.creation_date);
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    const valueA = a[sortField] || "";
    const valueB = b[sortField] || "";
    return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });

  if (loading) {
    return (
      <div className="order-list-container">
        <div className="page-header">
          <h1>Gestión de Órdenes</h1>
        </div>
        <div className="loading-container">
          <Spin tip="Cargando datos..." />
        </div>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      {apiResponse && (
        <Alert message={apiResponse?.message} type={apiResponse?.type} showIcon style={{ marginBottom: 16 }} />
      )}

      <div className="page-header">
        <h1>Gestión de Órdenes</h1>
      </div>

      <div className="tabs-container">
        {/* Solo mostrar la pestaña de almacenes si NO es repartidor */}
        {!isRepartidor && (
          <div
            className={`tab ${viewMode === "warehouses" ? "active" : ""}`}
            onClick={() => setViewMode("warehouses")}
          >
            Ver por almacén
          </div>
        )}
        <div
          className={`tab ${viewMode === "orders" ? "active" : ""}`}
          onClick={() => setViewMode("orders")}
        >
          Ver todas las órdenes
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder={
              viewMode === "warehouses"
                ? "Buscar almacenes por nombre o ubicación..."
                : "Buscar por cliente, correo o dirección..."
            }
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Solo mostrar la vista de almacenes si NO es repartidor */}
      {viewMode === "warehouses" && !isRepartidor ? (
        <div className="warehouses-list">
          {filteredWarehouses.length > 0 ? (
            filteredWarehouses.map((warehouse) => {
              // Extraemos sólo las órdenes de ese almacén y ordenamos
              const ordersForWarehouse = orders.filter(
                (order) => order.id_almacen === warehouse.id_almacen
              );
              // Ordenar las órdenes de ese almacén con los mismos criterios globales
              const sortedOrdersForWarehouse = [...ordersForWarehouse].sort((a, b) => {
                if (sortField === "creation_date") {
                  const dateA = new Date(a.creation_date);
                  const dateB = new Date(b.creation_date);
                  return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
                }
                const valueA = a[sortField] || "";
                const valueB = b[sortField] || "";
                return sortDirection === "asc"
                  ? valueA.localeCompare(valueB)
                  : valueB.localeCompare(valueA);
              });

              return (
                <WarehouseOrderItem
                  key={warehouse.id_almacen}
                  warehouse={warehouse}
                  orders={sortedOrdersForWarehouse}
                  onApiResponse={handleApiResponse}
                  onSort={handleSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                />
              );
            })
          ) : (
            <div className="no-results">
              {searchTerm
                ? `No se encontraron almacenes que coincidan con "${searchTerm}"`
                : "No hay almacenes disponibles"}
            </div>
          )}
        </div>
      ) : (
        <OrdersTable
          orders={sortedOrders}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          onApiResponse={handleApiResponse}
        />
      )}
    </div>
  );
};

export default OrderList;
