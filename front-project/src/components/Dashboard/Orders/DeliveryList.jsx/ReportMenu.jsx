import React, { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, X, Download, Check, Loader } from 'lucide-react';

/**
 * Component for generating Excel or PDF reports for a delivery worker
 */
export const ReportMenu = ({ isOpen, onClose, worker, orders }) => {
  const [reportType, setReportType] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Reset state when menu opens
  useEffect(() => {
    if (isOpen) {
      setReportType(null);
      setIsGenerating(false);
      setSuccess(false);
    }
  }, [isOpen]);
  
  // Handle report type selection
  const handleSelectType = (type) => {
    setReportType(type);
  };
  
  // Handle report generation
  const handleGenerateReport = () => {
    if (!reportType) return;
    
    setIsGenerating(true);
    
    // Filter orders for this worker
    const workerOrders = orders.filter(o => o.delivery_id === worker.id);
    
    // In a real app, this would call an API to generate the report
    // For this example, we'll simulate a report generation
    setTimeout(() => {
      // Get today's date for the filename
      const today = new Date().toISOString().split('T')[0];
      const fileName = `reporte_${worker.nombre.replace(/\s+/g, '_')}_${today}`;
      
      // Create a data object for the report
      const reportData = {
        worker: {
          id: worker.id,
          name: worker.nombre,
          email: worker.email,
          phone: worker.telefono,
          city: worker.ciudad,
          isActive: worker.activo
        },
        orders: workerOrders.map(order => ({
          id: order.id,
          customer: order.customer_name,
          address: order.delivery_address,
          date: order.fechaEntrega || order.fecha_entrega || order.creation_date,
          status: order.status
        })),
        summary: {
          totalOrders: workerOrders.length,
          pendingOrders: worker.pedidosPendientes,
          todayOrders: worker.pedidosHoy
        }
      };
      
      // In a real app, this would generate and download the file
      // For this example, we'll just log the data
      console.log('Generating report:', reportType, reportData);
      
      // Simulate download
      if (reportType === 'excel') {
        simulateDownload(`${fileName}.xlsx`);
      } else {
        simulateDownload(`${fileName}.pdf`);
      }
      
      setIsGenerating(false);
      setSuccess(true);
      
      // Close the menu after a success message
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };
  
  // Simulate file download
  const simulateDownload = (filename) => {
    // In a real app, this would trigger a file download
    // For this example, we'll just show a message
    console.log(`Downloading ${filename}`);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={`report-menu ${isOpen ? 'open' : ''}`}>
      <div className="menu-backdrop" onClick={onClose}></div>
      <div className="menu-content">
        <div className="menu-header">
          <h3>Generar Reporte</h3>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        
        <div className="menu-body">
          <p className="worker-name">{worker.nombre}</p>
          
          {success ? (
            <div className="success-message">
              <Check size={32} className="success-icon" />
              <p>¡Reporte generado correctamente!</p>
            </div>
          ) : (
            <>
              <p className="menu-instruction">Selecciona el formato del reporte:</p>
              
              <div className="report-options">
                <button 
                  className={`report-option ${reportType === 'excel' ? 'selected' : ''}`}
                  onClick={() => handleSelectType('excel')}
                  disabled={isGenerating}
                >
                  <FileSpreadsheet size={24} className="option-icon" />
                  <span className="option-label">Excel</span>
                </button>
                
                <button 
                  className={`report-option ${reportType === 'pdf' ? 'selected' : ''}`}
                  onClick={() => handleSelectType('pdf')}
                  disabled={isGenerating}
                >
                  <FileText size={24} className="option-icon" />
                  <span className="option-label">PDF</span>
                </button>
              </div>
              
              <button 
                className="generate-button"
                onClick={handleGenerateReport}
                disabled={!reportType || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader size={16} className="spinning" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Generar Reporte</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};