import React, { useEffect, useMemo, useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Search, Plus, X, Star, RefreshCcw } from 'lucide-react'
import type { ActividadEconomica } from '@/types/empresa'
import {
  formatActividadCod,
  getActividadesEconomicas,
  normalizeSearchText
} from '@/data/siiActividades'

export const ActividadesEconomicasStep: React.FC = () => {
  const { state, updateData } = useFormContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [onlyInternet, setOnlyInternet] = useState(true)

  const [selectedActividades, setSelectedActividades] = useState<ActividadEconomica[]>(
    state.data.actividadesEconomicas || []
  )

  const [actividadesDisponibles, setActividadesDisponibles] = useState<ActividadEconomica[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Carga inicial del catálogo (desde /public/data/..json)
  useEffect(() => {
    let mounted = true

    setLoading(true)
    setLoadError(null)

    getActividadesEconomicas({ onlyInternet })
      .then((list) => {
        if (!mounted) return
        setActividadesDisponibles(list)
      })
      .catch((err: any) => {
        console.error(err)
        if (!mounted) return
        setLoadError(err?.message ?? 'Error al cargar actividades económicas')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [onlyInternet, reloadKey])

  // Persistir selección en el FormContext
  useEffect(() => {
    updateData({
      actividadesEconomicas: selectedActividades
    })
  }, [selectedActividades, updateData])

  const actividadesFiltradas = useMemo(() => {
    const q = normalizeSearchText(searchTerm)
    const qDigits = (searchTerm ?? '').replace(/\D/g, '')

    const out = actividadesDisponibles.filter((actividad) => {
      if (!q && !qDigits) return true

      const nombreOk = q ? normalizeSearchText(actividad.nombre).includes(q) : false

      // Para buscar por código, comparamos contra el formato de 6 dígitos
      const codFmt = formatActividadCod(actividad.cod)
      const codOk = qDigits ? codFmt.includes(qDigits) : false

      return nombreOk || codOk
    })

    // Para evitar renderizar 600+ cards cuando no hay búsqueda
    if (!q && !qDigits) return out.slice(0, 200)
    return out.slice(0, 300)
  }, [actividadesDisponibles, searchTerm])

  const handleAgregarActividad = (actividad: ActividadEconomica) => {
    if (!selectedActividades.find((a) => a.cod === actividad.cod)) {
      setSelectedActividades([...selectedActividades, actividad])
    }
  }

  const handleEliminarActividad = (cod: number) => {
    setSelectedActividades(selectedActividades.filter((a) => a.cod !== cod))
  }

  const handleSetGiroPrincipal = (cod: number) => {
    const actividad = selectedActividades.find((a) => a.cod === cod)
    if (actividad) {
      const otrasActividades = selectedActividades.filter((a) => a.cod !== cod)
      setSelectedActividades([actividad, ...otrasActividades])
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Actividades Económicas</h4>
        <p className="text-muted">Seleccione las actividades económicas que desarrolla la empresa</p>
      </div>

      <div className="row g-4">
        {/* Buscador */}
        <div className="col-12">
          <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap">
            <div className="flex-grow-1" style={{ minWidth: 280 }}>
              <label className="form-label">Buscar Actividad Económica</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por código o nombre de actividad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-text">Tip: puedes buscar por código (ej: 011101) o por texto.</div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="onlyInternet"
                  checked={onlyInternet}
                  onChange={(e) => setOnlyInternet(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="onlyInternet">
                  Solo “Disponible Internet"
                </label>
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setReloadKey((k) => k + 1)}
                title="Recargar catálogo"
              >
                <RefreshCcw size={16} className="me-1" />
                Recargar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de actividades disponibles */}
        <div className="col-lg-6">
          <h6 className="font-primary fw-semibold mb-3">Actividades Disponibles</h6>
          <div className="border rounded p-3" style={{ height: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-4 text-muted">Cargando actividades del SII…</div>
            ) : loadError ? (
              <div className="text-center py-4">
                <div className="text-danger fw-semibold mb-2">{loadError}</div>
                <div className="text-muted small mb-3">Revisa que el JSON exista en public/data y que la ruta sea correcta.</div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setReloadKey((k) => k + 1)}
                >
                  <RefreshCcw size={14} className="me-1" />
                  Reintentar
                </button>
              </div>
            ) : actividadesFiltradas.length === 0 ? (
              <div className="text-center py-4 text-muted">No se encontraron actividades con ese criterio</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {actividadesFiltradas.map((actividad) => {
                  const isSelected = selectedActividades.some((a) => a.cod === actividad.cod)

                  return (
                    <div
                      key={actividad.cod}
                      className={`card ${isSelected ? 'bg-light border-primary' : ''} cursor-pointer`}
                      onClick={() => !isSelected && handleAgregarActividad(actividad)}
                      style={{ cursor: isSelected ? 'default' : 'pointer' }}
                    >
                      <div className="card-body p-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="fw-semibold small">{formatActividadCod(actividad.cod)}</div>
                            <div className="small text-muted">{actividad.nombre}</div>
                            <div className="d-flex gap-1 mt-1">
                              <span
                                className={`badge ${actividad.posee_iva ? 'bg-success' : 'bg-warning'}`}
                              >
                                {actividad.posee_iva ? 'Con IVA' : 'Sin IVA'}
                              </span>
                            </div>
                          </div>
                          {!isSelected && <Plus size={16} className="text-primary" />}
                          {isSelected && <span className="text-success">✓ Seleccionada</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {!loading && !loadError && !searchTerm && (
            <div className="form-text mt-2">Mostrando las primeras 200 para que el scroll no explote 😅. Escribe algo para filtrar.</div>
          )}
        </div>

        {/* Actividades seleccionadas */}
        <div className="col-lg-6">
          <h6 className="font-primary fw-semibold mb-3">
            Actividades Seleccionadas
            <span className="badge bg-primary ms-1">{selectedActividades.length}</span>
          </h6>
          <div className="border rounded p-3" style={{ height: '400px', overflowY: 'auto' }}>
            {selectedActividades.length === 0 ? (
              <div className="text-center py-4 text-muted">No hay actividades seleccionadas</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {selectedActividades.map((actividad, index) => (
                  <div
                    key={actividad.cod}
                    className={`card ${index === 0 ? 'border-warning bg-warning bg-opacity-10' : ''}`}
                  >
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <div className="fw-semibold small">{formatActividadCod(actividad.cod)}</div>
                            {index === 0 && (
                              <span className="badge bg-warning">
                                <Star size={12} className="me-1" />
                                Giro Principal
                              </span>
                            )}
                          </div>
                          <div className="small text-muted">{actividad.nombre}</div>
                          <div className="d-flex gap-1 mt-1">
                            <span
                              className={`badge ${actividad.posee_iva ? 'bg-success' : 'bg-warning'}`}
                            >
                              {actividad.posee_iva ? 'Con IVA' : 'Sin IVA'}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex flex-column gap-1">
                          {index > 0 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning"
                              title="Marcar como giro principal"
                              onClick={() => handleSetGiroPrincipal(actividad.cod)}
                            >
                              <Star size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Eliminar actividad"
                            onClick={() => handleEliminarActividad(actividad.cod)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Información importante */}
        <div className="col-12">
          <div className="alert alert-info">
            <h6 className="alert-heading">Información Importante</h6>
            <ul className="mb-0 small">
              <li>
                <strong>Giro Principal:</strong> Es la actividad económica principal de la empresa y aparecerá marcada con ⭐
              </li>
              <li>
                <strong>Otros Giros:</strong> Actividades secundarias que también desarrolla la empresa
              </li>
              <li>
                <strong>IVA:</strong> Indica si la actividad está afecta al Impuesto al Valor Agregado
              </li>
              <li>Puede seleccionar múltiples actividades económicas</li>
              <li>El orden de las actividades puede cambiarse marcando como principal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
