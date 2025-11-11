import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Search, AlertCircle, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Empresa = {
  empkey: number
  rut: string | null
  nombre: string | null
  nombre_fantasia: string | null
  correo?: string | null
  telefono?: string | null
  domicilio?: string | null
}

type OnboardingRow = {
  id: number
  empkey: number
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'
  fecha_inicio: string | null
  fecha_fin: string | null
  created_at: string
  updated_at: string
  empresa: Empresa | null
}

const OnboardingSolicitudesNuevas: React.FC = () => {
  const [rows, setRows] = useState<OnboardingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Debounce básico para búsqueda
  const debounced = useDebounced(search, 350)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      // ⚠️ OJO: ahora usamos el embed directo "empresa(...)" porque ya no existe la FK duplicada.
      let query = supabase
        .from('empresa_onboarding')
        .select(`
          id, empkey, estado, fecha_inicio, fecha_fin, created_at, updated_at,
          empresa (
            empkey, rut, nombre, nombre_fantasia, correo, telefono, domicilio, updated_at, created_by
          )
        `)
        .eq('estado', 'pendiente')
        .order('id', { ascending: false })

      if (debounced) {
        query = query.or(`empresa.rut.ilike.%${debounced}%,empresa.nombre.ilike.%${debounced}%`)
      }

      const { data, error } = await query
      if (error) throw error
      setRows((data ?? []) as unknown as OnboardingRow[])
    } catch (err: any) {
      console.error(err)
      setError(err?.message ?? 'No fue posible cargar las solicitudes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const empty = !loading && !rows.length

  return (
    <div className="container-fluid" style={{ maxWidth: 1200 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="font-primary fw-bold mb-1">Solicitudes Nuevas</h1>
          <p className="text-muted mb-0">Empresas enviadas por Comercial en estado pendiente</p>
        </div>
        <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={load} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {/* Search */}
      <div className="input-group mb-3" style={{ maxWidth: 520 }}>
        <span className="input-group-text">
          <Search size={16} />
        </span>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar por RUT o razón social…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-start gap-2">
          <AlertCircle size={18} />
          <div>
            <div className="fw-semibold">Error al cargar</div>
            <div className="small">{error}</div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 120 }}>Empkey</th>
                <th style={{ width: 160 }}>RUT</th>
                <th>Razón Social</th>
                <th>Nombre Fantasía</th>
                <th style={{ width: 140 }}>Estado</th>
                <th style={{ width: 160 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Cargando…
                  </td>
                </tr>
              )}

              {empty && !loading && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No hay solicitudes pendientes.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((r) => {
                  const e = r.empresa
                  return (
                    <tr key={r.id}>
                      <td className="fw-semibold">{e?.empkey ?? r.empkey}</td>
                      <td>{e?.rut ?? '—'}</td>
                      <td>{e?.nombre ?? '—'}</td>
                      <td>{e?.nombre_fantasia ?? '—'}</td>
                      <td>
                        <span className="badge text-bg-warning text-uppercase">{r.estado}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {/* Ir a configurar (tu flujo existente) */}
                          <Link
                            to={`/configuracion-empresa/${e?.empkey ?? r.empkey}`}
                            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                          >
                            <Settings size={14} />
                            Configurar
                          </Link>

                          {/* Ver ficha/empresa */}
                          <Link
                            to={`/empresa/${e?.empkey ?? r.empkey}`}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default OnboardingSolicitudesNuevas

/* ============== utils ============== */
function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
