// src/pages/areas/OnboardingAdminDashboard.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  Activity,
  Inbox,
  Clock,
  CheckCircle2,
  Bell,
  ArrowRight,
  Users
} from 'lucide-react'

type OnboardingEstado = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

interface EmpresaOnboardingResumen {
  empkey: number
  rut: string | null
  nombre: string | null
  producto: string | null
  estado: OnboardingEstado
  encargado_name: string | null
  encargado_rut: string | null
}

const OnboardingAdminDashboard: React.FC = () => {
  const [empresas, setEmpresas] = useState<EmpresaOnboardingResumen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  // ===== Carga de datos desde Supabase =====
  useEffect(() => {
    const load = async () => {
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
              encargado_name,
              encargado_rut
            ),
            empresa_producto (
              producto:producto ( tipo )
            )
          `)

        if (error) throw error

        const rows: EmpresaOnboardingResumen[] =
          ((data as any[] | null) ?? []).flatMap((row: any) => {
            const obArr = row.empresa_onboarding as any[] | null
            if (!obArr || obArr.length === 0) return []

            const ob = obArr[0]
            const prodRel = row.empresa_producto?.[0]?.producto

            return {
              empkey: row.empkey as number,
              rut: row.rut as string | null,
              nombre: row.nombre as string | null,
              producto: (prodRel?.tipo as string | null) ?? null,
              estado: (ob.estado as OnboardingEstado) ?? 'pendiente',
              encargado_name: (ob.encargado_name as string | null) ?? null,
              encargado_rut: (ob.encargado_rut as string | null) ?? null
            }
          })

        setEmpresas(rows)
      } catch (err: any) {
        console.error(err)
        setError(err.message ?? 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // ===== Métricas =====
  const totalOnboarding = empresas.length

  const sinAsignar = empresas.filter(
    (e) => !e.encargado_rut && !e.encargado_name
  )
  const countSinAsignar = sinAsignar.length

  const pendientes = empresas.filter((e) => e.estado === 'pendiente').length
  const enProceso = empresas.filter((e) => e.estado === 'en_proceso').length
  const completadas = empresas.filter((e) => e.estado === 'completado').length

  const flujoPct =
    totalOnboarding > 0
      ? Math.round((completadas / totalOnboarding) * 100)
      : 0

  const totalConfigPAP = pendientes + enProceso

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h4 mb-1 font-primary">Dashboard Onboarding (Admin)</h1>
          <p className="text-muted mb-0">
            Resumen general de empresas en Onboarding y carga por ejecutivo.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => navigate('/onboarding/asignar-ejecutivos')}
        >
          <Users size={18} />
          <span>Gestión de Ejecutivos</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-3">
          {error}
        </div>
      )}

      {/* Top: tarjetas de métricas */}
      <div className="row g-3 mb-4">
        {/* Empresas en Onboarding */}
        <div className="col-md-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted text-uppercase fw-semibold">
                  Empresas en Onboarding
                </small>
                <Activity size={18} className="text-muted" />
              </div>
              <div className="display-6 mb-0">{totalOnboarding}</div>
              <small className="text-muted">Con ficha de Onboarding</small>
            </div>
          </div>
        </div>

        {/* Bandeja de solicitudes */}
        <div className="col-md-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted text-uppercase fw-semibold">
                  Bandeja de solicitudes
                </small>
                <Inbox size={18} className="text-warning" />
              </div>
              <div className="display-6 mb-0">{countSinAsignar}</div>
              <small className="text-muted">Sin ejecutivo asignado</small>
            </div>
          </div>
        </div>

        {/* En configuración / PAP */}
        <div className="col-md-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted text-uppercase fw-semibold">
                  En configuración / PAP
                </small>
                <Clock size={18} className="text-info" />
              </div>
              <div className="display-6 mb-0">{totalConfigPAP}</div>
              <small className="text-muted d-block">
                Pendientes: {pendientes} · En proceso: {enProceso}
              </small>
            </div>
          </div>
        </div>

        {/* % flujo completado */}
        <div className="col-md-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted text-uppercase fw-semibold">
                  % flujo completado
                </small>
                <CheckCircle2 size={18} className="text-success" />
              </div>
              <div className="d-flex align-items-baseline gap-2">
                <span className="h3 mb-0">{flujoPct}%</span>
              </div>
              <div className="progress mt-2" style={{ height: 6 }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${flujoPct}%` }}
                  aria-valuenow={flujoPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <small className="text-muted d-block mt-1">
                Completadas: {completadas}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda parte: Mis acciones + Empresas sin asignar */}
      <div className="row g-4">
        {/* Mis acciones */}
        <div className="col-lg-8">
          <h6 className="mb-3">Mis acciones</h6>
          <div className="row g-3">
            {/* Bandeja de solicitudes */}
            <div className="col-md-4">
              <button
                type="button"
                className="card h-100 w-100 text-start border-0 shadow-sm btn p-0"
                onClick={() => navigate('/onboarding/solicitudes-pendientes')}
              >
                <div className="card-body">
                  <div className="rounded-circle bg-warning bg-opacity-10 text-warning d-inline-flex p-2 mb-2">
                    <Inbox size={18} />
                  </div>
                  <h6 className="mb-1">📥 Bandeja de solicitudes</h6>
                  <small className="text-muted">
                    Ver empresas sin ejecutivo asignado.
                  </small>
                  <div className="mt-2 text-primary small d-flex align-items-center gap-1">
                    Ir al detalle <ArrowRight size={14} />
                  </div>
                </div>
              </button>
            </div>

            {/* Empresas en Proceso */}
            <div className="col-md-4">
              <button
                type="button"
                className="card h-100 w-100 text-start border-0 shadow-sm btn p-0"
                onClick={() => navigate('/onboarding/empresas-proceso')}
              >
                <div className="card-body">
                  <div className="rounded-circle bg-info bg-opacity-10 text-info d-inline-flex p-2 mb-2">
                    <Clock size={18} />
                  </div>
                  <h6 className="mb-1">Empresas en Proceso</h6>
                  <small className="text-muted">
                    Seguimiento de avance por ejecutivo.
                  </small>
                  <div className="mt-2 text-primary small d-flex align-items-center gap-1">
                    Ver tablero <ArrowRight size={14} />
                  </div>
                </div>
              </button>
            </div>

            {/* Notificaciones */}
            <div className="col-md-4">
              <button
                type="button"
                className="card h-100 w-100 text-start border-0 shadow-sm btn p-0"
                onClick={() => navigate('/onboarding/notificaciones')}
              >
                <div className="card-body">
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex p-2 mb-2">
                    <Bell size={18} />
                  </div>
                  <h6 className="mb-1">Notificaciones</h6>
                  <small className="text-muted">
                    Cambios recientes en Onboarding.
                  </small>
                  <div className="mt-2 text-primary small d-flex align-items-center gap-1">
                    Revisar eventos <ArrowRight size={14} />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Columna derecha: Empresas sin asignar */}
        <div className="col-lg-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Empresas sin asignar</h6>
            <button
              type="button"
              className="btn btn-link btn-sm p-0"
              onClick={() => navigate('/onboarding/solicitudes-pendientes')}
            >
              Ver todas
            </button>
          </div>

          {sinAsignar.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-muted small">
                No hay empresas sin ejecutivo asignado.
              </div>
            </div>
          ) : (
            sinAsignar.slice(0, 4).map((e) => (
              <div key={e.empkey} className="card border-0 shadow-sm mb-2">
                <div className="card-body py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">
                        {e.nombre || 'Sin nombre'}
                      </div>
                      <div className="text-muted small">{e.rut}</div>
                      <div className="mt-1 small">
                        <span className="badge bg-warning bg-opacity-10 text-warning me-1">
                          Sin ejecutivo
                        </span>
                        {e.producto && (
                          <span className="badge bg-light text-muted border">
                            {e.producto}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate('/onboarding/asignar-ejecutivos')}
                    >
                      Asignar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {loading && (
        <div className="text-muted small mt-3">Actualizando datos…</div>
      )}
    </div>
  )
}

export default OnboardingAdminDashboard
