import React, { useState, useEffect } from "react";
import { warehouseAPI } from "../../../api/warehouse";
// import { getStockByWarehouseId, addStock, updateStock } from "../../api/stock";
import { productAPI  } from "../../../api/product";
import { Alert, Spin, Modal, Button, Collapse } from "antd";
import { DownOutlined, RightOutlined, PlusOutlined } from "@ant-design/icons";
import "./Warehouse.css";

const { Panel } = Collapse;

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState({});
  const [expandedWarehouses, setExpandedWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isStockModalVisible, setStockModalVisible] = useState(false);
  const [stockModalMode, setStockModalMode] = useState("add"); // add or edit
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [currentStockItem, setCurrentStockItem] = useState(null);
  const [stockFormData, setStockFormData] = useState({
    id_producto: "",
    cantidad_stock: "",
    nivel_reorden: "",
    ultima_reposicion: new Date().toISOString().split("T")[0],
    fecha_vencimiento: ""
  });
  const [stockFormErrors, setStockFormErrors] = useState({});
  const [availableProducts, setAvailableProducts] = useState([]);
  const [submittingStock, setSubmittingStock] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await warehouseAPI.getAllWarehouses();
        console.log("Response:", response);
        if (response.status === 200) {
            console.log("Warehouses:", response.data);
          setWarehouses(response.data);
          console.log("Warehouses:", warehouses);
        } else {
          setApiResponse({ type: "error", message: "Error loading warehouses" });
        }
      } catch (error) {
        setApiResponse({ type: "error", message: "Connection error" });
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAllProducts();
        if (response.status === 200) {
          setAvailableProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchWarehouses();
    fetchProducts();
  }, []);

  const fetchWarehouseStock = async (warehouseId) => {
    try {
      const response = await getStockByWarehouseId(warehouseId);
      if (response.status === 200) {
        setWarehouseStock(prev => ({
          ...prev,
          [warehouseId]: response.data
        }));
      }
    } catch (error) {
      console.error(`Error fetching stock for warehouse ${warehouseId}:`, error);
    }
  };

  const handleWarehouseExpand = (warehouseId) => {
    if (expandedWarehouses.includes(warehouseId)) {
      setExpandedWarehouses(expandedWarehouses.filter(id => id !== warehouseId));
    } else {
      setExpandedWarehouses([...expandedWarehouses, warehouseId]);
      
      // Fetch stock if not already loaded
      if (!warehouseStock[warehouseId]) {
        fetchWarehouseStock(warehouseId);
      }
    }
  };

  const openAddStockModal = (warehouse) => {
    setCurrentWarehouse(warehouse);
    setCurrentStockItem(null);
    setStockModalMode("add");
    setStockFormData({
      id_producto: availableProducts.length > 0 ? availableProducts[0].id_producto : "",
      cantidad_stock: "",
      nivel_reorden: "",
      ultima_reposicion: new Date().toISOString().split("T")[0],
      fecha_vencimiento: ""
    });
    setStockFormErrors({});
    setStockModalVisible(true);
  };

  const openEditStockModal = (warehouse, stockItem) => {
    setCurrentWarehouse(warehouse);
    setCurrentStockItem(stockItem);
    setStockModalMode("edit");
    
    const formattedLastRestocked = new Date(stockItem.ultima_reposicion)
      .toISOString().split("T")[0];
    
    const formattedExpiryDate = stockItem.fecha_vencimiento 
      ? new Date(stockItem.fecha_vencimiento).toISOString().split("T")[0] 
      : "";
    
    setStockFormData({
      id_producto: stockItem.id_producto,
      cantidad_stock: stockItem.cantidad_stock.toString(),
      nivel_reorden: stockItem.nivel_reorden.toString(),
      ultima_reposicion: formattedLastRestocked,
      fecha_vencimiento: formattedExpiryDate
    });
    
    setStockFormErrors({});
    setStockModalVisible(true);
  };

  const handleStockFormChange = (e) => {
    const { name, value } = e.target;
    setStockFormData(prev => ({ ...prev, [name]: value }));
    
    if (stockFormErrors[name]) {
      setStockFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateStockForm = () => {
    const errors = {};
    
    if (!stockFormData.id_producto) {
      errors.id_producto = "Product is required";
    }
    
    if (!stockFormData.cantidad_stock) {
      errors.cantidad_stock = "Stock quantity is required";
    } else if (isNaN(stockFormData.cantidad_stock) || parseInt(stockFormData.cantidad_stock) < 0) {
      errors.cantidad_stock = "Stock quantity must be a positive number";
    }
    
    if (!stockFormData.nivel_reorden) {
      errors.nivel_reorden = "Reorder level is required";
    } else if (isNaN(stockFormData.nivel_reorden) || parseInt(stockFormData.nivel_reorden) < 0) {
      errors.nivel_reorden = "Reorder level must be a positive number";
    }
    
    if (!stockFormData.ultima_reposicion) {
      errors.ultima_reposicion = "Last restocked date is required";
    }
    
    setStockFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStockSubmit = async () => {
    if (!validateStockForm()) return;
    
    setSubmittingStock(true);
    try {
      const payload = {
        id_producto: stockFormData.id_producto,
        id_almacen: currentWarehouse.id_almacen,
        cantidad_stock: parseInt(stockFormData.cantidad_stock),
        nivel_reorden: parseInt(stockFormData.nivel_reorden),
        ultima_reposicion: stockFormData.ultima_reposicion,
        fecha_vencimiento: stockFormData.fecha_vencimiento || null
      };
      
      let response;
      if (stockModalMode === "add") {
        response = await addStock(payload);
      } else {
        response = await updateStock(currentStockItem.id, payload);
      }
      
      if (response.status === 200 || response.status === 201) {
        setApiResponse({
          type: "success",
          message: stockModalMode === "add" 
            ? "Stock added successfully" 
            : "Stock updated successfully"
        });
        
        // Refresh warehouse stock
        fetchWarehouseStock(currentWarehouse.id_almacen);
        setStockModalVisible(false);
      } else {
        setApiResponse({
          type: "error",
          message: response.message || "Error saving stock information"
        });
      }
    } catch (error) {
      setApiResponse({
        type: "error",
        message: error.message || "Server error"
      });
    } finally {
      setSubmittingStock(false);
    }
  };

  const getProductName = (productId) => {
    const product = availableProducts.find(p => p.id_producto === productId);
    return product ? product.nombre_producto : productId;
  };

  // Filter warehouses by search term
  const filteredWarehouses = warehouses.filter(warehouse =>
  warehouse.nombre_almacen.toLowerCase().includes(searchTerm.toLowerCase()) ||
  `${warehouse.direccion.calle}, ${warehouse.direccion.ciudad.nombre}, ${warehouse.direccion.ciudad.departamento.nombre}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);

  if (loading) {
    return (
      <div className="warehouse-list-container">
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
            placeholder="Search warehouses..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="warehouses-list">
        {filteredWarehouses.length > 0 ? (
          filteredWarehouses.map(warehouse => (
            <div className="warehouse-item" key={warehouse.id_almacen}>
              <div 
                className="warehouse-header"
                onClick={() => handleWarehouseExpand(warehouse.id_almacen)}
              >
                <div className="warehouse-info">
                  {expandedWarehouses.includes(warehouse.id_almacen) ? (
                    <DownOutlined className="expand-icon" />
                  ) : (
                    <RightOutlined className="expand-icon" />
                  )}
                  <h3>{warehouse.nombre_almacen}</h3>
                  <span className="warehouse-location">{warehouse.direccion.calle}, {warehouse.direccion.ciudad.nombre}, {warehouse.direccion.ciudad.departamento.nombre}</span>
                </div>
                <button
                  className="button button-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddStockModal(warehouse);
                  }}
                >
                  <PlusOutlined /> Add Product
                </button>
              </div>
              
              {expandedWarehouses.includes(warehouse.id_almacen) && (
                <div className="warehouse-stock">
                  {warehouseStock[warehouse.id_almacen] ? (
                    warehouseStock[warehouse.id_almacen].length > 0 ? (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Stock Quantity</th>
                            <th>Reorder Level</th>
                            <th>Last Restocked</th>
                            <th>Expiry Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {warehouseStock[warehouse.id_almacen].map(stock => (
                            <tr key={stock.id}>
                              <td>{getProductName(stock.id_producto)}</td>
                              <td>
                                <span className={
                                  stock.cantidad_stock <= stock.nivel_reorden 
                                    ? "low-stock" 
                                    : ""
                                }>
                                  {stock.cantidad_stock}
                                </span>
                              </td>
                              <td>{stock.nivel_reorden}</td>
                              <td>{new Date(stock.ultima_reposicion).toLocaleDateString()}</td>
                              <td>
                                {stock.fecha_vencimiento 
                                  ? new Date(stock.fecha_vencimiento).toLocaleDateString() 
                                  : "—"}
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    className="action-button edit"
                                    onClick={() => openEditStockModal(warehouse, stock)}
                                  >
                                    <span className="edit-icon"></span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="no-results">No products in this warehouse</div>
                    )
                  ) : (
                    <div className="loading-stock">
                      <Spin size="small" /> Loading inventory...
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">No warehouses found</div>
        )}
      </div>

      {/* Stock Add/Edit Modal */}
      <Modal
        title={stockModalMode === "add" ? "Add Product to Warehouse" : "Edit Stock Information"}
        open={isStockModalVisible}
        onCancel={() => setStockModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setStockModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            onClick={handleStockSubmit}
            loading={submittingStock}
          >
            {stockModalMode === "add" ? "Add" : "Update"}
          </Button>
        ]}
      >
        {currentWarehouse && (
          <div className="stock-form">
            <div className="form-group">
              <label>Product</label>
              <select
                name="id_producto"
                value={stockFormData.id_producto}
                onChange={handleStockFormChange}
                className={stockFormErrors.id_producto ? "input-error" : ""}
                disabled={stockModalMode === "edit"}
              >
                <option value="">Select a product</option>
                {availableProducts.map(product => (
                  <option key={product.id_producto} value={product.id_producto}>
                    {product.nombre_producto}
                  </option>
                ))}
              </select>
              {stockFormErrors.id_producto && (
                <span className="error-message">{stockFormErrors.id_producto}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  name="cantidad_stock"
                  value={stockFormData.cantidad_stock}
                  onChange={handleStockFormChange}
                  className={stockFormErrors.cantidad_stock ? "input-error" : ""}
                />
                {stockFormErrors.cantidad_stock && (
                  <span className="error-message">{stockFormErrors.cantidad_stock}</span>
                )}
              </div>

              <div className="form-group">
                <label>Reorder Level</label>
                <input
                  type="number"
                  name="nivel_reorden"
                  value={stockFormData.nivel_reorden}
                  onChange={handleStockFormChange}
                  className={stockFormErrors.nivel_reorden ? "input-error" : ""}
                />
                {stockFormErrors.nivel_reorden && (
                  <span className="error-message">{stockFormErrors.nivel_reorden}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Last Restocked Date</label>
                <input
                  type="date"
                  name="ultima_reposicion"
                  value={stockFormData.ultima_reposicion}
                  onChange={handleStockFormChange}
                  className={stockFormErrors.ultima_reposicion ? "input-error" : ""}
                />
                {stockFormErrors.ultima_reposicion && (
                  <span className="error-message">{stockFormErrors.ultima_reposicion}</span>
                )}
              </div>

              <div className="form-group">
                <label>Expiry Date (Optional)</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={stockFormData.fecha_vencimiento}
                  onChange={handleStockFormChange}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WarehouseList;