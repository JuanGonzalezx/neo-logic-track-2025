import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../../../api/product";
import { Alert, Spin, Modal, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Package, Plus } from "lucide-react";
import "./Product.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // States for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // States for deletion
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        console.log("Fetching categories...");
        console.log(await productAPI.getAllCategories())
        const categoriesResponse = await productAPI.getAllCategories();
        if (categoriesResponse.status === 200) {
          setCategories(categoriesResponse.data);
        }
        console.log(categoriesResponse, "categoriesResponse");
        // Fetch products
        const productsResponse = await productAPI.getAllProducts();
        if (productsResponse.status === 200) {
          const processedProducts = productsResponse.data.map(p => ({
            ...p,
            categoryName: getCategoryName(p.categoria_id, categoriesResponse.data),
          }));
          setProducts(processedProducts);
        } else {
          setApiResponse({ type: "error", message: "Error loading products" });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiResponse({ type: "error", message: "Connection error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Load permissions from local storage
    const storedPermissions = JSON.parse(localStorage.getItem('permissions')) || [];
    setPermissions(storedPermissions);
  }, []);

  const getCategoryName = (categoryId, categories) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nombre : 'Uncategorized';
  };

  const hasPermission = (permissionId) => permissions.includes(permissionId);

  const handleDeleteProduct = async () => {
    setDeleting(true);
    try {
      console.log("a");
      const response = await productAPI.deleteProduct(deletingProductId);
      console.log(response);
      if (response.status === 200) {
        setApiResponse({
          type: "success",
          message: "Product deleted successfully"
        });
        setProducts(products.filter(p => p.id_producto !== deletingProductId));
      } else {
        setApiResponse({
          type: "error",
          message: response.message || "Error deleting product"
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setApiResponse({ type: "error", message: "Connection error" });
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  // Filtering and pagination
  const filteredProducts = products.filter(p => {
    const searchMatch = [p.nombre_producto, p.descripcion, p.sku].some(field =>
      field && field.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const categoryMatch = !filterCategory || p.categoria_id === filterCategory;
    const statusMatch = !filterStatus || (filterStatus === "true" ? p.status : !p.status);
    
    return searchMatch && categoryMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="product-list-container">
        <Spin tip="Loading products..." />
      </div>
    );
  }

  return (
    <div className="product-list-container">
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
        <h1>Products Management</h1>
        <div className="header-actions">
          <Link
            to="/dashboard/inventory/add"
            className="button button-primary"
          >
            <span className="button-icon add" /> New Product
          </Link>
          <Link
            to="/dashboard/products/import"
            className="button button-secondary"
            style={{ marginLeft: 8 }}
          >
            <span className="button-icon" /> Bulk Import
          </Link>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search products..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map(product => (
                <tr key={product.id_producto}>
                  <td>{product.sku}</td>
                  <td>{product.nombre_producto}</td>
                  <td>{product.categoryName}</td>
                  <td>${product.precio_unitario.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${product.status ? 'active' : 'inactive'}`}>
                      {product.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/dashboard/products/view/${product.id_producto}`}>
                        <button className="action-button view">
                          <span className="view-icon"></span>
                        </button>
                      </Link>
                      <Link to={`/dashboard/products/edit/${product.id_producto}`}>
                        <button className="action-button edit">
                          <span className="edit-icon"></span>
                        </button>
                      </Link>
                      <button
                        className="action-button delete"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          setDeletingProductId(product.id_producto);
                          setDeleteModalVisible(true);
                        }}
                      >
                        <span className="delete-icon"></span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredProducts.length > 0 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="pagination-button"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={isDeleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDeleteProduct}
        okText="Delete"
        cancelText="Cancel"
        confirmLoading={deleting}
      >
        <p>Are you sure you want to delete this product?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ProductList;