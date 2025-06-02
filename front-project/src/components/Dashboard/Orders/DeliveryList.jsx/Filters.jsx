import React from 'react';
import { Search, MapPin, UserCheck, Filter } from 'lucide-react';

/**
 * Component for filtering delivery workers
 */
export const Filters = ({
  nameFilter,
  setNameFilter,
  cityFilter,
  setCityFilter,
  statusFilter,
  setStatusFilter
}) => {
  return (
    <div className="filters-container">
      <div className="filters-header">
        <Filter size={16} />
        <h3>Filtros</h3>
      </div>
      
      <div className="filters-body">
        <div className="filter-group">
          <div className="filter-input">
            <Search size={16} className="input-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-group">
          <div className="filter-input">
            <MapPin size={16} className="input-icon" />
            <input
              type="text"
              placeholder="Filtrar por ciudad..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Estado:</label>
          <div className="status-options">
            <button
              className={`status-option ${statusFilter === null ? 'selected' : ''}`}
              onClick={() => setStatusFilter(null)}
            >
              Todos
            </button>
            <button
              className={`status-option ${statusFilter === true ? 'selected' : ''}`}
              onClick={() => setStatusFilter(true)}
            >
              Activos
            </button>
            <button
              className={`status-option ${statusFilter === false ? 'selected' : ''}`}
              onClick={() => setStatusFilter(false)}
            >
              Inactivos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};