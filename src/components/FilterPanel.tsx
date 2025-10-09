import React, { useState } from 'react'
import { Filter, X, RotateCcw } from 'lucide-react'

interface FilterPanelProps {
  filters: {
    estado?: string
    producto?: string
    fechaInicio?: string
    fechaFin?: string
    categoria?: string
  }
  onFiltersChange: (filters: any) => void
  onClear: () => void
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClear
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ [key]: value || undefined })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(Boolean).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Filter size={18} />
            <h6 className="mb-0 font-primary fw-semibold">Filtros</h6>
            {activeFiltersCount > 0 && (
              <span className="badge bg-primary">{activeFiltersCount}</span>
            )}
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? 'Mostrar' : 'Ocultar'}
            </button>
            {activeFiltersCount > 0 && (
              <button
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                onClick={onClear}
              >
                <RotateCcw size={14} />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="card-body">
          <div className="row g-3">
            {/* Estado */}
            <div className="col-md-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={filters.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="COMERCIAL">En Comercial</option>
                <option value="ONBOARDING">En Onboarding</option>
                <option value="SAC">En SAC</option>
                <option value="COMPLETADA">Completada</option>
              </select>
            </div>

            {/* Producto */}
            <div className="col-md-3">
              <label className="form-label">Producto</label>
              <select
                className="form-select"
                value={filters.producto || ''}
                onChange={(e) => handleFilterChange('producto', e.target.value)}
              >
                <option value="">Todos los productos</option>
                <option value="ENTERFAC">Enterfac</option>
                <option value="ANDESPOS">AndesPOS</option>
              </select>
            </div>

            {/* Fecha Inicio */}
            <div className="col-md-3">
              <label className="form-label">Fecha Desde</label>
              <input
                type="date"
                className="form-control"
                value={filters.fechaInicio || ''}
                onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
              />
            </div>

            {/* Fecha Fin */}
            <div className="col-md-3">
              <label className="form-label">Fecha Hasta</label>
              <input
                type="date"
                className="form-control"
                value={filters.fechaFin || ''}
                onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                min={filters.fechaInicio || ''}
              />
            </div>

            {/* Categoría Tributaria */}
            <div className="col-md-6">
              <label className="form-label">Categoría Tributaria</label>
              <select
                className="form-select"
                value={filters.categoria || ''}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
              >
                <option value="">Todas las categorías</option>
                <option value="1">Primera Categoría</option>
                <option value="2">Segunda Categoría</option>
                <option value="3">Exenta</option>
              </select>
            </div>

            {/* Región (ejemplo adicional) */}
            <div className="col-md-6">
              <label className="form-label">Región</label>
              <select
                className="form-select"
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="">Todas las regiones</option>
                <option value="RM">Región Metropolitana</option>
                <option value="V">Región de Valparaíso</option>
                <option value="VIII">Región del Biobío</option>
                <option value="X">Región de Los Lagos</option>
              </select>
            </div>
          </div>

          {/* Filtros avanzados */}
          <div className="mt-4">
            <div className="d-flex flex-wrap gap-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="conLogo"
                  checked={filters.conLogo || false}
                  onChange={(e) => handleFilterChange('conLogo', e.target.checked ? 'true' : '')}
                />
                <label className="form-check-label" htmlFor="conLogo">
                  Con Logo
                </label>
              </div>
              
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="conRepresentante"
                  checked={filters.conRepresentante || false}
                  onChange={(e) => handleFilterChange('conRepresentante', e.target.checked ? 'true' : '')}
                />
                <label className="form-check-label" htmlFor="conRepresentante">
                  Con Representante Legal
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="conSucursales"
                  checked={filters.conSucursales || false}
                  onChange={(e) => handleFilterChange('conSucursales', e.target.checked ? 'true' : '')}
                />
                <label className="form-check-label" htmlFor="conSucursales">
                  Con Sucursales
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
