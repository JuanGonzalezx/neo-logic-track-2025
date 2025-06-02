import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { uploadProductsCSV } from "../../api/product";
import { Alert, Spin, Upload, Button } from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import "./Product.css";

const { Dragger } = Upload;

const ProductImport = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      setApiResponse({
        type: "error",
        message: "Por favor, seleccione un archivo CSV para subir"
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0]);
    
    setUploading(true);
    try {
      const response = await uploadProductsCSV(formData);
      
      if (response.status === 200) {
        setApiResponse({
          type: "success",
          message: "Productos subidos con éxito"
        });
        
        // Set results if provided by the API
        if (response.data && (response.data.successful || response.data.failed)) {
          setUploadResults({
            successful: response.data.successful || 0,
            failed: response.data.failed || 0,
            errors: response.data.errors || []
          });
        }
      } else {
        setApiResponse({
          type: "error",
          message: response.message || "Error al subir productos"
        });
      }
    } catch {
      setApiResponse({
        type: "error",
        message: "Error del servidor al subir el archivo"
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv');
      if (!isCsv) {
        setApiResponse({
          type: "error",
          message: "¡Solo se pueden subir archivos CSV!"
        });
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const downloadTemplate = () => {
    // This would typically fetch a template from the server
    // For now, we'll create a simple CSV template
    const csvContent = 
      "id_producto,id_almacen,nombre_producto,categoria,descripcion,sku,codigo_barras,precio_unitario,cantidad_stock,nivel_reorden,ultima_reposicion,fecha_vencimiento,id_proveedor,peso_kg,dimensiones_cm,es_fragil,requiere_refrigeracion,estado\n" +
      "P001,ALM001,Example Product,Electronics,Product Description,ELE-1234,7890123456789,1000,50,10,15/4/2023,,PROV001,2.5,25x15x10,true,false,true";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_import_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="product-import-container">
      <div className="page-header">
        <h1>Importación masiva de productos</h1>
      </div>

      {apiResponse && (
        <Alert
          message={apiResponse.type === "success" ? "Éxito" : "Error"}
          description={apiResponse.message}
          type={apiResponse.type}
          showIcon
          closable
          onClose={() => setApiResponse(null)}
          style={{ marginBottom: 24 }}
        />
      )}

      <div className="import-section">
        <Button 
          icon={<DownloadOutlined />} 
          onClick={downloadTemplate}
          style={{ marginBottom: 16 }}
        >
          Descargar plantilla CSV
        </Button>
        
        <div className="upload-container">
          <Dragger {...uploadProps} disabled={uploading}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Haga clic o arrastre el archivo a esta área para subirlo</p>
            <p className="ant-upload-hint">
              Solo se admiten archivos CSV. Asegúrese de que su archivo siga el formato de la plantilla.
            </p>
          </Dragger>
        </div>

        <div className="import-actions" style={{ marginTop: 24 }}>
          <Button
            type="default"
            onClick={() => navigate("/dashboard/inventory")}
            style={{ marginRight: 8 }}
          >
            Cancelar
          </Button>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
          >
            {uploading ? "Subiendo" : "Subir"}
          </Button>
        </div>
      </div>

      {uploadResults && (
        <div className="upload-results" style={{ marginTop: 24 }}>
          <h2>Resultados de la importación</h2>
          <div className="results-summary">
            <div className="result-item success">
              <span className="result-label">Importados correctamente:</span>
              <span className="result-value">{uploadResults.successful}</span>
            </div>
            <div className="result-item failed">
              <span className="result-label">Fallidos:</span>
              <span className="result-value">{uploadResults.failed}</span>
            </div>
          </div>

          {uploadResults.errors.length > 0 && (
            <div className="error-list">
              <h3>Errores</h3>
              <ul>
                {uploadResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImport;