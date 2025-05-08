import React from 'react';
import { Upload } from 'lucide-react';

const FileUpload = ({ onFileUpload, isLoading }) => {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onFileUpload(file);
    } else {
      alert('Por favor seleccione un archivo CSV válido');
    }
  };
  
  return (
    <div className="file-upload-container">
      <label 
        htmlFor="file-upload"
        className={`file-upload-area ${isLoading ? 'loading' : ''}`}
      >
        <div className="file-upload-content">
          <Upload className={`file-upload-icon ${isLoading ? 'loading' : ''}`} />
          <p className="file-upload-text">
            {isLoading ? 'Procesando archivo...' : 'Haga clic para cargar CSV'}
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          className="file-upload-input"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};

export default FileUpload;