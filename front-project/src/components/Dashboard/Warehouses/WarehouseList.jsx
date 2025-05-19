import React, { useState, useEffect } from "react";
import { Alert, Spin } from "antd";
import { warehouseAPI } from "../../../api/warehouse";
import { productAPI } from "../../../api/product";
import { getUserFromToken } from "../../../api/auth";
import WarehouseItem from "./WarehouseItem";
import "./warehouse.css";

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Fetch user ID and role from token in localStorage
    const fetchUserIdAndRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getUserFromToken({ token });
          if (res) {
            setUserId(res.id);
            setUserRole(res.role?.name || null);
          }
        } catch (err) {
          console.error("Error fetching user from token:", err);
        }
      }
    };
    fetchUserIdAndRole();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch warehouses and products in parallel
        const [warehousesResponse, productsResponse, providersResponse] = await Promise.all([
          warehouseAPI.getAllWarehouses(),
          productAPI.getAllProducts(),
          productAPI.getAllProviders(),
        ]);

        if (warehousesResponse.status === 200) {
          setWarehouses(warehousesResponse.data);
        } else {
          setApiResponse({ type: "error", message: "Error loading warehouses" });
        }

        if (productsResponse.status === 200) {
          setAvailableProducts(productsResponse.data);
        } else {
          console.error("Error loading products");
        }
        if (providersResponse.status === 200) {
          setAvailableProviders(providersResponse.data);
        } else {
          console.error("Error loading providers");
        }
      } catch (error) {
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
  };

  // Filter warehouses by search term
  let filteredWarehouses = warehouses;

  // Wait for userId to be loaded before filtering
  if ((userRole === "GERENTE" || userRole === "Despachador") && userId === null) {
    return (
      <div className="warehouse-list-container">
        <div className="page-header">
          <h1>Warehouse Inventory</h1>
        </div>
        <div className="loading-container">
          <Spin tip="Loading user info..." />
        </div>
      </div>
    );
  }
  console.log(userRole);
  console.log(userId);
  // Mostrar solo el almacén asociado si es gerente o despachador
  if ((userRole === "GERENTE" || userRole === "Despachador") && userId) {
    filteredWarehouses = warehouses.filter(warehouse =>
      (userRole === "GERENTE" && String(warehouse.gerenteId) === String(userId)) ||
      (userRole === "Despachador" && String(warehouse.despachadorId) === String(userId))
    );
    // Aplica también el filtro de búsqueda
    filteredWarehouses = filteredWarehouses.filter(warehouse => {
      const warehouseName = warehouse.nombre_almacen.toLowerCase();
      const addressString = warehouse.direccion 
        ? `${warehouse.direccion.calle || ''}, ${warehouse.direccion.ciudad?.nombre || ''}, ${warehouse.direccion.ciudad?.departamento?.nombre || ''}`.toLowerCase()
        : '';
      const searchLower = searchTerm.toLowerCase();
      return warehouseName.includes(searchLower) || addressString.includes(searchLower);
    });
  } else {
    filteredWarehouses = warehouses.filter(warehouse => {
      const warehouseName = warehouse.nombre_almacen.toLowerCase();
      const addressString = warehouse.direccion 
        ? `${warehouse.direccion.calle || ''}, ${warehouse.direccion.ciudad?.nombre || ''}, ${warehouse.direccion.ciudad?.departamento?.nombre || ''}`.toLowerCase()
        : '';
      
      const searchLower = searchTerm.toLowerCase();
      return warehouseName.includes(searchLower) || addressString.includes(searchLower);
    });
  }

  if (loading) {
    return (
      <div className="warehouse-list-container">
        <div className="page-header">
          <h1>Warehouse Inventory</h1>
        </div>
        <div className="loading-container"></div>
          <Spin tip="Loading warehouses..." />
        </div>
    );
  }

  return (
    <div className="warehouse-list-container">
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
        <h1>Warehouse Inventory</h1>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search warehouses by name or location..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="warehouses-list">
        {filteredWarehouses.length > 0 ? (
          filteredWarehouses.map(warehouse => (
            <WarehouseItem 
              key={warehouse.id_almacen}
              warehouse={warehouse}
              availableProducts={availableProducts}
              availableProviders={availableProviders}
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
    </div>
  );
};

export default WarehouseList;