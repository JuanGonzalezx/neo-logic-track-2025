import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';

export const LogViewer = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="log-viewer">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="log-button"
      >
        <ClipboardList className="log-icon" />
      </button>
      {isOpen && (
        <div className="log-panel">
          <div className="log-content">
            <h3 className="log-title">Registros</h3>
            <div className="log-list">
              {logs.map((log, index) => (
                <div key={index} className="log-item">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};