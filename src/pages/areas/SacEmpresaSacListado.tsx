import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackButton } from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { RefreshCw, Search, X } from 'lucide-react'

const PAGE_SIZE = 12

type Row = {
  empkey: number
  rut: string | null
  nombre: string | null
  estado: string | null
  producto: string | null
  paso_produccion_at: string | null
  updated_at: string | null
  pap?:
    | { estado: string | null; fecha_hora: string | null }[]
    | { estado: string | null; fecha_hora: string | null }
    | null
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-CL')
  } catch {
    return String(iso)
  }
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

function productoLabel(producto?: string | null) {
  if (producto === 'ENTERFAC') return 'Enterfact'
  if (producto === 'ANDESPOS') return 'AndesPOS'
  return producto ?? '—'
}

function buildRangeFromFilters(day?: string, month?: string, year?: string) {
  if (day) {
    const start = new Date(day + 'T00:00:00')
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { start: start.toISOString(), end: end.toISOString() }
  }
  if (month) {
    const [y, m] = month.split('-').map(Number)
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0))
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0))
    return { start: start.toISOString(), end: end.toISOString() }
  }
  if (year) {
    const y = Number(year)
    const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0))
    const end = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0))
    return { start: start.toISOString(), end: end.toISOString() }
  }
  return null
}

const SacEmpresaSacListado: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [estadoEmpresa, setEstadoEmpresa] = useState<'TODOS' | string>('TODOS')
  const [papEstado, setPapEstado] = useState<'TODOS' | string>('TODOS')

  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount])

  const clearDateFilters = () => {
    setDay('')
    setMonth('')
    setYear('')
  }

  const clearAllFilters = () => {
    setSearch('')
    setEstadoEmpresa('TODOS')
    setPapEstado('TODOS')
    clearDateFilters()
  }

  const fetchRows = async () => {
    setLoading(true)
    setError(null)

    try {
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const q = search.trim()
      const range = buildRangeFromFilters(day || undefined, month || undefined, year || undefined)

      const papSelect =
        papEstado === 'TODOS'
          ? 'pap:pap_sac(estado,fecha_hora)'
          : 'pap:pap_sac!inner(estado,fecha_hora)'

      let query = supabase
        .from('empresa')
        .select(`empkey,rut,nombre,estado,producto,paso_produccion_at,updated_at,${papSelect}`, {
          count: 'exact',
        })
        .not('paso_produccion_at', 'is', null) // ya pasaron por SAC
        .order('paso_produccion_at', { ascending: false })
        .range(from, to)

      if (estadoEmpresa !== 'TODOS') query = query.eq('estado', estadoEmpresa)
      if (papEstado !== 'TODOS') query = query.eq('pap_sac.estado', papEstado)

      if (range) query = query.gte('paso_produccion_at', range.start).lt('paso_produccion_at', range.end)

      if (q) {
        const orParts: string[] = [`nombre.ilike.%${q}%`, `rut.ilike.%${q}%`]
        if (/^\d+$/.test(q)) orParts.push(`empkey.eq.${q}`)
        query = query.or(orParts.join(','))
      }

      const { data, error: qError, count } = await query
      if (qError) throw qError

      setRows((data as Row[]) ?? [])
      setTotalCount(count ?? 0)
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando empresas post-SAC.')
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
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, estadoEmpresa, papEstado, day, month, year])

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-start align-items-sm-center gap-3 mb-4 flex-wrap">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/sac/mis-empresas" />
          <div>
            <h1 className="font-primary fw-bold mb-1">Empresa SAC (post SAC)</h1>
            <p className="text-muted mb-0">Empresas que ya pasaron por SAC (basado en paso a producción).</p>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={clearAllFilters}
            disabled={loading}
            title="Limpiar filtros"
          >
            <X size={16} />
            Limpiar
          </button>

          <button
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={fetchRows}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros (más pro y responsivo) */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-6">
              <label className="form-label small text-muted mb-1">Buscar</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  className="form-control"
                  placeholder="Nombre, RUT o empkey…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label small text-muted mb-1">Estado empresa</label>
              <select className="form-select" value={estadoEmpresa} onChange={(e) => setEstadoEmpresa(e.target.value)}>
                <option value="TODOS">Todos</option>
                <option value="COMPLETADA">COMPLETADA</option>
                <option value="PRODUCCION">PRODUCCION</option>
                <option value="SAC">SAC (por si acaso)</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label small text-muted mb-1">PAP</label>
              <select className="form-select" value={papEstado} onChange={(e) => setPapEstado(e.target.value)}>
                <option value="TODOS">Todos</option>
                <option value="COMPLETADO">COMPLETADO</option>
                <option value="REPROGRAMADO">REPROGRAMADO</option>
                <option value="PENDIENTE">PENDIENTE</option>
              </select>
            </div>

            {/* Fecha / Mes / Año (fila super responsiva) */}
            <div className="col-12">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted mb-1">Filtrar por día</label>
                  <input
                    className="form-control"
                    type="date"
                    value={day}
                    onChange={(e) => {
                      setDay(e.target.value)
                      if (e.target.value) {
                        setMonth('')
                        setYear('')
                      }
                    }}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted mb-1">Filtrar por mes</label>
                  <input
                    className="form-control"
                    type="month"
                    value={month}
                    onChange={(e) => {
                      setMonth(e.target.value)
                      if (e.target.value) {
                        setDay('')
                        setYear('')
                      }
                    }}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted mb-1">Filtrar por año</label>
                  <div className="d-flex gap-2">
                    <input
                      className="form-control"
                      type="number"
                      placeholder="2026"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value)
                        if (e.target.value) {
                          setDay('')
                          setMonth('')
                        }
                      }}
                      min={2000}
                      max={2100}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={clearDateFilters}
                      title="Limpiar fecha/mes/año"
                      disabled={loading || (!day && !month && !year)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
            <div className="text-center py-4 text-muted">No hay empresas con los filtros actuales.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Empkey</th>
                    <th>RUT</th>
                    <th>Nombre Empresa</th>
                    <th>Producto</th>
                    <th>Estado empresa</th>
                    <th>Fecha paso prod</th>
                    <th>Estado PAP</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const pap = one(r.pap)
                    return (
                      <tr key={r.empkey}>
                        <td className="fw-bold text-primary">{r.empkey}</td>
                        <td>{r.rut ?? '—'}</td>
                        <td>{r.nombre ?? '—'}</td>
                        <td>{productoLabel(r.producto)}</td>
                        <td>{r.estado ?? '—'}</td>
                        <td>{fmtDate(r.paso_produccion_at)}</td>
                        <td>{pap?.estado ?? '—'}</td>
                        <td className="text-end">
                          <Link to={`/sac/empresa/${r.empkey}`} className="btn btn-sm btn-outline-primary">
                            Ver
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <small className="text-muted">
              Total: {totalCount} • Página {page} de {totalPages}
            </small>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SacEmpresaSacListado