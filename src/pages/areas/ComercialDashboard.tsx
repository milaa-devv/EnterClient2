import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Clock, 
  History, 
  Bell, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Building2
} from 'lucide-react'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'

const ComercialDashboard: React.FC = () => {
  const { empresas, loading } = useEmpresaSearch()
  
  // Filtrar empresas por estado para estadísticas
  const empresasComercial = empresas.filter(e => e.estado === 'COMERCIAL')
  const empresasEnviadasOB = empresas.filter(e => e.estado === 'ONBOARDING')
  
  // Datos mock para estadísticas
  const estadisticas = {
    empresasEnProceso: empresasComercial.length,
    empresasEnviadas: empresasEnviadasOB.length,
    totalMes: empresasComercial.length + empresasEnviadasOB.length,
    pendienteRevision: 3
  }

  const tareasRecientes = [
    {
      id: 1,
      tipo: 'representante',
      empresa: 'Empresa Demo S.A.',
      descripcion: 'Agregar segundo representante legal',
      prioridad: 'alta',
      fecha: '2025-09-21'
    },
    {
      id: 2,
      tipo: 'documentos',
      empresa: 'Comercial ABC Ltda.',
      descripcion: 'Completar documentos tributarios',
      prioridad: 'media',
      fecha: '2025-09-20'
    },
    {
      id: 3,
      tipo: 'logo',
      empresa: 'Servicios XYZ S.A.',
      descripcion: 'Subir logo de la empresa',
      prioridad: 'baja',
      fecha: '2025-09-19'
    }
  ]

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="font-primary fw-bold mb-1">Dashboard Comercial</h1>
              <p className="text-muted mb-0">
                Gestión y seguimiento de empresas en proceso comercial
              </p>
            </div>
            <Link
              to="/comercial/nueva-empresa"
              className="btn btn-gradient d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Nueva Empresa
            </Link>
          </div>
        </div>
      </div>

      {/* Estadísticas Cards */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">En Proceso</p>
                  <h3 className="fw-bold mb-0">{estadisticas.empresasEnProceso}</h3>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    +12% este mes
                  </small>
                </div>
                <div className="p-3 bg-primary rounded-circle bg-opacity-10">
                  <Clock className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">Enviadas a OB</p>
                  <h3 className="fw-bold mb-0">{estadisticas.empresasEnviadas}</h3>
                  <small className="text-info">Este mes</small>
                </div>
                <div className="p-3 bg-info rounded-circle bg-opacity-10">
                  <CheckCircle className="text-info" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">Total Mes</p>
                  <h3 className="fw-bold mb-0">{estadisticas.totalMes}</h3>
                  <small className="text-success">+5 vs mes anterior</small>
                </div>
                <div className="p-3 bg-success rounded-circle bg-opacity-10">
                  <Building2 className="text-success" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">Pendiente Revisión</p>
                  <h3 className="fw-bold mb-0">{estadisticas.pendienteRevision}</h3>
                  <small className="text-warning">Requieren atención</small>
                </div>
                <div className="p-3 bg-warning rounded-circle bg-opacity-10">
                  <AlertCircle className="text-warning" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Acciones Rápidas */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0 font-primary fw-semibold">
                Acciones Rápidas
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Link
                    to="/comercial/nueva-empresa"
                    className="card border-2 border-dashed border-primary text-decoration-none h-100"
                  >
                    <div className="card-body text-center p-4">
                      <Plus className="text-primary mb-2" size={32} />
                      <h6 className="card-title text-primary">Nueva Empresa</h6>
                      <p className="card-text small text-muted">
                        Iniciar proceso de registro de nueva empresa cliente
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="col-md-6">
                  <Link
                    to="/comercial/empresas-proceso"
                    className="card border text-decoration-none h-100"
                  >
                    <div className="card-body text-center p-4">
                      <Clock className="text-warning mb-2" size={32} />
                      <h6 className="card-title">Empresas en Proceso</h6>
                      <p className="card-text small text-muted">
                        Ver y continuar empresas en registro
                      </p>
                      {estadisticas.empresasEnProceso > 0 && (
                        <span className="badge bg-warning">
                          {estadisticas.empresasEnProceso}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>

                <div className="col-md-6">
                  <Link
                    to="/comercial/historial"
                    className="card border text-decoration-none h-100"
                  >
                    <div className="card-body text-center p-4">
                      <History className="text-info mb-2" size={32} />
                      <h6 className="card-title">Historial</h6>
                      <p className="card-text small text-muted">
                        Consultar empresas procesadas
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="col-md-6">
                  <Link
                    to="/comercial/notificaciones"
                    className="card border text-decoration-none h-100"
                  >
                    <div className="card-body text-center p-4">
                      <Bell className="text-success mb-2" size={32} />
                      <h6 className="card-title">Notificaciones</h6>
                      <p className="card-text small text-muted">
                        Avisos y alertas del sistema
                      </p>
                      {estadisticas.pendienteRevision > 0 && (
                        <span className="badge bg-danger">
                          {estadisticas.pendienteRevision}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tareas Pendientes */}
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0 font-primary fw-semibold">
                Tareas Pendientes
              </h5>
            </div>
            <div className="card-body">
              {tareasRecientes.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle size={48} className="text-success mb-2" />
                  <p className="text-muted small">
                    ¡Excelente! No hay tareas pendientes
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {tareasRecientes.map((tarea) => (
                    <div key={tarea.id} className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="small fw-semibold mb-1">
                          {tarea.empresa}
                        </h6>
                        <span className={`badge ${
                          tarea.prioridad === 'alta' ? 'bg-danger' :
                          tarea.prioridad === 'media' ? 'bg-warning' : 'bg-info'
                        }`}>
                          {tarea.prioridad}
                        </span>
                      </div>
                      <p className="small text-muted mb-2">
                        {tarea.descripcion}
                      </p>
                      <small className="text-muted">
                        {new Date(tarea.fecha).toLocaleDateString('es-CL')}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Empresas Recientes */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 font-primary fw-semibold">
                  Empresas Recientes
                </h5>
                <Link to="/dashboard" className="btn btn-sm btn-outline-primary">
                  Ver Todas
                </Link>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : empresasComercial.length === 0 ? (
                <div className="text-center py-4">
                  <Building2 size={48} className="text-muted mb-2" />
                  <p className="text-muted">No hay empresas en proceso</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Empresa</th>
                        <th>RUT</th>
                        <th>Empkey</th>
                        <th>Estado</th>
                        <th>Última Modificación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empresasComercial.slice(0, 5).map((empresa) => (
                        <tr key={empresa.empkey}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Building2 size={16} className="text-muted" />
                              {empresa.comercial?.datosGenerales?.nombre || 'Sin nombre'}
                            </div>
                          </td>
                          <td>
                            {empresa.comercial?.datosGenerales?.rut || 'Sin RUT'}
                          </td>
                          <td className="fw-bold text-primary">
                            {empresa.empkey}
                          </td>
                          <td>
                            <span className="badge bg-warning">
                              {empresa.estado}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {empresa.updated_at ? 
                                new Date(empresa.updated_at).toLocaleString('es-CL') : 
                                'N/A'
                              }
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Link
                                to={`/empresa/${empresa.empkey}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Ver
                              </Link>
                              <button className="btn btn-sm btn-outline-secondary">
                                Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComercialDashboard
