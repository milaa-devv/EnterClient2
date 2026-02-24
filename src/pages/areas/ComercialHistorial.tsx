import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  CalendarDays,
  History as HistoryIcon,
  Loader2,
  RefreshCw,
  Search,
  ArrowLeft
} from 'lucide-react'

type FiltroFecha = 'dia' | 'mes' | 'anio'

type HistRow = {
  id: number
  tabla: string
  registro_id: string
  accion: 'INSERT' | 'UPDATE' | 'DELETE'
  cambios: any
  usuario: string | null
  fecha: string
}

type EmpresaMini = {
  empkey: number
  rut: string
  nombre: string | null
  nombre_fantasia: string | null
}

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10)
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfYear(d: Date) {
  const x = new Date(d.getFullYear(), 0, 1)
  x.setHours(0, 0, 0, 0)
  return x
}
function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
function addMonths(d: Date, months: number) {
  const x = new Date(d)
  x.setMonth(x.getMonth() + months)
  return x
}
function addYears(d: Date, years: number) {
  const x = new Date(d)
  x.setFullYear(x.getFullYear() + years)
  return x
}

const ComercialHistorial: React.FC = () => {
  const navigate = useNavigate()

  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>('mes')
  const [refDate, setRefDate] = useState<string>(() => toDateInputValue(new Date()))
  const [search, setSearch] = useState('')

  const [rows, setRows] = useState<(HistRow & { empresa?: EmpresaMini | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const range = useMemo(() => {
    const base = new Date(refDate + 'T00:00:00')
    if (filtroFecha === 'dia') {
      const start = startOfDay(base)
      const end = addDays(start, 1)
      return { start, end }
    }
    if (filtroFecha === 'mes') {
      const start = startOfMonth(base)
      const end = addMonths(start, 1)
      return { start, end }
    }
    const start = startOfYear(base)
    const end = addYears(start, 1)
    return { start, end }
  }, [filtroFecha, refDate])

  const handleBack = () => {
    // Si entran directo por URL y no hay historial real, evitamos volver a "nada"
    if (window.history.length > 1) navigate(-1)
    else navigate('/comercial/dashboard')
  }

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const sb = supabase as any

      const { data: hist, error: hErr } = await sb
        .from('historial_movimientos')
        .select('*')
        .eq('tabla', 'empresa')
        .eq('accion', 'INSERT')
        .gte('fecha', range.start.toISOString())
        .lt('fecha', range.end.toISOString())
        .order('fecha', { ascending: false })
        .limit(250)

      if (hErr) throw hErr

      const baseRows: HistRow[] = hist ?? []

      const empkeys = Array.from(
        new Set(
          baseRows
            .map((r) => Number(r.registro_id))
            .filter((n) => Number.isFinite(n))
        )
      )

      let empresasMap = new Map<number, EmpresaMini>()
      if (empkeys.length > 0) {
        const { data: empresas, error: eErr } = await sb
          .from('empresa')
          .select('empkey, rut, nombre, nombre_fantasia')
          .in('empkey', empkeys)

        if (eErr) throw eErr

        empresasMap = new Map(
          (empresas ?? []).map((e: any) => [
            e.empkey as number,
            {
              empkey: e.empkey,
              rut: e.rut,
              nombre: e.nombre ?? null,
              nombre_fantasia: e.nombre_fantasia ?? null
            }
          ])
        )
      }

      const merged = baseRows.map((r) => ({
        ...r,
        empresa: empresasMap.get(Number(r.registro_id)) ?? null
      }))

      setRows(merged)
    } catch (err: any) {
      console.error(err)
      setError(err?.message ?? 'Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroFecha, refDate])

  const filtradas = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows

    return rows.filter((r) => {
      const emp = r.empresa
      const nombre = (emp?.nombre ?? '').toLowerCase()
      const fantasia = (emp?.nombre_fantasia ?? '').toLowerCase()
      const rut = (emp?.rut ?? '').toLowerCase()
      const empkey = String(emp?.empkey ?? r.registro_id)

      return (
        nombre.includes(q) ||
        fantasia.includes(q) ||
        rut.includes(q) ||
        empkey.includes(q) ||
        (r.usuario ?? '').toLowerCase().includes(q)
      )
    })
  }, [rows, search])

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h1 className="font-primary fw-bold mb-1 d-flex align-items-center gap-2">
                <HistoryIcon size={22} /> Historial Comercial
              </h1>
              <p className="text-muted mb-0">
                Empresas ingresadas por el área comercial (filtra por día/mes/año).
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
                onClick={load}
                disabled={loading}
                type="button"
              >
                <RefreshCw size={16} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted">Filtro</label>
              <select
                className="form-select"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value as FiltroFecha)}
              >
                <option value="dia">Día</option>
                <option value="mes">Mes</option>
                <option value="anio">Año</option>
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small text-muted d-flex align-items-center gap-2">
                <CalendarDays size={14} />
                Fecha de referencia
              </label>
              <input
                className="form-control"
                type="date"
                value={refDate}
                onChange={(e) => setRefDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small text-muted">Buscar</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  className="form-control"
                  placeholder="Nombre, RUT, empkey o usuario…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading && (
            <div className="text-center py-4 text-muted">
              <Loader2 className="me-2" />
              Cargando historial…
            </div>
          )}

          {!loading && error && <div className="alert alert-danger mb-0">{error}</div>}

          {!loading && !error && filtradas.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No hay registros para el filtro seleccionado.</p>
              <small className="text-muted">
                Tip: si esto queda siempre vacío, revisa que existan los triggers que llenan
                <code className="ms-1">historial_movimientos</code>.
              </small>
            </div>
          )}

          {!loading && !error && filtradas.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Empresa</th>
                    <th>RUT</th>
                    <th>Empkey</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <small className="text-muted">
                          {new Date(r.fecha).toLocaleString('es-CL')}
                        </small>
                      </td>
                      <td className="fw-semibold">
                        {r.empresa?.nombre ?? r.empresa?.nombre_fantasia ?? 'Empresa sin nombre'}
                      </td>
                      <td>{r.empresa?.rut ?? '—'}</td>
                      <td className="fw-bold text-primary">{r.empresa?.empkey ?? r.registro_id}</td>
                      <td className="text-muted">{r.usuario ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComercialHistorial