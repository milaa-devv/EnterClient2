import React, { useState, useEffect } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Search, Plus, X, Star } from 'lucide-react'
import type { ActividadEconomica } from '@/types/empresa'

export const ActividadesEconomicasStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActividades, setSelectedActividades] = useState<ActividadEconomica[]>(
    state.data.actividadesEconomicas || []
  )
  const [girosPrincipales, setGirosPrincipales] = useState<ActividadEconomica[]>([])

  // Mock data de actividades económicas
  const actividadesDisponibles: ActividadEconomica[] = [
    { cod: 111100, nombre: 'Cultivo de trigo', posee_iva: true },
    { cod: 121100, nombre: 'Cría de ganado bovino', posee_iva: true },
    { cod: 451110, nombre: 'Venta al por mayor de vehículos automotores', posee_iva: true },
    { cod: 461100, nombre: 'Venta al por mayor de materias primas agropecuarias', posee_iva: true },
    { cod: 471110, nombre: 'Comercio al por menor en tiendas no especializadas', posee_iva: true },
    { cod: 551100, nombre: 'Hoteles y moteles', posee_iva: true },
    { cod: 561000, nombre: 'Restaurantes', posee_iva: true },
    { cod: 621100, nombre: 'Actividades de médicos y odontólogos', posee_iva: false },
    { cod: 691100, nombre: 'Actividades jurídicas', posee_iva: false },
    { cod: 702100, nombre: 'Actividades de consultoría en gestión empresarial', posee_iva: true },
    { cod: 801100, nombre: 'Actividades de seguridad privada', posee_iva: true },
    { cod: 851100, nombre: 'Educación preescolar', posee_iva: false },
    { cod: 862100, nombre: 'Actividades de médicos generales', posee_iva: false },
    { cod: 931100, nombre: 'Actividades deportivas', posee_iva: true },
    { cod: 951100, nombre: 'Reparación de equipos informáticos', posee_iva: true }
  ]

  useEffect(() => {
    // Separar giro principal de otros giros
    const principales = selectedActividades.filter((_, index) => index === 0)
    const otros = selectedActividades.filter((_, index) => index > 0)
    
    setGirosPrincipales(principales)
    updateData({
      actividadesEconomicas: selectedActividades
    })
  }, [selectedActividades])

  const actividadesFiltradas = actividadesDisponibles.filter(actividad =>
    actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actividad.cod.toString().includes(searchTerm)
  )

  const handleAgregarActividad = (actividad: ActividadEconomica) => {
    if (!selectedActividades.find(a => a.cod === actividad.cod)) {
      setSelectedActividades([...selectedActividades, actividad])
    }
  }

  const handleEliminarActividad = (cod: number) => {
    setSelectedActividades(selectedActividades.filter(a => a.cod !== cod))
  }

  const handleSetGiroPrincipal = (cod: number) => {
    const actividad = selectedActividades.find(a => a.cod === cod)
    if (actividad) {
      const otrasActividades = selectedActividades.filter(a => a.cod !== cod)
      setSelectedActividades([actividad, ...otrasActividades])
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Actividades Económicas</h4>
        <p className="text-muted">
          Seleccione las actividades económicas que desarrolla la empresa
        </p>
      </div>

      <div className="row g-4">
        {/* Buscador */}
        <div className="col-12">
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
        </div>

        {/* Lista de actividades disponibles */}
        <div className="col-lg-6">
          <h6 className="font-primary fw-semibold mb-3">Actividades Disponibles</h6>
          <div 
            className="border rounded p-3"
            style={{ height: '400px', overflowY: 'auto' }}
          >
            {actividadesFiltradas.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No se encontraron actividades con ese criterio
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {actividadesFiltradas.map((actividad) => {
                  const isSelected = selectedActividades.some(a => a.cod === actividad.cod)
                  
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
                            <div className="fw-semibold small">
                              {actividad.cod}
                            </div>
                            <div className="small text-muted">
                              {actividad.nombre}
                            </div>
                            <div className="d-flex gap-1 mt-1">
                              <span className={`badge ${
                                actividad.posee_iva ? 'bg-success' : 'bg-warning'
                              }`}>
                                {actividad.posee_iva ? 'Con IVA' : 'Sin IVA'}
                              </span>
                            </div>
                          </div>
                          {!isSelected && (
                            <Plus size={16} className="text-primary" />
                          )}
                          {isSelected && (
                            <span className="text-success">
                              ✓ Seleccionada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actividades seleccionadas */}
        <div className="col-lg-6">
          <h6 className="font-primary fw-semibold mb-3">
            Actividades Seleccionadas 
            <span className="badge bg-primary ms-1">
              {selectedActividades.length}
            </span>
          </h6>
          <div 
            className="border rounded p-3"
            style={{ height: '400px', overflowY: 'auto' }}
          >
            {selectedActividades.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No hay actividades seleccionadas
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {selectedActividades.map((actividad, index) => (
                  <div
                    key={actividad.cod}
                    className={`card ${
                      index === 0 ? 'border-warning bg-warning bg-opacity-10' : ''
                    }`}
                  >
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <div className="fw-semibold small">
                              {actividad.cod}
                            </div>
                            {index === 0 && (
                              <span className="badge bg-warning">
                                <Star size={12} className="me-1" />
                                Giro Principal
                              </span>
                            )}
                          </div>
                          <div className="small text-muted">
                            {actividad.nombre}
                          </div>
                          <div className="d-flex gap-1 mt-1">
                            <span className={`badge ${
                              actividad.posee_iva ? 'bg-success' : 'bg-warning'
                            }`}>
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
