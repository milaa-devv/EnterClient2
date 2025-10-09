import React from 'react'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Settings,
  TrendingUp,
  Building2
} from 'lucide-react'

const SacDashboard: React.FC = () => {
  const { profile } = useAuth()
  const { isSacAdmin, isSacExecutive } = usePermissions()

  const estadisticas = {
    solicitudesPendientes: 6,
    empresasEnSac: 8,
    papCompletados: 15,
    pendientesRevision: 2
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="font-primary fw-bold mb-1">
            Dashboard SAC
            {isSacAdmin() && <span className="badge bg-success ms-2">Admin</span>}
          </h1>
          <p className="text-muted mb-0">
            Sistema de Atención al Cliente - Configuración PAP
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
                  <small className="text-warning">Desde Onboarding</small>
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
                  <p className="text-muted small mb-1">En SAC</p>
                  <h3 className="fw-bold mb-0">{estadisticas.empresasEnSac}</h3>
                  <small className="text-info">En configuración PAP</small>
                </div>
                <div className="p-3 bg-info rounded-circle bg-opacity-10">
                  <Settings className="text-info" size={24} />
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
                  <p className="text-muted small mb-1">PAP Completados</p>
                  <h3 className="fw-bold mb-0">{estadisticas.papCompletados}</h3>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    Este mes
                  </small>
                </div>
                <div className="p-3 bg-success rounded-circle bg-opacity-10">
                  <FileCheck className="text-success" size={24} />
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
                  <h3 className="fw-bold mb-0">{estadisticas.pendientesRevision}</h3>
                  <small className="text-danger">Requieren atención</small>
                </div>
                <div className="p-3 bg-danger rounded-circle bg-opacity-10">
                  <CheckCircle className="text-danger" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on role */}
      {isSacAdmin() ? <SacAdminContent /> : <SacExecutiveContent />}
    </div>
  )
}

const SacAdminContent: React.FC = () => (
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
                  <th>Fecha desde OB</th>
                  <th>Casilla</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Building2 size={16} />
                      Tech Solutions S.A.
                    </div>
                  </td>
                  <td className="fw-bold text-primary">12345</td>
                  <td>21/09/2025</td>
                  <td>CAS-12345</td>
                  <td><span className="badge bg-warning">Sin Asignar</span></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary">Ver</button>
                      <button className="btn btn-sm btn-outline-success">Asignar</button>
                    </div>
                  </td>
                </tr>
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
              Asignar Ejecutivo SAC
            </button>
            <button className="btn btn-outline-primary">
              <FileCheck className="me-2" size={16} />
              Revisar PAP
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const SacExecutiveContent: React.FC = () => (
  <div className="row g-4">
    <div className="col-lg-8">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Mis Empresas Asignadas</h5>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <FileCheck size={48} className="text-muted mb-3" />
            <h6>No hay empresas asignadas</h6>
            <p className="text-muted">Las empresas para configurar PAP aparecerán aquí</p>
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
              <FileCheck className="me-2" size={16} />
              Completar PAP
            </button>
            <button className="btn btn-outline-warning">
              <AlertTriangle className="me-2" size={16} />
              Solicitar Revisión
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default SacDashboard
