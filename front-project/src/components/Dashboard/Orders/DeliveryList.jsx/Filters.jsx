import React from 'react';
import { Search, MapPin, UserCheck, Filter } from 'lucide-react';

export const Filters = ({
  nameFilter,
  setNameFilter,
  cityFilter,
  setCityFilter,
  statusFilter,
  setStatusFilter
}) => {
  return (
    <div className="dl-filters-container">
      <div className="dl-filters-header">
        <Filter size={16} />
        <h3>Filtros</h3>
      </div>
      
      <div className="dl-filters-body">
        <div className="dl-filter-group">
          <div className="dl-filter-input">
            <Search size={16} className="dl-input-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
        </div>
        
        <div className="dl-filter-group">
          <div className="dl-filter-input">
            <MapPin size={16} className="dl-input-icon" />
            <input
              type="text"
              placeholder="Filtrar por ciudad..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>
        </div>
        
        <div className="dl-filter-group">
          <label className="dl-filter-label">Estado:</label>
          <div className="dl-status-options">
            <button
              className={`dl-status-option ${statusFilter === null ? 'selected' : ''}`}
              onClick={() => setStatusFilter(null)}
            >
              Todos
            </button>
            <button
              className={`dl-status-option ${statusFilter === true ? 'selected' : ''}`}
              onClick={() => setStatusFilter(true)}
            >
              Activos
            </button>
            <button
              className={`dl-status-option ${statusFilter === false ? 'selected' : ''}`}
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
