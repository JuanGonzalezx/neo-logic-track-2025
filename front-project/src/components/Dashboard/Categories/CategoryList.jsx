import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { categoryApi } from "../../../api/category";
import { Alert, Spin, Modal, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./Category.css";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const permissions = useSelector(state => state.auth?.permissions || []);

  // States for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // States for deletion
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // States for editing (sin cambios)
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Función para cargar categorías (puede ser llamada desde cualquier sitio)
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getAllCategories();
      if (response.status === 200) {
        setCategories(response.data);
        setApiResponse(null); // Limpia mensajes previos
      } else {
        setApiResponse({ type: "error", message: "Error loading categories" });
      }
    } catch (error) {
      setApiResponse({ type: "error", message: "Connection error" });
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchCategories();
  }, []);

  const hasPermission = (permissionId) => permissions.includes(permissionId);

  if (!hasPermission('682a67a21c1036d90c0b923d')) {
    return (
      <div className="category-list-container">
        <Alert type="error" message="No tiene permiso para ver categorías." showIcon />
      </div>
    );
  }

  // Manejo de eliminación con refresco
  const handleDeleteCategory = async () => {
    setDeleting(true);
    try {
      const response = await categoryApi.deleteCategory(deletingCategoryId);
      if (response.status === 204 || response.status === 200) {
        setApiResponse({
          type: "success",
          message: response.message || "Category deleted successfully"
        });
        await fetchCategories(); // Recarga la lista actualizada
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

  // Filtrado y paginación
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
        <h1>Categorías</h1>
        {hasPermission('682a68421c1036d90c0b923e') && (
          <Link to="/dashboard/inventory/categories/add" className="button button-primary">
            <span className="button-icon add" /> Nueva Categoría
          </Link>
        )}
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
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map(category => (
                <tr key={category.id}>
                  <td>{category.nombre}</td>
                  <td>{category.descripcion}</td>
                  <td>
                    <div className="table-actions">
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          if (hasPermission('682a68ae1c1036d90c0b923f')) {
                            setEditingCategory(category);
                            setEditModalVisible(true);
                          }
                        }}
                        disabled={!hasPermission('682a68ae1c1036d90c0b923f')}
                        className={!hasPermission('682a68ae1c1036d90c0b923f') ? 'disabled' : ''}
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          if (hasPermission('682a68e51c1036d90c0b9240')) {
                            setDeletingCategoryId(category.id);
                            setDeleteModalVisible(true);
                          }
                        }}
                        disabled={!hasPermission('682a68e51c1036d90c0b9240')}
                        className={!hasPermission('682a68e51c1036d90c0b9240') ? 'disabled' : ''}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>No categories found</td>
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
