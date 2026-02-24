import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackButton } from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { RefreshCw, Search, PlayCircle } from 'lucide-react'
import type { Tables } from '@/lib/database.types'

type Empresa = Tables<'empresa'>
type PapSac = Tables<'pap_sac'>
type EmpresaOnboarding = Tables<'empresa_onboarding'>

type EmpresaRow = Pick<Empresa, 'empkey' | 'rut' | 'nombre' | 'estado' | 'producto' | 'updated_at'> & {
  pap?: Pick<PapSac, 'estado' | 'fecha_hora'> | Pick<PapSac, 'estado' | 'fecha_hora'>[] | null
  ob?: Pick<EmpresaOnboarding, 'pap_fecha_hora'> | Pick<EmpresaOnboarding, 'pap_fecha_hora'>[] | null
}

const PAGE_SIZE = 12

type PapEstado = 'PENDIENTE' | 'EN_EJECUCION' | 'REPROGRAMADO' | 'COMPLETADO'

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
  return '—'
}

function getFechaPAP(row: EmpresaRow): string | null {
  const ob = one(row.ob)
  const pap = one(row.pap)
  return (ob?.pap_fecha_hora ?? null) || (pap?.fecha_hora ?? null)
}

function computePapEstado(row: EmpresaRow): PapEstado {
  const pap = one(row.pap)
  const manual = (pap?.estado ?? null) as PapEstado | null
  if (manual === 'REPROGRAMADO' || manual === 'COMPLETADO') return manual

  const fecha = getFechaPAP(row)
  if (!fecha) return 'PENDIENTE'

  const t = new Date(fecha).getTime()
  if (Number.isNaN(t)) return 'PENDIENTE'

  return Date.now() < t ? 'PENDIENTE' : 'EN_EJECUCION'
}

function badgeClass(estado: PapEstado) {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-secondary'
    case 'EN_EJECUCION':
      return 'bg-warning text-dark'
    case 'REPROGRAMADO':
      return 'bg-danger'
    case 'COMPLETADO':
      return 'bg-success'
    default:
      return 'bg-secondary'
  }
}

const SacPapListado: React.FC = () => {
  const [rows, setRows] = useState<EmpresaRow[]>([])
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
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const q = search.trim()

      let query = supabase
        .from('empresa')
        .select(
          'empkey,rut,nombre,estado,producto,updated_at,pap:pap_sac(estado,fecha_hora),ob:empresa_onboarding(pap_fecha_hora)',
          { count: 'exact' }
        )
        .eq('estado', 'SAC')

      if (q) {
        const orParts: string[] = [`nombre.ilike.%${q}%`, `rut.ilike.%${q}%`]
        if (/^\d+$/.test(q)) orParts.push(`empkey.eq.${q}`)
        query = query.or(orParts.join(','))
      }

      const { data, error: qError, count } = await query
        .order('updated_at', { ascending: false, nullsFirst: false })
        .range(from, to)

      if (qError) throw qError

      setRows((data as EmpresaRow[]) ?? [])
      setTotalCount(count ?? 0)
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando listado PAP.')
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
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/sac/mis-empresas" />
          <div>
            <h1 className="font-primary fw-bold mb-1">Completar PAP</h1>
            <p className="text-muted mb-0">Lista de empresas en estado SAC.</p>
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
            <div className="text-center py-4 text-muted">No hay empresas SAC para PAP con los filtros actuales.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Empkey</th>
                    <th>RUT</th>
                    <th>Nombre Empresa</th>
                    <th>Producto</th>
                    <th>Fecha PAP</th>
                    <th>Estado PAP</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const est = computePapEstado(r)
                    const fecha = getFechaPAP(r)

                    return (
                      <tr key={r.empkey}>
                        <td className="fw-bold text-primary">{r.empkey ?? '—'}</td>
                        <td>{r.rut ?? '—'}</td>
                        <td>{r.nombre ?? '—'}</td>
                        <td>{productoLabel(r.producto)}</td>
                        <td>{fmtDate(fecha)}</td>
                        <td>
                          <span className={`badge ${badgeClass(est)}`}>{est}</span>
                        </td>
                        <td className="text-end">
                          {r.empkey ? (
                            <Link
                              to={`/sac/pap/${r.empkey}`}
                              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                            >
                              <PlayCircle size={16} />
                              Iniciar PAP
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })}
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

export default SacPapListado