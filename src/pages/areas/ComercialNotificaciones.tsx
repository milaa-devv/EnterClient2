import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  Bell,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'

type EventoRow = {
  id: number
  tabla: string
  registro_id: string
  accion: 'INSERT' | 'UPDATE' | 'DELETE'
  cambios: any
  usuario: string | null
  fecha: string
}

const ComercialNotificaciones: React.FC = () => {
  const navigate = useNavigate()
  const { empresas, loading: loadingEmpresas, reload } = useEmpresaSearch()

  const [eventos, setEventos] = useState<EventoRow[]>([])
  const [loadingEventos, setLoadingEventos] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/comercial/dashboard')
  }

  const loadEventos = async () => {
    setLoadingEventos(true)
    setError(null)
    try {
      const sb = supabase as any
      const desde = new Date()
      desde.setDate(desde.getDate() - 14)

      const { data, error } = await sb
        .from('historial_movimientos')
        .select('*')
        .in('tabla', ['empresa', 'empresa_comercial', 'empresa_onboarding', 'empresa_sac'])
        .gte('fecha', desde.toISOString())
        .order('fecha', { ascending: false })
        .limit(120)

      if (error) throw error
      setEventos((data ?? []) as EventoRow[])
    } catch (err: any) {
      console.error(err)
      setError(err?.message ?? 'Error al cargar notificaciones')
    } finally {
      setLoadingEventos(false)
    }
  }

  useEffect(() => {
    loadEventos()
  }, [])

  const tareas = useMemo(() => {
    const conOB = empresas.filter((e: any) => e.empresa_onboarding)
    const pendientes = conOB.filter((e: any) => {
      const st = String(e.empresa_onboarding?.estado ?? '').toLowerCase()
      return st !== 'completado' && st !== 'finalizado'
    })

    return {
      totalOnboarding: conOB.length,
      pendientes: pendientes.slice(0, 8)
    }
  }, [empresas])

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h1 className="font-primary fw-bold mb-1 d-flex align-items-center gap-2">
                <Bell size={22} /> Notificaciones Comercial
              </h1>
              <p className="text-muted mb-0">
                Progresos recientes y tareas pendientes (últimos 14 días).
              </p>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleBack}
                type="button"
              >
                <ArrowLeft size={16} />
                Volver
              </button>

              <button
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={reload}
                disabled={loadingEmpresas}
                type="button"
              >
                <RefreshCw size={16} />
                Refrescar empresas
              </button>

              <button
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={loadEventos}
                disabled={loadingEventos}
                type="button"
              >
                <RefreshCw size={16} />
                Refrescar eventos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 font-primary fw-semibold">
                Tareas / Pendientes
              </h5>
            </div>

            <div className="card-body">
              {loadingEmpresas ? (
                <div className="text-center py-4 text-muted">
                  <Loader2 className="me-2" />
                  Cargando…
                </div>
              ) : tareas.totalOnboarding === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="text-success mb-2" />
                  <p className="text-muted mb-0">Sin empresas en onboarding todavía.</p>
                </div>
              ) : tareas.pendientes.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="text-success mb-2" />
                  <p className="text-muted mb-0">¡Todo al día! No hay pendientes.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {tareas.pendientes.map((e: any) => (
                    <div key={e.empkey} className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="small fw-semibold mb-0">
                          {e.nombre ?? e.nombre_fantasia ?? 'Empresa sin nombre'}
                        </h6>
                        <span className="badge bg-warning text-dark">
                          {e.empresa_onboarding?.estado ?? 'pendiente'}
                        </span>
                      </div>
                      <small className="text-muted d-block">
                        RUT: {e.rut ?? '—'} · Empkey: <span className="fw-bold">{e.empkey}</span>
                      </small>
                      <small className="text-muted d-block mt-1">
                        {e.empresa_onboarding?.encargado_name
                          ? `Encargado: ${e.empresa_onboarding.encargado_name}`
                          : 'Encargado: —'}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 font-primary fw-semibold">
                Eventos Recientes
              </h5>
            </div>

            <div className="card-body">
              {loadingEventos ? (
                <div className="text-center py-4 text-muted">
                  <Loader2 className="me-2" />
                  Cargando eventos…
                </div>
              ) : error ? (
                <div className="alert alert-danger mb-0">{error}</div>
              ) : eventos.length === 0 ? (
                <div className="text-center py-4">
                  <AlertTriangle size={40} className="text-warning mb-2" />
                  <p className="text-muted mb-0">No hay eventos recientes.</p>
                  <small className="text-muted">
                    Si esto queda siempre vacío, revisa que <code>historial_movimientos</code> se esté llenando.
                  </small>
                </div>
              ) : (
                <div className="list-group">
                  {eventos.slice(0, 40).map((ev) => (
                    <div key={ev.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="fw-semibold">
                          <Clock size={14} className="me-2 text-muted" />
                          {ev.tabla} · <span className="badge bg-secondary">{ev.accion}</span>
                        </div>
                        <small className="text-muted">
                          {new Date(ev.fecha).toLocaleString('es-CL')}
                        </small>
                      </div>
                      <div className="text-muted small">
                        registro_id: <span className="fw-bold">{ev.registro_id}</span>
                        {ev.usuario ? ` · usuario: ${ev.usuario}` : ''}
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

export default ComercialNotificaciones