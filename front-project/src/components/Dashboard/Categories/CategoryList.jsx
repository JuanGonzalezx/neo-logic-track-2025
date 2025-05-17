import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { getAllCategories, deleteCategory } from "../../api/category";}
import { categoryApi } from "../../../api/category";
import { Alert, Spin, Modal, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./Category.css";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // States for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // States for deletion
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        if (response.status === 200) {
          setCategories(response.data);
        } else {
          setApiResponse({ type: "error", message: "Error loading categories" });
        }
      } catch (error) {
        setApiResponse({ type: "error", message: "Connection error" });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    // Load permissions from local storage
    const storedPermissions = JSON.parse(localStorage.getItem('permissions')) || [];
    setPermissions(storedPermissions);
  }, []);

  const hasPermission = (permissionId) => permissions.includes(permissionId);

  const handleDeleteCategory = async () => {
    setDeleting(true);
    try {
      const response = await categoryApi.deleteCategory(deletingCategoryId);
      if (response.status === 200) {
        setApiResponse({
          type: "success",
          message: "Category deleted successfully"
        });
        setCategories(categories.filter(c => c.id !== deletingCategoryId));
      } else {
        setApiResponse({
          type: "error",
          message: response.message || "Error deleting category"
        });
      }
    } catch (error) {
      setApiResponse({ 
        type: "error", 
        message: error.response?.data?.message || "Connection error" 
      });
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  // Filtering and pagination
  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="category-list-container">
        <Spin tip="Loading categories..." />
      </div>
    );
  }

  return (
    <div className="category-list-container">
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
        <h1>Categories Management</h1>
        <Link
          to="/dashboard/inventory/categories/add"
          className="button button-primary"
        >
          <span className="button-icon add" /> New Category
        </Link>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search categories..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Products Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.nombre}</td>
                  <td>{category.descripcion || "—"}</td>
                  <td>{category.productCount || 0}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/dashboard/categories/edit/${category.id}`}>
                        <button className="action-button edit">
                          <span className="edit-icon"></span>
                        </button>
                      </Link>
                      <button
                        className="action-button delete"
                        onClick={() => {
                          setDeletingCategoryId(category.id);
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
                <td colSpan="5" className="no-results">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredCategories.length > 0 && (
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
        onOk={handleDeleteCategory}
        okText="Delete"
        cancelText="Cancel"
        confirmLoading={deleting}
      >
        <p>Are you sure you want to delete this category?</p>
        <p>This may affect products associated with this category.</p>
      </Modal>
    </div>
  );
};

export default CategoryList;