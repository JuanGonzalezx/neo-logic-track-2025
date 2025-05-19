import React, { useState, useEffect } from "react";
import { Alert, Spin } from "antd";
import { warehouseAPI } from "../../../api/warehouse";
import { orderAPI } from "../../../api/order";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch warehouses and all orders in parallel
        const [warehousesResponse, ordersResponse] = await Promise.all([
          warehouseAPI.getAllWarehouses(),
          orderAPI.getAllOrders(),
        ]);
        console.log("Warehouses response:", warehousesResponse);
        console.log("Orders response:", ordersResponse);

        if (warehousesResponse.status === 200) {
          setWarehouses(warehousesResponse.data);
        } else {
          setApiResponse({ type: "error", message: "Error loading warehouses" });
        }

        if (ordersResponse.status === 200) {
          setOrders(ordersResponse.data);
        } else {
          setApiResponse({ type: "error", message: "Error loading orders" });
        }
      } catch (error) {
        console.log("Error fetching data:", error);
        setApiResponse({ type: "error", message: "Connection error" });
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
    
    // Auto-hide success messages after 3 seconds
    if (response.type === 'success') {
      setTimeout(() => {
        setApiResponse(null);
      }, 3000);
    }
    
    // Refresh data after successful operations
    if (response.type === 'success') {
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

  // Filter warehouses by search term
  const filteredWarehouses = warehouses.filter(warehouse => {
    const warehouseName = warehouse.nombre_almacen.toLowerCase();
    const addressString = warehouse.direccion 
      ? `${warehouse.direccion.calle || ''}, ${warehouse.direccion.ciudad?.nombre || ''}, ${warehouse.direccion.ciudad?.departamento?.nombre || ''}`.toLowerCase()
      : '';
    
    const searchLower = searchTerm.toLowerCase();
    return warehouseName.includes(searchLower) || addressString.includes(searchLower);
  });

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    const orderId = order.id.toLowerCase();
    const address = order.delivery_address.toLowerCase();
    const status = order.status.toLowerCase();
    
    
    const searchLower = searchTerm.toLowerCase();
    const warehouseId = order.id_almacen?.toLowerCase() || "";
    return orderId.includes(searchLower) || 
           address.includes(searchLower) ||
    warehouseId.includes(searchLower);
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === "creation_date") {
      const dateA = new Date(a.creation_date);
      const dateB = new Date(b.creation_date);
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    // Default string comparison for other fields
    const valueA = a[sortField] || "";
    const valueB = b[sortField] || "";
    return sortDirection === "asc" 
      ? valueA.localeCompare(valueB) 
      : valueB.localeCompare(valueA);
  });

  if (loading) {
    return (
      <div className="order-list-container">
        <div className="page-header">
          <h1>Order Management</h1>
        </div>
        <div className="loading-container">
          <Spin tip="Loading data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      {apiResponse && (
        <Alert
          type={apiResponse.type}
          message={apiResponse.message}
          showIcon
          closable
          onClose={() => setApiResponse(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <div className="page-header">
        <h1>Order Management</h1>
      </div>

      <div className="tabs-container">
        <div 
          className={`tab ${viewMode === "warehouses" ? "active" : ""}`}
          onClick={() => setViewMode("warehouses")}
        >
          Warehouses
        </div>
        <div 
          className={`tab ${viewMode === "orders" ? "active" : ""}`}
          onClick={() => setViewMode("orders")}
        >
          All Orders
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder={viewMode === "warehouses" 
              ? "Search warehouses by name or location..." 
              : "Search orders by ID, address, or status..."}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {viewMode === "warehouses" ? (
        <div className="warehouses-list">
          {filteredWarehouses.length > 0 ? (
            filteredWarehouses.map(warehouse => (
              <WarehouseOrderItem 
                key={warehouse.id_almacen}
                warehouse={warehouse}
                onApiResponse={handleApiResponse}
              />
            ))
          ) : (
            <div className="no-results">
              {searchTerm 
                ? `No warehouses found matching "${searchTerm}"` 
                : "No warehouses available"}
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