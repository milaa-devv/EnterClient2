import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle } from 'lucide-react'

type OnboardingEstado = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

interface EmpresaProceso {
  id:             number
  empkey:         number
  rut:            string | null
  nombre:         string | null
  producto:       string | null
  estado:         OnboardingEstado
  encargado_name: string | null
  updated_at:     string | null
}

const ESTADO_LABEL: Record<OnboardingEstado, string> = {
  pendiente:  'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado:  'Cancelado',
}

const ESTADO_COLOR: Record<OnboardingEstado, string> = {
  pendiente:  'bg-warning bg-opacity-10 text-warning',
  en_proceso: 'bg-info bg-opacity-10 text-info',
  completado: 'bg-success bg-opacity-10 text-success',
  cancelado:  'bg-danger bg-opacity-10 text-danger',
}

function estadoToPorcentaje(estado: OnboardingEstado): number {
  switch (estado) {
    case 'pendiente':  return 25
    case 'en_proceso': return 60
    case 'completado': return 100
    case 'cancelado':  return 0
    default:           return 0
  }
}

const PROGRESO_COLOR: Record<OnboardingEstado, string> = {
  pendiente:  'bg-warning',
  en_proceso: 'bg-info',
  completado: 'bg-success',
  cancelado:  'bg-danger',
}

function formatProducto(producto: string | null): { label: string; className: string } {
  if (!producto) return { label: '—', className: '' }
  if (producto === 'ANDESPOS') return { label: 'AndesPOS', className: 'bg-info bg-opacity-10 text-info' }
  if (producto === 'ENTERFAC') return { label: 'Enternet', className: 'bg-primary bg-opacity-10 text-primary' }
  return { label: producto, className: 'bg-secondary bg-opacity-10 text-secondary' }
}

const OnboardingEmpresasProceso: React.FC = () => {
  const [empresas, setEmpresas]         = useState<EmpresaProceso[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [filtroEjecutivo, setFiltroEjecutivo] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | OnboardingEstado>('todos')
  const [busqueda, setBusqueda]         = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await (supabase as any)
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
              updated_at
            )
          `)

        if (error) throw error

        const rows: EmpresaProceso[] = (data ?? [])
          .filter((row: any) => row.empresa_onboarding?.length > 0)
          .map((row: any) => {
            const ob = row.empresa_onboarding[0]
            return {
              id:             ob.id as number,
              empkey:         row.empkey as number,
              rut:            row.rut as string | null,
              nombre:         row.nombre as string | null,
              // ✅ Producto directo desde empresa (viene del formulario de Comercial)
              producto:       (row.producto as string | null) ?? null,
              estado:         (ob.estado as OnboardingEstado) ?? 'pendiente',
              encargado_name: (ob.encargado_name as string | null) ?? null,
              updated_at:     (ob.updated_at as string | null) ?? null,
            }
          })

        setEmpresas(rows)
      } catch (err: any) {
        console.error(err)
        setError(err.message ?? 'Error al cargar empresas en proceso')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const ejecutivos = useMemo(() => {
    const set = new Set<string>()
    empresas.forEach((e) => { if (e.encargado_name) set.add(e.encargado_name) })
    return Array.from(set)
  }, [empresas])

  const filtradas = useMemo(() =>
    empresas.filter((e) => {
      if (filtroEjecutivo === 'sin_asignar' && e.encargado_name) return false
      if (filtroEjecutivo !== 'todos' && filtroEjecutivo !== 'sin_asignar' && e.encargado_name !== filtroEjecutivo) return false
      if (filtroEstado !== 'todos' && e.estado !== filtroEstado) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const enNombre  = (e.nombre ?? '').toLowerCase().includes(q)
        const enRut     = (e.rut ?? '').toLowerCase().includes(q)
        const enEjec    = (e.encargado_name ?? '').toLowerCase().includes(q)
        if (!enNombre && !enRut && !enEjec) return false
      }
      return true
    }),
  [empresas, filtroEjecutivo, filtroEstado, busqueda])

  if (loading) return (
    <div className="container-fluid py-5 text-center">
      <Loader2 className="mb-2 text-primary" size={32} />
      <p className="text-muted">Cargando empresas en proceso…</p>
    </div>
  )

  if (error) return (
    <div className="container-fluid py-4">
      <div className="alert alert-danger d-flex align-items-center gap-2">
        <AlertCircle size={18} /><span>{error}</span>
      </div>
    </div>
  )

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h4 mb-1 font-primary fw-bold">Empresas en Proceso</h1>
        <p className="text-muted mb-0">
          Vista global de las empresas en configuración o proceso de PAP, agrupadas por ejecutivo OB.
        </p>
      </div>

      {/* Filtros */}
      <div className="card mb-3">
        <div className="card-body row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Buscar</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nombre, RUT o ejecutivo…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Ejecutivo</label>
            <select
              className="form-select"
              value={filtroEjecutivo}
              onChange={(e) => setFiltroEjecutivo(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="sin_asignar">Sin asignar</option>
              {ejecutivos.map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Estado</label>
            <select
              className="form-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contador */}
      <div className="d-flex justify-content-end mb-2">
        <span className="text-muted small">
          Mostrando <strong>{filtradas.length}</strong> de <strong>{empresas.length}</strong> empresas
        </span>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-body table-responsive p-0">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: 'var(--bs-gray-100)' }}>
              <tr>
                <th className="px-3 py-3" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--bs-gray-600)', fontWeight: 600 }}>RUT</th>
                <th className="px-3 py-3" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--bs-gray-600)', fontWeight: 600 }}>Razón Social</th>
                <th className="px-3 py-3" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--bs-gray-600)', fontWeight: 600 }}>Producto</th>
                <th className="px-3 py-3" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--bs-gray-600)', fontWeight: 600, minWidth: 180 }}>Progreso</th>
                <th className="px-3 py-3" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--bs-gray-600)', fontWeight: 600 }}>Ejecutivo</th>
                <th className="px-3 py-3" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--bs-gray-600)', fontWeight: 600 }}>Última actualización</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    No se encontraron empresas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtradas.map((e) => {
                  const pct      = estadoToPorcentaje(e.estado)
                  const barColor = PROGRESO_COLOR[e.estado]
                  const prod     = formatProducto(e.producto)
                  return (
                    <tr key={e.id}>
                      <td className="px-3 py-3">
                        <span className="small fw-medium">{e.rut ?? '—'}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="fw-semibold">{e.nombre ?? 'Sin nombre'}</span>
                      </td>
                      <td className="px-3 py-3">
                        {e.producto
                          ? <span className={`badge fw-normal ${prod.className}`}>{prod.label}</span>
                          : <span className="text-muted small">—</span>
                        }
                      </td>
                      <td className="px-3 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 6 }}>
                            <div
                              className={`progress-bar ${barColor}`}
                              role="progressbar"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="small text-muted" style={{ minWidth: 32 }}>{pct}%</span>
                          <span className={`badge fw-normal small ${ESTADO_COLOR[e.estado]}`}>
                            {ESTADO_LABEL[e.estado]}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {e.encargado_name
                          ? <span className="small">{e.encargado_name}</span>
                          : <span className="badge bg-warning bg-opacity-10 text-warning fw-normal small">Sin asignar</span>
                        }
                      </td>
                      <td className="px-3 py-3">
                        <span className="small text-muted">
                          {e.updated_at
                            ? new Date(e.updated_at).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '—'
                          }
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OnboardingEmpresasProceso