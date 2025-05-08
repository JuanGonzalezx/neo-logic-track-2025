import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const DataTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  if (!data.length) return null;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th>Departamentos</th>
              <th>Municipios</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentData.map((row, index) => (
              <tr key={index}>
                <td>{row.departamento}</td>
                <td>{row.municipio}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-footer">
          <div className="pagination-info">
            Mostrando <span className="pagination-info-number">{startIndex + 1}</span> a{' '}
            <span className="pagination-info-number">{Math.min(endIndex, data.length)}</span> de{' '}
            <span className="pagination-info-number">{data.length}</span> resultados
          </div>
          <div className="pagination-buttons">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              <ChevronLeft className="pagination-button-icon" />
              Anterior
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Siguiente
              <ChevronRight className="pagination-button-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};