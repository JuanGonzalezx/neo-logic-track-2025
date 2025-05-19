import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productAPI } from "../../../api/product";
// import { getCategoryById } from "../../api/category";
// import { getStockByProductId } from "../../api/stock";
import { Spin, Alert, Descriptions, Card, Badge, Divider, Tag } from "antd";
import { EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import "./Product.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product details
        const productRes = await productAPI.getProductById(id);
        if (productRes.status !== 200) {
          throw new Error("Product not found");
        }
        setProduct(productRes.data);

        // Fetch category details
        if (productRes.data.categoria_id) {
          const categoryRes = await productAPI.getCategoryById(productRes.data.categoria_id);
          if (categoryRes.status === 200) {
            setCategory(categoryRes.data);
          }
        }

        // Fetch stock information
        const stockRes = 100
        // if (stockRes.status === 200) {
        //   setStock(stockRes.data);
        // }
      } catch (err) {
        setError(err.message || "Error loading product details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-container" style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <Alert
          message="Error"
          description={error || "Product not found"}
          type="error"
          showIcon
          action={
            <button 
              className="button button-primary" 
              onClick={() => navigate("/dashboard/inventory")}
            >
              Back to Products
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <button 
            className="button button-secondary" 
            onClick={() => navigate("/dashboard/inventory")}
            style={{ marginRight: "16px" }}
          >
            <ArrowLeftOutlined /> Back
          </button>
          <h1>Product Details</h1>
        </div>
        <Link 
          to={`/dashboard/inventory/edit/${id}`} 
          className="button button-primary"
        >
          <EditOutlined /> Edit Product
        </Link>
      </div>

      <div className="product-detail-content">
        <Card className="product-info-card">
          <div className="product-header">
            <div>
              <h2>{product.nombre_producto}</h2>
              <p className="product-id">ID: {product.id_producto}</p>
            </div>
            <Badge 
              status={product.status ? "success" : "error"} 
              text={product.status ? "Active" : "Inactive"} 
            />
          </div>

          <Divider />

          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="SKU">{product.sku}</Descriptions.Item>
            <Descriptions.Item label="Barcode">{product.codigo_barras}</Descriptions.Item>
            <Descriptions.Item label="Category">{category?.nombre || "Unknown"}</Descriptions.Item>
            <Descriptions.Item label="Price">${product.precio_unitario.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Weight">{product.peso_kg} kg</Descriptions.Item>
            <Descriptions.Item label="Dimensions">{product.dimensiones_cm}</Descriptions.Item>
          </Descriptions>

          <div className="product-attributes" style={{ marginTop: "24px" }}>
            <Tag color={product.es_fragil ? "volcano" : "green"}>
              {product.es_fragil ? "Fragile" : "Not Fragile"}
            </Tag>
            <Tag color={product.requiere_refrigeracion ? "blue" : "green"}>
              {product.requiere_refrigeracion ? "Refrigeration Required" : "No Refrigeration"}
            </Tag>
          </div>

          <div className="product-description" style={{ marginTop: "24px" }}>
            <h3>Description</h3>
            <p>{product.descripcion || "No description available"}</p>
          </div>
        </Card>

        <Card title="Stock Information" className="stock-info-card" style={{ marginTop: "24px" }}>
          {stock.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th>Stock Quantity</th>
                  <th>Reorder Level</th>
                  <th>Last Restocked</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => (
                  <tr key={item.id}>
                    <td>{item.almacen_nombre || item.id_almacen}</td>
                    <td>{item.cantidad_stock}</td>
                    <td>{item.nivel_reorden}</td>
                    <td>{new Date(item.ultima_reposicion).toLocaleDateString()}</td>
                    <td>
                      {item.fecha_vencimiento 
                        ? new Date(item.fecha_vencimiento).toLocaleDateString() 
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">No stock information available</div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;