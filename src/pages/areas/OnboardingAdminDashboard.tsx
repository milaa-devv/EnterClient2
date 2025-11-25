import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Building2, 
  Users,
  Bell
} from 'lucide-react'
import { formatRut } from '@/lib/utils'


interface EmpresaOnboardingRow {
  empkey: number
  rut: string | null
  nombre: string | null
  estado_onboarding: string | null
  encargado: string | null
}

const OnboardingAdminDashboard: React.FC = () => {
  const [empresas, setEmpresas] = useState<EmpresaOnboardingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEmpresas = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('empresa')
        .select(`
          empkey,
          rut,
          nombre,
          empresa_onboarding (
            estado,
            encargado_name
          )
        `)

      if (error) throw error

      const mapped: EmpresaOnboardingRow[] = (data || []).map((e: any) => ({
        empkey: e.empkey,
        rut: e.rut ?? null,
        nombre: e.nombre ?? null,
        estado_onboarding: e.empresa_onboarding?.estado ?? null,
        encargado: e.empresa_onboarding?.encargado_name ?? null
      }))

      setEmpresas(mapped)
    } catch (err: any) {
      console.error(err)
      setError('Error al cargar empresas de Onboarding: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmpresas()
  }, [])

  const sinAsignar = empresas.filter(
    e => !e.estado_onboarding || e.estado_onboarding === 'pendiente' || !e.encargado
  )

  const enProceso = empresas.filter(
    e => e.estado_onboarding === 'en_proceso'
  )

  const completadas = empresas.filter(
    e => e.estado_onboarding === 'completado'
  )

  const totalOnboarding = empresas.length

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="font-primary fw-bold mb-1">
                Dashboard Onboarding – Admin
              </h1>
              <p className="text-muted mb-0">
                Vista general de empresas en Onboarding, asignación y avance
              </p>
            </div>

            <Link
              to="/onboarding/solicitudes-pendientes"
              className="btn btn-gradient d-flex align-items-center gap-2"
            >
              <Users size={18} />
              Asignar Ejecutivo
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Cards estadísticas */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">Sin Asignar</p>
                  <h3 className="fw-bold mb-0">{sinAsignar.length}</h3>
                  <small className="text-warning">
                    Empresas listas desde Comercial
                  </small>
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
                  <h3 className="fw-bold mb-0">{enProceso.length}</h3>
                  <small className="text-info">Configuración en curso</small>
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
                  <h3 className="fw-bold mb-0">{completadas.length}</h3>
                  <small className="text-success">Listas para PAP / SAC</small>
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
                  <p className="text-muted small mb-1">Total Onboarding</p>
                  <h3 className="fw-bold mb-0">{totalOnboarding}</h3>
                  <small className="text-muted">Todas las empresas con ficha OB</small>
                </div>
                <div className="p-3 bg-primary rounded-circle bg-opacity-10">
                  <Building2 className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mis Acciones + Empresas en proceso */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0 font-primary fw-semibold">
                Mis Acciones
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <Link
                    to="/onboarding/solicitudes-pendientes"
                    className="card border-2 border-dashed border-warning text-decoration-none h-100"
                  >
                    <div className="card-body text-center p-4">
                      <AlertTriangle className="text-warning mb-2" size={32} />
                      <h6 className="card-title text-warning">Solicitudes Pendientes</h6>
                      <p className="card-text small text-muted">
                        Ver empresas sin ejecutivo asignado
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="col-md-4">
                  <Link
                    to="/onboarding/empresas-proceso"
                    className="card border text-decoration-none h-100"
                  >
                    <div className="card-body text-center p-4">
                      <Clock className="text-info mb-2" size={32} />
                      <h6 className="card-title">Empresas en Proceso</h6>
                      <p className="card-text small text-muted">
                        Seguimiento de avance por ejecutivo
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="col-md-4">
                  <Link
                    to="/onboarding/notificaciones"
                    className="card border text-decoration-none h-100"
                  >
                    <div className="card-body text-center p-4">
                      <Bell className="text-primary mb-2" size={32} />
                      <h6 className="card-title">Notificaciones</h6>
                      <p className="card-text small text-muted">
                        Cambios recientes en Onboarding
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empresas sin asignar resumen */}
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0 font-primary fw-semibold">
                Empresas sin Asignar
              </h5>
              <Link to="/onboarding/solicitudes-pendientes" className="btn btn-sm btn-outline-secondary">
                Ver todas
              </Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : sinAsignar.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle size={32} className="text-success mb-2" />
                  <p className="text-muted small mb-0">
                    No hay empresas pendientes de asignación
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {sinAsignar.slice(0, 5).map((e) => (
                    <div key={e.empkey} className="border rounded p-2 small">
                      <div className="fw-semibold text-truncate">
                        {e.nombre || 'Sin nombre'}
                      </div>
                      <div className="text-muted">
                        {e.rut ? formatRut(e.rut) : 'Sin RUT'}
                      </div>
                      <div className="mt-1">
                        <span className="badge bg-warning-subtle text-warning">
                          Sin ejecutivo asignado
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingAdminDashboard
