import React, { useState } from 'react';
import FileUpload from './FileUpload.jsx';
import { DataTable } from './DataTable';
// import { LogViewer } from './LogViewer';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fileAPI } from '../../api/fileAPI';
import './FileUpload.css'; // Importamos los estilos

const FileUploadPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logContent, setLogContent] = useState(""); 
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setLogContent(""); // Limpiamos cualquier log previo
    addLog(`Iniciando carga del archivo: ${file.name}`);
    
    try {
      // Subir el archivo
      const response = await fileAPI.uploadFile(file, token);
      
      // Procesar la respuesta
      if (response.message) {
        addLog(`✅ ${response.message}`);
      }
      
      if (response.resumen) {
        const { creadas, existentes, fallidas } = response.resumen;
        addLog(`✅ Ciudades creadas: ${creadas}`);
        addLog(`⚠️ Ciudades ya existentes: ${existentes}`);
        addLog(`❌ Líneas fallidas: ${fallidas}`);
        
        // Aquí deberíamos obtener los datos para la tabla
        // Como el backend no devuelve los datos directamente,
        // podríamos hacer una petición adicional o mostrar solo el resumen
        
        if (response.ciudades) {
            const ciudadesFormateadas = response.ciudades.map(ciudad => ({
              departamento: ciudad.departamento,
              municipio: ciudad.nombre
            }));
            
            setData(ciudadesFormateadas);
        }

        if (response.logContenido) {
            setLogContent(response.logContenido); // ✅ Mostrar log en <pre>
          }
      }
      
      setIsLoading(false);
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  return (
    <div className="app-container">
      <div className="app-wrapper">
        <h1 className="app-title">Carga de Archivos CSV</h1>
        <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
        
        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Procesando archivo...</p>
          </div>
        )}
        
        {data.length > 0 && <DataTable data={data} />}
        {logContent && (
          <div id="file-upload-log-block">
            <h2 id="file-upload-log-title">📄 Log de la Carga</h2>
            <pre id="file-upload-log-content">{logContent}</pre>
          </div>
        )}
        {/* <LogViewer logs={logs} /> */}
      </div>
    </div>
  );
};

export default FileUploadPage;