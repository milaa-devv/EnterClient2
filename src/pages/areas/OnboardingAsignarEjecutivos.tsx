import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AlertCircle, ArrowLeft, Inbox, Loader2 } from 'lucide-react'

type OnboardingEstado = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

interface BandejaRow {
  id:             number
  empkey:         number
  rut:            string | null
  nombre:         string | null
  producto:       string | null
  estado:         OnboardingEstado
  encargado_name: string | null
  encargado_rut:  string | null
  updated_at:     string | null
}

interface EjecutivoOB {
  rut:    string
  nombre: string
  perfil: string
}

const sb = supabase as any

const OnboardingAsignarEjecutivos: React.FC = () => {
  const [sinAsignar,  setSinAsignar]  = useState<BandejaRow[]>([])
  const [conAsignar,  setConAsignar]  = useState<BandejaRow[]>([])
  const [ejecutivos,  setEjecutivos]  = useState<EjecutivoOB[]>([])
  const [loading,     setLoading]     = useState(true)
  const [savingId,    setSavingId]    = useState<number | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const navigate = useNavigate()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // ——— Empresas pendientes sin ejecutivo ———
      const { data: empresaData, error: empresaError } = await sb
        .from('empresa')
        .select(`
          empkey,
          rut,
          nombre,
          producto,
          empresa_onboarding (
            id,
            estado,
            encargado_name,
            encargado_rut,
            updated_at
          )
        `)

      if (empresaError) throw empresaError

      const allRows: BandejaRow[] = (empresaData ?? [])
        .filter((row: any) => row.empresa_onboarding?.length > 0)
        .map((row: any) => {
          const ob = row.empresa_onboarding[0]
          return {
            id:             ob.id as number,
            empkey:         row.empkey as number,
            rut:            row.rut as string | null,
            nombre:         row.nombre as string | null,
            producto:       (row.producto as string | null) ?? null,
            estado:         (ob.estado as OnboardingEstado) ?? 'pendiente',
            encargado_name: (ob.encargado_name as string | null) ?? null,
            encargado_rut:  (ob.encargado_rut as string | null) ?? null,
            updated_at:     (ob.updated_at as string | null) ?? null,
          }
        })

      // Sin ejecutivo asignado
      setSinAsignar(allRows.filter(r => !r.encargado_rut))
      // Con ejecutivo (reasignables) — excluir completados
      setConAsignar(allRows.filter(r => r.encargado_rut && r.estado !== 'completado'))

      // ——— Ejecutivos OB + ADMIN_OB ———
      // Primero obtenemos los IDs de perfil OB y ADMIN_OB
      const { data: perfiles, error: perfilError } = await sb
        .from('perfil_usuarios')
        .select('id, nombre')
        .in('nombre', ['OB', 'ADMIN_OB'])

      if (perfilError) throw perfilError

      const perfilIds = (perfiles ?? []).map((p: any) => p.id)

      if (perfilIds.length === 0) {
        setEjecutivos([])
        return
      }

      const { data: usuariosData, error: usuariosError } = await sb
        .from('usuario')
        .select('rut, nombre, perfil_id')
        .in('perfil_id', perfilIds)

      if (usuariosError) throw usuariosError

      // Mapear perfil_id → nombre de perfil
      const perfilMap: Record<number, string> = {}
      ;(perfiles ?? []).forEach((p: any) => { perfilMap[p.id] = p.nombre })

      const ejecutivosRows: EjecutivoOB[] = (usuariosData ?? []).map((u: any) => ({
        rut:    u.rut as string,
        nombre: u.nombre as string,
        perfil: perfilMap[u.perfil_id] ?? 'OB',
      }))

      setEjecutivos(ejecutivosRows)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleAsignar = async (row: BandejaRow, nuevoEncargadoRut: string) => {
    if (!nuevoEncargadoRut) return
    setError(null)
    setSavingId(row.id)
    try {
      const seleccionado    = ejecutivos.find(e => e.rut === nuevoEncargadoRut)
      const nombreEncargado = seleccionado?.nombre ?? null

      const { error: updateError } = await sb
        .from('empresa_onboarding')
        .update({
          encargado_name: nombreEncargado,
          encargado_rut:  nuevoEncargadoRut,
        })
        .eq('id', row.id)

      if (updateError) throw updateError

      await sb.from('onboarding_notificacion').insert({
        empkey:      row.empkey,
        tipo:        'asignado_ejecutivo',
        descripcion: `Asignada a ${nombreEncargado ?? 'Sin nombre'} (${nuevoEncargadoRut})`,
      })

      // Mover de sinAsignar a conAsignar o actualizar conAsignar
      const updated = { ...row, encargado_name: nombreEncargado, encargado_rut: nuevoEncargadoRut }
      setSinAsignar(prev => prev.filter(e => e.id !== row.id))
      setConAsignar(prev => {
        const exists = prev.find(e => e.id === row.id)
        if (exists) return prev.map(e => e.id === row.id ? updated : e)
        return [...prev, updated]
      })
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al asignar ejecutivo')
    } finally {
      setSavingId(null)
    }
  }

  const formatProducto = (p: string | null) => {
    if (!p) return '—'
    if (p === 'ANDESPOS') return 'AndesPOS'
    if (p === 'ENTERFAC') return 'Enternet'
    return p
  }

  // ——— Card de empresa reutilizable ———
  const EmpresaCard = ({ e, reasignar = false }: { e: BandejaRow; reasignar?: boolean }) => (
    <div className="col-12">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h6 className="mb-1 fw-semibold">{e.nombre ?? 'Sin nombre'}</h6>
              <p className="text-muted small mb-1">{e.rut ?? '—'}</p>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                {e.producto && (
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 4,
                    fontSize: 12, fontWeight: 500,
                    background: e.producto === 'ANDESPOS' ? '#0dcaf020' : '#0d6efd20',
                    color: e.producto === 'ANDESPOS' ? '#0a7a8f' : '#0a4db5',
                    border: `1px solid ${e.producto === 'ANDESPOS' ? '#0dcaf060' : '#0d6efd60'}`,
                  }}>
                    {formatProducto(e.producto)}
                  </span>
                )}
                {reasignar && e.encargado_name && (
                  <span className="small text-muted">
                    Actual: <strong>{e.encargado_name}</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2" style={{ minWidth: 320 }}>
              <select
                className="form-select form-select-sm"
                value={reasignar ? (e.encargado_rut ?? '') : ''}
                disabled={savingId === e.id}
                onChange={ev => handleAsignar(e, ev.target.value)}
              >
                <option value="">{reasignar ? '— Reasignar a…' : 'Seleccionar ejecutivo…'}</option>
                {ejecutivos.map(ej => (
                  <option key={ej.rut} value={ej.rut}>
                    {ej.nombre} {ej.perfil === 'ADMIN_OB' ? '(Admin OB)' : '(OB)'}
                  </option>
                ))}
              </select>
              {savingId === e.id && (
                <span className="text-muted small d-flex align-items-center gap-1">
                  <Loader2 size={14} /> Guardando…
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="me-1" /> Atrás
          </button>
          <div>
            <h1 className="h4 mb-0 font-primary">📥 Bandeja de Solicitudes</h1>
            <p className="text-muted small mb-0">
              Empresas que llegaron desde Comercial y aún no tienen ejecutivo OB asignado.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertCircle size={18} /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Loader2 className="mb-2 text-primary" size={32} />
          <p className="text-muted">Cargando solicitudes…</p>
        </div>
      ) : (
        <>
          {/* Sin ejecutivo asignado */}
          <div className="mb-4">
            <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark">Sin asignar</span>
              <span className="text-muted small fw-normal">({sinAsignar.length})</span>
            </h5>
            {sinAsignar.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-4">
                  <Inbox size={36} className="text-muted mb-2" />
                  <p className="text-muted mb-0">No hay empresas pendientes de asignación.</p>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {sinAsignar.map(e => <EmpresaCard key={e.id} e={e} />)}
              </div>
            )}
          </div>

          {/* Con ejecutivo — reasignables */}
          {conAsignar.length > 0 && (
            <div>
              <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                <span className="badge bg-info text-dark">Reasignar</span>
                <span className="text-muted small fw-normal">({conAsignar.length})</span>
              </h5>
              <div className="row g-3">
                {conAsignar.map(e => <EmpresaCard key={e.id} e={e} reasignar />)}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && ejecutivos.length === 0 && (sinAsignar.length > 0 || conAsignar.length > 0) && (
        <div className="alert alert-warning mt-3">
          No se encontraron ejecutivos con perfil OB o ADMIN_OB en la tabla <code>usuario</code>.
          Verifica que los usuarios tengan el perfil correcto asignado.
        </div>
      )}
    </div>
  )
}

export default OnboardingAsignarEjecutivos