import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, Bell } from 'lucide-react'

type NotiTipo =
  | 'llego_ob'
  | 'asignado_ejecutivo'
  | 'inicio_configuracion'
  | 'inicio_pap'
  | 'enviado_sac'

interface NotificacionRow {
  id: number
  empkey: number
  tipo: NotiTipo
  descripcion: string | null
  visto: boolean
  created_at: string
  rut?: string | null
  nombre?: string | null
}

const TIPO_LABEL: Record<NotiTipo, string> = {
  llego_ob: 'Empresa llegó a Onboarding',
  asignado_ejecutivo: 'Asignación de ejecutivo',
  inicio_configuracion: 'Inicio de configuración',
  inicio_pap: 'Inicio de PAP',
  enviado_sac: 'Enviado a SAC'
}

const OnboardingNotificaciones: React.FC = () => {
  const [rows, setRows] = useState<NotificacionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filtroVisto, setFiltroVisto] = useState<'todas' | 'no_vistas' | 'vistas'>(
    'no_vistas'
  )
  const [filtroTipo, setFiltroTipo] = useState<'todos' | NotiTipo>('todos')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const sb = supabase as any

        const { data, error } = await sb
          .from('onboarding_notificacion')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const notifs: NotificacionRow[] = data ?? []

        // Traer nombres de empresa
        const empkeys = Array.from(new Set(notifs.map((n) => n.empkey))).filter(
          (x) => x != null
        )

        let empresasMap = new Map<number, { rut: string | null; nombre: string | null }>()

        if (empkeys.length > 0) {
          const { data: empresasData, error: empError } = await sb
            .from('empresa')
            .select('empkey, rut, nombre')
            .in('empkey', empkeys)

          if (empError) throw empError

          empresasMap = new Map(
            (empresasData ?? []).map((e: any) => [
              e.empkey as number,
              { rut: e.rut as string | null, nombre: e.nombre as string | null }
            ])
          )
        }

        const merged: NotificacionRow[] = notifs.map((n) => {
          const emp = empresasMap.get(n.empkey) ?? { rut: null, nombre: null }
          return {
            ...n,
            rut: emp.rut,
            nombre: emp.nombre
          }
        })

        setRows(merged)
      } catch (err: any) {
        console.error(err)
        setError(err.message ?? 'Error al cargar notificaciones')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtradas = useMemo(
    () =>
      rows.filter((n) => {
        if (filtroVisto === 'no_vistas' && n.visto) return false
        if (filtroVisto === 'vistas' && !n.visto) return false
        if (filtroTipo !== 'todos' && n.tipo !== filtroTipo) return false
        return true
      }),
    [rows, filtroVisto, filtroTipo]
  )

  const marcarComoVisto = async (id: number) => {
    try {
      const sb = supabase as any
      const { error } = await sb
        .from('onboarding_notificacion')
        .update({ visto: true })
        .eq('id', id)

      if (error) throw error

      setRows((prev) => prev.map((n) => (n.id === id ? { ...n, visto: true } : n)))
    } catch (err) {
      console.error(err)
      alert('No se pudo marcar como visto.')
    }
  }

  if (loading) {
    return (
      <div className="container-fluid py-4 text-center">
        <Loader2 className="mb-2" size={32} />
        <p className="text-muted">Cargando notificaciones…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-3 d-flex align-items-center gap-2">
        <Bell size={22} />
        <div>
          <h1 className="h4 mb-0 font-primary">Notificaciones de Onboarding</h1>
          <p className="text-muted mb-0">
            Avisos cuando una empresa llega a OB, se asigna a un ejecutivo, inicia
            configuración, PAP o se envía a SAC.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-3">
        <div className="card-body row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Mostrar</label>
            <select
              className="form-select"
              value={filtroVisto}
              onChange={(e) => setFiltroVisto(e.target.value as any)}
            >
              <option value="no_vistas">Solo no vistas</option>
              <option value="todas">Todas</option>
              <option value="vistas">Solo vistas</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Tipo de evento</label>
            <select
              className="form-select"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
            >
              <option value="todos">Todos</option>
              <option value="llego_ob">Llegó a OB</option>
              <option value="asignado_ejecutivo">Asignación de ejecutivo</option>
              <option value="inicio_configuracion">Inicio configuración</option>
              <option value="inicio_pap">Inicio PAP</option>
              <option value="enviado_sac">Enviado a SAC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5 text-muted">
            No hay notificaciones con los filtros seleccionados.
          </div>
        </div>
      ) : (
        <div className="list-group">
          {filtradas.map((n) => (
            <div
              key={n.id}
              className={
                'list-group-item d-flex justify-content-between align-items-start ' +
                (n.visto ? '' : 'list-group-item-warning')
              }
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-light text-dark border">
                    {TIPO_LABEL[n.tipo]}
                  </span>
                  <span className="small text-muted">
                    {new Date(n.created_at).toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="fw-semibold">
                  {n.rut ? `${n.rut} — ` : ''}
                  {n.nombre ?? 'Empresa sin nombre'}
                </div>
                {n.descripcion && (
                  <div className="text-muted small mt-1">{n.descripcion}</div>
                )}
              </div>

              {!n.visto && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => marcarComoVisto(n.id)}
                >
                  Marcar como visto
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OnboardingNotificaciones
