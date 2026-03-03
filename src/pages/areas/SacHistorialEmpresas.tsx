import React, { useEffect, useMemo, useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { AlertCircle, RefreshCw, Search } from 'lucide-react'

const sb = supabase as any

type TipoEvento =
  | 'LLEGO'
  | 'ASIGNADO'
  | 'REPROGRAMADO'
  | 'DESAFILIADO'
  | 'COMPLETADO'

type EventoRow = {
  id: number
  empkey: number
  tipo: TipoEvento
  actor_rut: string | null
  asignado_a_rut: string | null
  detalle: any
  created_at: string
  empresa?: {
    empkey: number
    rut: string | null
    nombre: string | null
    producto: string | null
  } | null
}

const PAGE_SIZE = 15

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
  return p ?? '—'
}

function buildRangeFromFilters(day?: string, month?: string, year?: string) {
  // prioridad: día > mes > año
  if (day) {
    const start = new Date(day + 'T00:00:00')
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { start: start.toISOString(), end: end.toISOString(), label: `Día ${day}` }
  }

  if (month) {
    // month: "YYYY-MM"
    const [y, m] = month.split('-').map(Number)
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0))
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0))
    return { start: start.toISOString(), end: end.toISOString(), label: `Mes ${month}` }
  }

  if (year) {
    const y = Number(year)
    const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0))
    const end = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0))
    return { start: start.toISOString(), end: end.toISOString(), label: `Año ${year}` }
  }

  return null
}

const SacHistorialEmpresas: React.FC = () => {
  const [rows, setRows] = useState<EventoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [missingTable, setMissingTable] = useState(false)

  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState<'TODOS' | TipoEvento>('TODOS')

  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount])

  const fetchRows = async () => {
    setLoading(true)
    setError(null)
    setMissingTable(false)

    try {
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const q = search.trim()
      const range = buildRangeFromFilters(day || undefined, month || undefined, year || undefined)

      // OJO: esto asume que existe FK sac_evento.empkey -> empresa.empkey
      // Si tu FK se llama distinto, igual funciona sin join (solo quita empresa:empresa(...))
      let query = sb
        .from('sac_evento')
        .select(
          `
          id, empkey, tipo, actor_rut, asignado_a_rut, detalle, created_at,
          empresa:empresa(empkey,rut,nombre,producto)
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, to)

      if (tipo !== 'TODOS') query = query.eq('tipo', tipo)

      if (range) {
        query = query.gte('created_at', range.start).lt('created_at', range.end)
      }

      if (q) {
        // Filtramos por empresa.nombre/rut, y por empkey numérico
        // PostgREST: filtros por relación: empresa.nombre ilike, empresa.rut ilike
        const orParts: string[] = [`empresa.nombre.ilike.%${q}%`, `empresa.rut.ilike.%${q}%`]
        if (/^\d+$/.test(q)) orParts.push(`empkey.eq.${q}`)
        query = query.or(orParts.join(','))
      }

      const { data, error: qError, count } = await query

      if (qError) {
        // “relation does not exist” típico cuando no está creada la tabla
        if (String(qError.message || '').toLowerCase().includes('does not exist')) {
          setMissingTable(true)
          setRows([])
          setTotalCount(0)
          return
        }
        throw qError
      }

      setRows((data as EventoRow[]) ?? [])
      setTotalCount(count ?? 0)
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando historial.')
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
  }, [search, tipo, day, month, year])

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/sac/mis-empresas" />
          <div>
            <h1 className="font-primary fw-bold mb-1">Historial de Empresas (SAC)</h1>
            <p className="text-muted mb-0">Eventos: llegó, asignado, reprogramado, desafiliado, completado.</p>
          </div>
        </div>

        <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={fetchRows} disabled={loading}>
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {missingTable && (
        <div className="alert alert-warning">
          <b>Ojo:</b> No existe la tabla <code>sac_evento</code>.  
          Esta pantalla queda lista, pero necesitas crear la tabla para ver historial real.
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              className="form-control"
              placeholder="Buscar por empkey, RUT o nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-3">
          <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
            <option value="TODOS">Todos los eventos</option>
            <option value="LLEGO">Llegó a SAC</option>
            <option value="ASIGNADO">Asignado</option>
            <option value="REPROGRAMADO">Reprogramado</option>
            <option value="DESAFILIADO">Desafiliado</option>
            <option value="COMPLETADO">Completado</option>
          </select>
        </div>

        <div className="col-md-4 d-flex gap-2">
          <input className="form-control" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          <input className="form-control" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <input
            className="form-control"
            type="number"
            placeholder="Año"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={2000}
            max={2100}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-4 text-muted">No hay eventos con los filtros actuales.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Empkey</th>
                    <th>Empresa</th>
                    <th>Producto</th>
                    <th>Evento</th>
                    <th>Actor</th>
                    <th>Asignado a</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{fmtDate(r.created_at)}</td>
                      <td className="fw-bold text-primary">{r.empkey}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{r.empresa?.nombre ?? '—'}</span>
                          <small className="text-muted">{r.empresa?.rut ?? '—'}</small>
                        </div>
                      </td>
                      <td>{productoLabel(r.empresa?.producto)}</td>
                      <td>
                        <span className="badge bg-secondary">{r.tipo}</span>
                      </td>
                      <td>{r.actor_rut ?? '—'}</td>
                      <td>{r.asignado_a_rut ?? '—'}</td>
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

export default SacHistorialEmpresas