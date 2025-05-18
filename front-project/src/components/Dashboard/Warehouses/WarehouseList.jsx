import React, { useState, useEffect } from "react";
import { Alert, Spin } from "antd";
import { warehouseAPI } from "../../../api/warehouse";
import { productAPI } from "../../../api/product";
import WarehouseItem from "./WarehouseItem";
import "./warehouse.css";

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
  const filteredWarehouses = warehouses.filter(warehouse => {
    const warehouseName = warehouse.nombre_almacen.toLowerCase();
    const addressString = warehouse.direccion 
      ? `${warehouse.direccion.calle || ''}, ${warehouse.direccion.ciudad?.nombre || ''}, ${warehouse.direccion.ciudad?.departamento?.nombre || ''}`.toLowerCase()
      : '';
    
    const searchLower = searchTerm.toLowerCase();
    return warehouseName.includes(searchLower) || addressString.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="warehouse-list-container">
        <div className="page-header">
          <h1>Warehouse Inventory</h1>
        </div>
        <div className="loading-container">
          <Spin tip="Loading warehouses..." />
        </div>
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
              availableProviders= {availableProviders}
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