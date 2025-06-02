import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productAPI } from "../../../api/product";
import { Alert, Spin, Modal, Button } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"; // <-- Importamos EyeOutlined
import "./Product.css";
import { useSelector } from "react-redux";

const pageNeighbors = 2; // cantidad de páginas visibles alrededor de la actual

// Función para generar los números de página con "..." para paginación grande
const getPageNumbers = (currentPage, totalPages) => {
  const totalNumbers = pageNeighbors * 2 + 3; // +1 y +2 para primeros y últimos
  const totalBlocks = totalNumbers + 2; // +2 para los ...

  if (totalPages > totalBlocks) {
    let pages = [];

    const leftBound = Math.max(2, currentPage - pageNeighbors);
    const rightBound = Math.min(totalPages - 1, currentPage + pageNeighbors);

    const hasLeftSpill = leftBound > 2;
    const hasRightSpill = rightBound < totalPages - 1;

    if (!hasLeftSpill && hasRightSpill) {
      const leftItemCount = totalNumbers - 2;
      for (let i = 2; i <= leftItemCount; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else if (hasLeftSpill && !hasRightSpill) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - (totalNumbers - 2); i < totalPages; i++) {
        pages.push(i);
      }
      pages.push(totalPages);
    } else if (hasLeftSpill && hasRightSpill) {
      pages.push(1);
      pages.push("...");
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }
    return pages;
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [categories, setCategories] = useState([]);
  const permissions = useSelector(state => state.auth?.permissions || []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await productAPI.getAllCategories();
        if (categoriesResponse.status === 200) {
          setCategories(categoriesResponse.data);
        }
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
  }, []);

  const getCategoryName = (categoryId, categories) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  };

  const hasPermission = (permissionId) => permissions.includes(permissionId);

  const handleDeleteProduct = async () => {
    setDeleting(true);
    try {
      const response = await productAPI.deleteProduct(deletingProductId);
      if (response.status === 200) {
        setApiResponse({ type: "success", message: "Producto eliminado correctamente." });
        setProducts(products.filter(p => p.id_producto !== deletingProductId));
      } else {
        setApiResponse({ type: "error", message: response.message || "Error al eliminar el producto." });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setApiResponse({ type: "error", message: "Error de conexión" });
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const searchMatch = [p.nombre_producto, p.descripcion, p.sku].some(field =>
      field && field.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const categoryMatch = !filterCategory || p.categoria_id === filterCategory;
    const statusMatch = !filterStatus || (filterStatus === "true" ? p.estado : !p.estado);
    return searchMatch && categoryMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (!hasPermission('682a321b98d5434a57e769d0')) {
    return (
      <div className="product-list-container">
        <Alert type="error" message="No tiene permiso para ver productos." showIcon />
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
        <h1>Inventario</h1>
        <div className="header-actions">
          {hasPermission('682a67071c1036d90c0b923a') && (
            <Link to="/dashboard/inventory/add" className="button button-primary">
              <span className="button-icon add" />
              <span className="button-text">Agregar producto</span>
            </Link>
          )}

          {hasPermission('682a90983da0f9eaae2c53a8') && (
            <Link
              to="/dashboard/inventory/import"
              className="button button-secondary"
              style={{ marginLeft: 0 }}
            >
              <span className="button-icon add" />
              <span className="button-text">Importación masiva</span>
            </Link>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Buscar productos..."
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
            <option value="">Todas las categorías</option>
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
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin />
          <div style={{ marginTop: 8, textAlign: "center" }}>Cargando productos...</div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre del producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
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
                        <span className={`status-badge ${product.estado ? 'active' : 'inactive'}`}>
                          {product.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/dashboard/inventory/${product.id_producto}`}>
                            <Button
                              icon={<EyeOutlined />}
                              title="Ver producto"
                              className="action-button"
                            />
                          </Link>
                          <Button
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/dashboard/inventory/edit/${product.id_producto}`)}
                            disabled={!hasPermission('682a67231c1036d90c0b923b')}
                            className={!hasPermission('682a67231c1036d90c0b923b') ? 'disabled' : ''}
                            style={{ marginRight: 8 }}
                            title="Editar producto"
                          />
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setDeletingProductId(product.id_producto);
                              setDeleteModalVisible(true);
                            }}
                            disabled={!hasPermission('682a67381c1036d90c0b923c')}
                            className={!hasPermission('682a67381c1036d90c0b923c') ? 'disabled' : ''}
                            title="Eliminar producto"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No se encontraron productos
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
                Anterior
              </button>
              <div className="pagination-pages">
                {getPageNumbers(currentPage, totalPages).map((page, index) =>
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${page}`}
                      className={`pagination-page ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        title="Confirmar eliminación"
        open={isDeleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDeleteProduct}
        okText="Eliminar"
        cancelText="Cancelar"
        confirmLoading={deleting}
      >
        <p>¿Está seguro de que desea eliminar este producto?</p>
        <p>Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
};

export default ProductList;
