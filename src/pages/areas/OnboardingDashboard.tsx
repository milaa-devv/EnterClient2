// src/pages/areas/OnboardingDashboard.tsx
import React from 'react'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Settings,
  Bell,
  TrendingUp,
  Building2
} from 'lucide-react'

const OnboardingDashboard: React.FC = () => {
  const { profile } = useAuth()
  const { isOnboardingAdmin, isOnboardingExecutive } = usePermissions()

  // Mock data para estadísticas
  const estadisticas = {
    solicitudesPendientes: 8,
    empresasEnProceso: 12,
    completadasMes: 25,
    asignacionesPendientes: 3
  }

  const solicitudesRecientes = [
    {
      id: 1,
      empresa: 'Tech Solutions S.A.',
      empkey: 12345,
      fechaRecepcion: '2025-09-21',
      prioridad: 'alta',
      asignado: null
    },
    {
      id: 2,
      empresa: 'Comercial Norte Ltda.',
      empkey: 12346,
      fechaRecepcion: '2025-09-20',
      prioridad: 'media',
      asignado: 'María González'
    }
  ]

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="font-primary fw-bold mb-1">
            Dashboard Onboarding
            {isOnboardingAdmin() && <span className="badge bg-info ms-2">Admin</span>}
          </h1>
          <p className="text-muted mb-0">
            Gestión del proceso de incorporación de empresas
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">Solicitudes Pendientes</p>
                  <h3 className="fw-bold mb-0">{estadisticas.solicitudesPendientes}</h3>
                  <small className="text-warning">Requieren asignación</small>
                </div>
                <div className="p-3 bg-warning rounded-circle bg-opacity-10">
                  <AlertTriangle className="text-warning" size={24} />
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
                  <p className="text-muted small mb-1">En Proceso</p>
                  <h3 className="fw-bold mb-0">{estadisticas.empresasEnProceso}</h3>
                  <small className="text-info">Siendo configuradas</small>
                </div>
                <div className="p-3 bg-info rounded-circle bg-opacity-10">
                  <Clock className="text-info" size={24} />
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
                  <p className="text-muted small mb-1">Completadas</p>
                  <h3 className="fw-bold mb-0">{estadisticas.completadasMes}</h3>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    Este mes
                  </small>
                </div>
                <div className="p-3 bg-success rounded-circle bg-opacity-10">
                  <CheckCircle className="text-success" size={24} />
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
                  <p className="text-muted small mb-1">Sin Asignar</p>
                  <h3 className="fw-bold mb-0">{estadisticas.asignacionesPendientes}</h3>
                  <small className="text-danger">Requieren atención</small>
                </div>
                <div className="p-3 bg-danger rounded-circle bg-opacity-10">
                  <Users className="text-danger" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on role */}
      {isOnboardingAdmin() ? (
        <OnboardingAdminContent solicitudes={solicitudesRecientes} />
      ) : (
        <OnboardingExecutiveContent />
      )}
    </div>
  )
}

const OnboardingAdminContent: React.FC<{ solicitudes: any[] }> = ({ solicitudes }) => (
  <div className="row g-4">
    <div className="col-lg-8">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Solicitudes Pendientes de Asignación</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Empkey</th>
                  <th>Fecha Recepción</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Building2 size={16} />
                        {solicitud.empresa}
                      </div>
                    </td>
                    <td className="fw-bold text-primary">{solicitud.empkey}</td>
                    <td>{new Date(solicitud.fechaRecepcion).toLocaleDateString('es-CL')}</td>
                    <td>
                      <span className={`badge ${
                        solicitud.prioridad === 'alta' ? 'bg-danger' :
                        solicitud.prioridad === 'media' ? 'bg-warning' : 'bg-info'
                      }`}>
                        {solicitud.prioridad}
                      </span>
                    </td>
                    <td>
                      {solicitud.asignado ? (
                        <span className="badge bg-success">Asignado</span>
                      ) : (
                        <span className="badge bg-warning">Sin Asignar</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary">Ver</button>
                        <button className="btn btn-sm btn-outline-success">Asignar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div className="col-lg-4">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Acciones Rápidas</h5>
        </div>
        <div className="card-body">
          <div className="d-grid gap-2">
            <button className="btn btn-primary">
              <Users className="me-2" size={16} />
              Asignar Ejecutivo
            </button>
            <button className="btn btn-outline-primary">
              <Settings className="me-2" size={16} />
              Configurar Empresa
            </button>
            <button className="btn btn-outline-success">
              <CheckCircle className="me-2" size={16} />
              Marcar como Revisado
            </button>
            <button className="btn btn-outline-info">
              <Bell className="me-2" size={16} />
              Ver Notificaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const OnboardingExecutiveContent: React.FC = () => (
  <div className="row g-4">
    <div className="col-lg-8">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Mis Empresas Asignadas</h5>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <Building2 size={48} className="text-muted mb-3" />
            <h6>No hay empresas asignadas</h6>
            <p className="text-muted">Las empresas asignadas aparecerán aquí</p>
          </div>
        </div>
      </div>
    </div>

    <div className="col-lg-4">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Mis Acciones</h5>
        </div>
        <div className="card-body">
          <div className="d-grid gap-2">
            <button className="btn btn-primary">
              <Settings className="me-2" size={16} />
              Configurar Empresa
            </button>
            <button className="btn btn-outline-success">
              <CheckCircle className="me-2" size={16} />
              Completar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default OnboardingDashboard
