import React, { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, X, Download, Check, Loader } from 'lucide-react';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportMenu = ({ isOpen, onClose, worker, orders }) => {
    const [reportType, setReportType] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReportType(null);
            setIsGenerating(false);
            setSuccess(false);
        }
    }, [isOpen]);

    const handleSelectType = (type) => {
        setReportType(type);
    };

    // Función para generar y descargar Excel
    const generateExcel = (reportData, fileName) => {
        const worksheetData = reportData.orders.map(o => ({
            'ID Pedido': o.id,
            Cliente: o.customer,
            Dirección: o.address,
            Fecha: o.date ? new Date(o.date).toLocaleDateString() : '',
            Estado: o.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, `${fileName}.xlsx`);
    };

    // Función para generar y descargar PDF
    const generatePDF = (reportData, fileName) => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(16);
        doc.text(`Reporte de Pedidos - ${reportData.worker.name}`, 14, 20);

        // Detalles del trabajador
        doc.setFontSize(12);
        doc.text(`Email: ${reportData.worker.email}`, 14, 30);
        doc.text(`Teléfono: ${reportData.worker.phone || 'No disponible'}`, 14, 37);
        doc.text(`Ciudad: ${reportData.worker.city || 'No especificada'}`, 14, 44);
        doc.text(`Estado: ${reportData.worker.isActive ? 'Activo' : 'Inactivo'}`, 14, 51);

        // Tabla con pedidos
        const columns = [
            { header: 'ID Pedido', dataKey: 'id' },
            { header: 'Cliente', dataKey: 'customer' },
            { header: 'Dirección', dataKey: 'address' },
            { header: 'Fecha', dataKey: 'date' },
            { header: 'Estado', dataKey: 'status' },
        ];

        const rows = reportData.orders.map(o => ({
            id: o.id,
            customer: o.customer,
            address: o.address,
            date: o.date ? new Date(o.date).toLocaleDateString() : '',
            status: o.status,
        }));

        autoTable(doc, {
            startY: 60,
            head: [columns.map(c => c.header)],
            body: rows.map(row => columns.map(c => row[c.dataKey])),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246] },
        });

        doc.save(`${fileName}.pdf`);
    };

    const handleGenerateReport = () => {
        if (!reportType) return;

        setIsGenerating(true);

        const workerOrders = orders.filter(o => o.delivery_id === worker.id);

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

        const today = new Date().toISOString().split('T')[0];
        const fileName = `reporte_${worker.nombre.replace(/\s+/g, '_')}_${today}`;

        setTimeout(() => {
            if (reportType === 'excel') {
                generateExcel(reportData, fileName);
            } else if (reportType === 'pdf') {
                generatePDF(reportData, fileName);
            }

            setIsGenerating(false);
            setSuccess(true);

            setTimeout(() => {
                onClose();
            }, 2000);
        }, 1000);
    };

    if (!isOpen) return null;

   return (
    <div className={`dl-report-menu ${isOpen ? 'open' : ''}`}>
      <div className="dl-menu-backdrop" onClick={onClose}></div>
      <div className="dl-menu-content">
        <div className="dl-menu-header">
          <h3>Generar Reporte</h3>
          <button className="dl-close-button" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="dl-menu-body">
          <p className="dl-worker-name">{worker.nombre}</p>

          {success ? (
            <div className="dl-success-message">
              <Check size={32} className="dl-success-icon" />
              <p>¡Reporte generado correctamente!</p>
            </div>
          ) : (
            <>
              <p className="dl-menu-instruction">Selecciona el formato del reporte:</p>

              <div className="dl-report-options">
                <button
                  className={`dl-report-option ${reportType === 'excel' ? 'selected' : ''}`}
                  onClick={() => handleSelectType('excel')}
                  disabled={isGenerating}
                >
                  <FileSpreadsheet size={24} className="dl-option-icon" />
                  <span className="dl-option-label">Excel</span>
                </button>

                <button
                  className={`dl-report-option ${reportType === 'pdf' ? 'selected' : ''}`}
                  onClick={() => handleSelectType('pdf')}
                  disabled={isGenerating}
                >
                  <FileText size={24} className="dl-option-icon" />
                  <span className="dl-option-label">PDF</span>
                </button>
              </div>

              <button
                className="dl-generate-button"
                onClick={handleGenerateReport}
                disabled={!reportType || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader size={16} className="dl-spinning" />
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
