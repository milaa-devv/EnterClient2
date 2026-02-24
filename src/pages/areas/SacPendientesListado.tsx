import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { RefreshCw, Search, PlayCircle } from 'lucide-react'

const PAGE_SIZE = 12

type Row = {
  id: number
  empkey: number
  estado: string
  updated_at: string | null
  empresa: {
    empkey: number
    rut: string
    nombre: string | null
    producto: string | null
    estado: string | null
  } | null
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('es-CL') } catch { return String(iso) }
}

function productoLabel(p?: string | null) {
  if (p === 'ENTERFAC') return 'Enterfact'
  if (p === 'ANDESPOS') return 'AndesPOS'
  return '—'
}

const SacPendientesListado: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount])

  const fetchRows = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!profile?.rut) throw new Error('No hay usuario logueado.')

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const q = search.trim()

      let query = supabase
        .from('pap_solicitud')
        .select(
          `
          id, empkey, estado, updated_at,
          empresa:empresa!pap_solicitud_empkey_fkey(empkey,rut,nombre,producto,estado)
        `,
          { count: 'exact' }
        )
        .eq('asignado_a_rut', profile.rut)
        .in('estado', ['pendiente', 'asignada', 'en_proceso'])

      if (q) {
        // filtro por empresa (si hay empresa cargada)
        query = query.or(
          [
            `empresa.nombre.ilike.%${q}%`,
            `empresa.rut.ilike.%${q}%`,
            /^\d+$/.test(q) ? `empkey.eq.${q}` : '',
          ].filter(Boolean).join(',')
        )
      }

      const { data, error: qError, count } = await query
        .order('updated_at', { ascending: false, nullsFirst: false })
        .range(from, to)

      if (qError) throw qError

      setRows((data as Row[]) ?? [])
      setTotalCount(count ?? 0)
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando pendientes.')
      setRows([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRows(); /* eslint-disable-next-line */ }, [page])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchRows() }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line
  }, [search])

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/sac/dashboard" />
          <div>
            <h1 className="font-primary fw-bold mb-1">Empresas Pendientes</h1>
            <p className="text-muted mb-0">Tu cola asignada (no cerradas).</p>
          </div>
        </div>

        <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={fetchRows}>
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text"><Search size={16} /></span>
            <input className="form-control" placeholder="Buscar por nombre, RUT o empkey…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" role="status" /></div>
          ) : rows.length === 0 ? (
            <div className="text-center py-4 text-muted">No tienes pendientes asignadas.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Empkey</th>
                    <th>RUT</th>
                    <th>Nombre</th>
                    <th>Producto</th>
                    <th>Estado Solicitud</th>
                    <th>Actualizado</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-bold text-primary">{r.empkey}</td>
                      <td>{r.empresa?.rut ?? '—'}</td>
                      <td>{r.empresa?.nombre ?? '—'}</td>
                      <td>{productoLabel(r.empresa?.producto)}</td>
                      <td><span className="badge bg-secondary">{r.estado}</span></td>
                      <td>{fmtDate(r.updated_at)}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                          onClick={() => navigate(`/sac/pap/${r.empkey}`)}
                        >
                          <PlayCircle size={16} />
                          Abrir PAP
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">Total: {totalCount} • Página {page} de {totalPages}</small>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SacPendientesListado