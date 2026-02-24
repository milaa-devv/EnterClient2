import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Search, Eye, RefreshCw } from 'lucide-react'

type Row = {
  empkey: number
  rut: string
  nombre: string | null
  producto: string | null
  paso_produccion_at: string | null
}

const PAGE_SIZE = 12

function fmtDate(iso?: string | null) {
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
  return '—'
}

const SacMisEmpresas: React.FC = () => {
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
        .from('empresa')
        .select('empkey,rut,nombre,producto,paso_produccion_at', { count: 'exact' })
        .eq('estado', 'COMPLETADA')
        .eq('paso_produccion_por_rut', profile.rut)

      if (q) {
        const orParts: string[] = [`nombre.ilike.%${q}%`, `rut.ilike.%${q}%`]
        if (/^\d+$/.test(q)) orParts.push(`empkey.eq.${q}`)
        query = query.or(orParts.join(','))
      }

      const { data, error: qError, count } = await query
        .order('paso_produccion_at', { ascending: false, nullsFirst: false })
        .range(from, to)

      if (qError) throw qError

      setRows((data as Row[]) ?? [])
      setTotalCount(count ?? 0)
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando Mis Empresas.')
      setRows([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchRows()
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/sac/dashboard" />
          <div>
            <h2 className="mb-0">Mis Empresas</h2>
            <small className="text-muted">Empresas que tú pasaste a producción (COMPLETADAS).</small>
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
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              className="form-control"
              placeholder="Buscar por nombre, RUT o empkey…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-4 text-muted">Aún no tienes empresas pasadas a producción.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Empkey</th>
                    <th>RUT</th>
                    <th>Nombre</th>
                    <th>Producto</th>
                    <th>Fecha paso a Prod</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.empkey}>
                      <td className="fw-bold text-primary">{r.empkey}</td>
                      <td>{r.rut}</td>
                      <td>{r.nombre ?? '—'}</td>
                      <td>{productoLabel(r.producto)}</td>
                      <td>{fmtDate(r.paso_produccion_at)}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
                          onClick={() => navigate(`/sac/empresa/${r.empkey}`)}
                        >
                          <Eye size={16} />
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Total: {totalCount} • Página {page} de {totalPages}
            </small>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Anterior
              </button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SacMisEmpresas