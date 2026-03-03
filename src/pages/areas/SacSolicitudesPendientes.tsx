import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, UserRound, Users } from 'lucide-react'
import { BackButton } from '@/components/BackButton'
import { usePermissions } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type EjecutivoSAC = {
  rut: string
  nombre: string
}

type PapRow = {
  id: number
  empkey: number
  estado: string
  created_at: string
  enviado_a_sac_at: string | null
  empresa:
    | {
        empkey: number
        nombre: string | null
        producto: string | null
      }
    | null
}

// Alias para no pelear con los tipos en joins
const sb = supabase as any

function fmtFecha(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-CL')
  } catch {
    return String(iso)
  }
}

function productoLabel(p?: string | null) {
  if (p === 'ENTERFAC') return 'Enterfact'
  if (p === 'ANDESPOS') return 'AndesPOS'
  return p ?? '—'
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.4)',
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
      onMouseDown={onClose}
    >
      <div
        className="card shadow"
        style={{ width: 'min(1100px, 96vw)', maxHeight: '85vh', overflow: 'hidden' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="card-header d-flex align-items-center justify-content-between">
          <strong>{title}</strong>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="card-body" style={{ overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

const SacSolicitudesPendientes: React.FC = () => {
  const navigate = useNavigate()
  const { isSacAdmin } = usePermissions()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [ejecutivos, setEjecutivos] = useState<EjecutivoSAC[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<EjecutivoSAC | null>(null)
  const [papLoading, setPapLoading] = useState(false)
  const [papRows, setPapRows] = useState<PapRow[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)

  const cards = useMemo(
    () =>
      ejecutivos.map((e, i) => ({
        e,
        hue: (i * 55) % 360,
        papCount: counts[e.rut] ?? 0,
      })),
    [ejecutivos, counts]
  )

  const loadEjecutivosAndCounts = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!isSacAdmin()) {
        setError('No tienes permisos para ver esta sección.')
        setEjecutivos([])
        setCounts({})
        return
      }

      // 1) Buscar id del perfil "SAC" (ejecutivo SAC)
      const { data: perfilData, error: perfilErr } = await supabase
        .from('perfil_usuarios')
        .select('id')
        .eq('nombre', 'SAC')
        .single()

      if (perfilErr) throw perfilErr
      const sacPerfilId = perfilData?.id
      if (!sacPerfilId) {
        setEjecutivos([])
        setCounts({})
        return
      }

      // 2) Traer usuarios con perfil_id = SAC
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuario')
        .select('rut,nombre')
        .eq('perfil_id', sacPerfilId)
        .order('nombre', { ascending: true })

      if (usuariosError) throw usuariosError

      const execs: EjecutivoSAC[] = (usuariosData ?? [])
        .filter((u: any) => !!u?.rut)
        .map((u: any) => ({
          rut: String(u.rut),
          nombre: String(u.nombre ?? u.rut),
        }))

      setEjecutivos(execs)

      if (execs.length === 0) {
        setCounts({})
        return
      }

      // Conteo PAP por ejecutivo (pendiente/asignada/en_proceso)
      const ruts = execs.map((e) => e.rut)

      const { data: papsData, error: papsError } = await sb
        .from('pap_solicitud')
        .select('asignado_a_rut, estado')
        .in('estado', ['pendiente', 'asignada', 'en_proceso'])
        .in('asignado_a_rut', ruts)

      if (papsError) throw papsError

      const map: Record<string, number> = {}
      for (const r of papsData ?? []) {
        const rut = r.asignado_a_rut as string | null
        if (!rut) continue
        map[rut] = (map[rut] ?? 0) + 1
      }
      setCounts(map)
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? 'Error cargando ejecutivos.')
    } finally {
      setLoading(false)
    }
  }

  const openAsignar = async (ej: EjecutivoSAC) => {
    setSelected(ej)
    setModalOpen(true)
    setPapLoading(true)
    setError(null)

    try {
      const { data, error } = await sb
        .from('pap_solicitud')
        .select(
          `
            id, empkey, estado, created_at, enviado_a_sac_at,
            empresa:empresa!pap_solicitud_empkey_fkey(empkey,nombre,producto)
          `
        )
        .eq('estado', 'pendiente')
        .is('asignado_a_rut', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPapRows((data ?? []) as PapRow[])
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? 'Error cargando solicitudes pendientes.')
      setPapRows([])
    } finally {
      setPapLoading(false)
    }
  }

  const asignarPap = async (papId: number) => {
    if (!selected) return
    setSavingId(papId)
    setError(null)

    try {
      const { error } = await sb
        .from('pap_solicitud')
        .update({
          asignado_a_rut: selected.rut,
          estado: 'asignada',
        })
        .eq('id', papId)

      if (error) throw error

      setPapRows((prev) => prev.filter((p) => p.id !== papId))
      setCounts((prev) => ({
        ...prev,
        [selected.rut]: (prev[selected.rut] ?? 0) + 1,
      }))
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? 'No se pudo asignar el PAP (RLS/permiso).')
    } finally {
      setSavingId(null)
    }
  }

  useEffect(() => {
    loadEjecutivosAndCounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const title = selected ? `Asignar solicitudes a: ${selected.nombre}` : 'Asignar solicitudes'

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/sac/mis-empresas" />
          <div>
            <h1 className="h4 mb-1 font-primary fw-bold">Solicitudes Pendientes</h1>
            <p className="text-muted mb-0">Asigna solicitudes PAP pendientes a ejecutivos SAC.</p>
          </div>
        </div>

        <button
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
          onClick={loadEjecutivosAndCounts}
          disabled={loading}
        >
          {loading ? <Loader2 size={16} className="spin" /> : <Users size={16} />}
          Actualizar
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Loader2 className="mb-2 spin" size={32} />
          <p className="text-muted mb-0">Cargando ejecutivos…</p>
        </div>
      ) : ejecutivos.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <Users size={48} className="text-muted mb-3" />
            <h5 className="mb-2">No hay ejecutivos SAC</h5>
            <p className="text-muted mb-0">
              Revisa que existan usuarios con perfil <code>SAC</code> en la tabla <code>usuario</code>.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {cards.map(({ e, hue, papCount }) => (
            <div className="col-12 col-md-6 col-xl-4" key={e.rut}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3 min-width-0">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 56,
                        height: 56,
                        background: `hsla(${hue}, 75%, 55%, .14)`,
                        border: `1px solid hsla(${hue}, 75%, 55%, .25)`,
                      }}
                    >
                      <UserRound size={28} style={{ color: `hsl(${hue}, 75%, 45%)` }} />
                    </div>

                    <div className="min-width-0">
                      <div className="fw-bold text-truncate">{e.nombre}</div>
                      <div className="text-muted small">Ejecutivo SAC</div>
                      <div className="small mt-1">
                        <span className="text-muted">Cant. de PAP:</span>{' '}
                        <span className="fw-bold">{papCount}</span>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-primary rounded-pill px-4" onClick={() => openAsignar(e)}>
                    Asignar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={title} onClose={() => setModalOpen(false)}>
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <div className="text-muted small">
            Mostrando solicitudes PAP con estado <span className="fw-bold">pendiente</span> y sin asignación.
          </div>
          <button
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
            onClick={() => selected && openAsignar(selected)}
            disabled={papLoading}
          >
            {papLoading ? <Loader2 size={14} className="spin" /> : <Users size={14} />}
            Refrescar
          </button>
        </div>

        {papLoading ? (
          <div className="text-center py-4">
            <Loader2 className="spin" size={28} />
            <div className="text-muted mt-2">Cargando solicitudes…</div>
          </div>
        ) : papRows.length === 0 ? (
          <div className="alert alert-info mb-0">No hay solicitudes pendientes sin asignar 🎉</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Empkey</th>
                  <th>Empresa</th>
                  <th>Fecha PAP</th>
                  <th>Producto</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {papRows.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-bold text-primary">{p.empkey}</td>
                    <td>{p.empresa?.nombre ?? '—'}</td>
                    <td>{fmtFecha(p.enviado_a_sac_at ?? p.created_at)}</td>
                    <td>{productoLabel(p.empresa?.producto)}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/sac/empresa/${p.empkey}`)}
                        >
                          Ver
                        </button>
                        <button
                          className="btn btn-sm btn-success d-inline-flex align-items-center gap-2"
                          onClick={() => asignarPap(p.id)}
                          disabled={savingId === p.id}
                        >
                          {savingId === p.id && <Loader2 size={14} className="spin" />}
                          Asignar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SacSolicitudesPendientes