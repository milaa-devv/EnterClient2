import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Users,
  Settings,
  TrendingUp,
  Building2,
  Loader2,
  AlertCircle,
  UserRound,
} from 'lucide-react'

// Alias para no pelear con tipos en joins / vistas
const sb = supabase as any

// ✅ En tu BD perfil_usuarios.nombre es "SAC" (no "Ejecutivo SAC")
const PERFIL_SAC_NOMBRE = 'SAC'

type EjecutivoSAC = {
  rut: string
  nombre: string
}

type PapPendienteRow = {
  id: number
  empkey: number
  estado: string
  created_at: string
  enviado_a_sac_at: string | null
  asignado_a_rut?: string | null
  empresa:
    | {
        empkey: number
        rut?: string | null
        nombre: string | null
        producto: string | null
      }
    | null
}

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

const SacDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { isSacAdmin } = usePermissions()

  // (puedes reemplazar esto por stats reales luego)
  const estadisticas = {
    solicitudesPendientes: 6,
    empresasEnSac: 8,
    papCompletados: 15,
    pendientesRevision: 2,
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
          <p className="text-muted mb-0">Sistema de Atención al Cliente - Configuración PAP</p>
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

      {isSacAdmin() ? <SacAdminContent /> : <SacExecutiveContent onCompletarPap={() => navigate('/sac/pap')} />}
    </div>
  )
}

const SacAdminContent: React.FC = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [ejecutivos, setEjecutivos] = useState<EjecutivoSAC[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})

  const [rows, setRows] = useState<PapPendienteRow[]>([])

  // Modal “Acciones rápidas” (2 pasos: elegir ejecutivo -> asignar solicitudes)
  const [quickOpen, setQuickOpen] = useState(false)
  const [selectedEj, setSelectedEj] = useState<EjecutivoSAC | null>(null)
  const [papLoading, setPapLoading] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)

  // Modal “Asignar” por fila (de la tabla)
  const [assignRowOpen, setAssignRowOpen] = useState(false)
  const [rowToAssign, setRowToAssign] = useState<PapPendienteRow | null>(null)

  const cards = useMemo(
    () =>
      ejecutivos.map((e, i) => ({
        e,
        hue: (i * 55) % 360,
        papCount: counts[e.rut] ?? 0,
      })),
    [ejecutivos, counts]
  )

  // ✅ helper: conseguir el perfil_id de "SAC"
  const getPerfilSacId = async (): Promise<number> => {
    // intentamos por nombre, y si RLS no deja, caemos a 3 (según tu screenshot)
    try {
      const { data, error } = await sb
        .from('perfil_usuarios')
        .select('id')
        .eq('nombre', PERFIL_SAC_NOMBRE)
        .single()
      if (error) throw error
      if (typeof data?.id === 'number') return data.id
    } catch (e) {
      // fallback (tu BD muestra SAC = 3)
      return 3
    }
    return 3
  }

  const loadEjecutivosAndCounts = async () => {
    setError(null)

    const sacPerfilId = await getPerfilSacId()

    // ✅ Ejecutivos SAC: usuario.perfil_id = id del perfil "SAC"
    const { data: usuariosData, error: usuariosError } = await sb
      .from('usuario')
      .select('rut,nombre,perfil_id')
      .eq('perfil_id', sacPerfilId)
      .order('nombre', { ascending: true })

    if (usuariosError) throw usuariosError

    const execs: EjecutivoSAC[] = (usuariosData ?? []).map((u: any) => ({
      rut: u.rut as string,
      nombre: u.nombre as string,
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
  }

  const loadPendientes = async () => {
    setError(null)

    // PAP pendientes SIN asignar (para la tabla del dashboard)
    const { data, error: qError } = await sb
      .from('pap_solicitud')
      .select(
        `
        id, empkey, estado, created_at, enviado_a_sac_at, asignado_a_rut,
        empresa:empresa!pap_solicitud_empkey_fkey(empkey,rut,nombre,producto)
      `
      )
      .eq('estado', 'pendiente')
      .is('asignado_a_rut', null)
      .order('created_at', { ascending: false })
      .limit(8)

    if (qError) throw qError
    setRows((data ?? []) as PapPendienteRow[])
  }

  const refreshAll = async () => {
    setLoading(true)
    setError(null)
    try {
      await loadEjecutivosAndCounts()
      await loadPendientes()
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? 'Error cargando información.')
      setRows([])
      setEjecutivos([])
      setCounts({})
    } finally {
      setLoading(false)
    }
  }

  const openQuickAssign = async () => {
    setQuickOpen(true)
    setSelectedEj(null)
  }

  const pickEjecutivoForQuick = async (ej: EjecutivoSAC) => {
    setSelectedEj(ej)
    setPapLoading(true)
    setError(null)

    try {
      const { data, error } = await sb
        .from('pap_solicitud')
        .select(
          `
          id, empkey, estado, created_at, enviado_a_sac_at, asignado_a_rut,
          empresa:empresa!pap_solicitud_empkey_fkey(empkey,rut,nombre,producto)
        `
        )
        .eq('estado', 'pendiente')
        .is('asignado_a_rut', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRows((data ?? []) as PapPendienteRow[])
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? 'Error cargando solicitudes pendientes.')
      setRows([])
    } finally {
      setPapLoading(false)
    }
  }

  const asignarPap = async (papId: number, ejecutivoRut: string) => {
    setSavingId(papId)
    setError(null)

    try {
      const { error } = await sb
        .from('pap_solicitud')
        .update({ asignado_a_rut: ejecutivoRut, estado: 'asignada' })
        .eq('id', papId)

      if (error) throw error

      // UI: sacar del listado
      setRows((prev) => prev.filter((p) => p.id !== papId))
      setCounts((prev) => ({
        ...prev,
        [ejecutivoRut]: (prev[ejecutivoRut] ?? 0) + 1,
      }))
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? 'No se pudo asignar el PAP (RLS/permiso).')
    } finally {
      setSavingId(null)
    }
  }

  const openAssignForRow = (row: PapPendienteRow) => {
    setRowToAssign(row)
    setAssignRowOpen(true)
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const titleQuick = !selectedEj ? 'Asignar Ejecutivo SAC' : `Asignar solicitudes a: ${selectedEj.nombre}`
  const titleRow = rowToAssign
    ? `Asignar Empkey ${rowToAssign.empkey} (${rowToAssign.empresa?.nombre ?? '—'})`
    : 'Asignar solicitud'

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="card-title mb-0">Solicitudes Pendientes de Asignación</h5>
            <button className="btn btn-sm btn-outline-primary" onClick={refreshAll} disabled={loading}>
              {loading ? <Loader2 size={14} className="spin" /> : 'Actualizar'}
            </button>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="spin" size={28} />
                <div className="text-muted mt-2">Cargando…</div>
              </div>
            ) : rows.length === 0 ? (
              <div className="alert alert-info mb-0">No hay solicitudes pendientes sin asignar 🎉</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Empresa</th>
                      <th>Empkey</th>
                      <th>Fecha de PAP</th>
                      <th>Producto</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Building2 size={16} />
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">{r.empresa?.nombre ?? '—'}</span>
                              <small className="text-muted">{r.empresa?.rut ?? '—'}</small>
                            </div>
                          </div>
                        </td>
                        <td className="fw-bold text-primary">{r.empkey}</td>
                        <td>{fmtFecha(r.enviado_a_sac_at ?? r.created_at)}</td>
                        <td>{productoLabel(r.empresa?.producto)}</td>
                        <td>
                          <span className="badge bg-warning text-dark">Sin Asignar</span>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/sac/empresa/${r.empkey}`)}
                            >
                              Ver
                            </button>
                            <button className="btn btn-sm btn-outline-success" onClick={() => openAssignForRow(r)}>
                              Asignar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-muted small mt-2">
                  * “Fecha de PAP” usa <code>enviado_a_sac_at</code> y si viene null cae a <code>created_at</code>.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="col-lg-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Acciones Rápidas</h5>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={openQuickAssign}>
                <Users className="me-2" size={16} />
                Asignar Ejecutivo SAC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Acciones rápidas */}
      <Modal open={quickOpen} title={titleQuick} onClose={() => setQuickOpen(false)}>
        {!selectedEj ? (
          <>
            <div className="text-muted small mb-3">
              Elige un ejecutivo. Se muestra su carga actual Pendiente, Asignadas o En proceso
            </div>

            {ejecutivos.length === 0 ? (
              <div className="alert alert-info mb-0">
                No hay ejecutivos con perfil <code>{PERFIL_SAC_NOMBRE}</code>.
              </div>
            ) : (
              <div className="row g-3">
                {cards.map(({ e, hue, papCount }) => (
                  <div className="col-12 col-md-6" key={e.rut}>
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
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

                          <div>
                            <div className="fw-bold">{e.nombre}</div>
                            <div className="small">
                              <span className="text-muted">Cant. de PAP:</span>{' '}
                              <span className="fw-bold">{papCount}</span>
                            </div>
                          </div>
                        </div>

                        <button className="btn btn-primary rounded-pill px-4" onClick={() => pickEjecutivoForQuick(e)}>
                          Asignar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
              <div className="text-muted small">
                Mostrando solicitudes PAP con estado <span className="fw-bold">pendiente</span> y sin asignación.
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedEj(null)} disabled={papLoading}>
                  Volver
                </button>
                <button
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
                  onClick={() => pickEjecutivoForQuick(selectedEj)}
                  disabled={papLoading}
                >
                  {papLoading ? <Loader2 size={14} className="spin" /> : <Users size={14} />}
                  Refrescar
                </button>
              </div>
            </div>

            {papLoading ? (
              <div className="text-center py-4">
                <Loader2 className="spin" size={28} />
                <div className="text-muted mt-2">Cargando solicitudes…</div>
              </div>
            ) : rows.length === 0 ? (
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
                    {rows.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-bold text-primary">{p.empkey}</td>
                        <td>{p.empresa?.nombre ?? '—'}</td>
                        <td>{fmtFecha(p.enviado_a_sac_at ?? p.created_at)}</td>
                        <td>{productoLabel(p.empresa?.producto)}</td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/sac/empresa/${p.empkey}`)}>
                              Ver
                            </button>
                            <button
                              className="btn btn-sm btn-success d-inline-flex align-items-center gap-2"
                              onClick={() => asignarPap(p.id, selectedEj.rut)}
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
          </>
        )}
      </Modal>

      {/* Modal asignar por fila (elige ejecutivo) */}
      <Modal open={assignRowOpen} title={titleRow} onClose={() => setAssignRowOpen(false)}>
        {!rowToAssign ? (
          <div className="text-muted">—</div>
        ) : ejecutivos.length === 0 ? (
          <div className="alert alert-info mb-0">
            No hay ejecutivos con perfil <code>{PERFIL_SAC_NOMBRE}</code>.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Nombre Ejecutivo</th>
                  <th>Cant. PAP</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {ejecutivos.map((e) => (
                  <tr key={e.rut}>
                    <td className="fw-semibold">{e.nombre}</td>
                    <td>{counts[e.rut] ?? 0}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={async () => {
                          await asignarPap(rowToAssign.id, e.rut)
                          setAssignRowOpen(false)
                        }}
                      >
                        Asignar
                      </button>
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

const SacExecutiveContent: React.FC<{ onCompletarPap: () => void }> = ({ onCompletarPap }) => (
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
            <button className="btn btn-primary" onClick={onCompletarPap}>
              <FileCheck className="me-2" size={16} />
              Completar PAP
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default SacDashboard