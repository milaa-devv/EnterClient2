import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle } from 'lucide-react'

type OnboardingEstado = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

interface EmpresaProceso {
  id: number
  empkey: number
  rut: string | null
  nombre: string | null
  producto: string | null
  estado: OnboardingEstado
  encargado_name: string | null
  updated_at: string | null
}

const ESTADO_LABEL: Record<OnboardingEstado, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado: 'Cancelado'
}

function estadoToPorcentaje(estado: OnboardingEstado) {
  switch (estado) {
    case 'pendiente':
      return 25
    case 'en_proceso':
      return 60
    case 'completado':
      return 100
    case 'cancelado':
      return 0
    default:
      return 0
  }
}

const OnboardingEmpresasProceso: React.FC = () => {
  const [empresas, setEmpresas] = useState<EmpresaProceso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filtroEjecutivo, setFiltroEjecutivo] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | OnboardingEstado>('todos')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const sb = supabase as any

        const { data, error } = await sb
          .from('empresa')
          .select(`
            empkey,
            rut,
            nombre,
            empresa_onboarding (
              id,
              estado,
              encargado_name,
              updated_at
            ),
            empresa_producto (
              producto:producto ( tipo )
            )
          `)

        if (error) throw error

        const rows: EmpresaProceso[] = (data ?? [])
          .filter((row: any) => row.empresa_onboarding && row.empresa_onboarding.length > 0)
          .map((row: any) => {
            const ob = row.empresa_onboarding[0]
            const prodRel = row.empresa_producto?.[0]?.producto

            return {
              id: ob.id as number,
              empkey: row.empkey as number,
              rut: row.rut as string | null,
              nombre: row.nombre as string | null,
              producto: (prodRel?.tipo as string | null) ?? null,
              estado: (ob.estado as OnboardingEstado) ?? 'pendiente',
              encargado_name: (ob.encargado_name as string | null) ?? null,
              updated_at: (ob.updated_at as string | null) ?? null
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
    empresas.forEach((e) => {
      if (e.encargado_name) set.add(e.encargado_name)
    })
    return Array.from(set)
  }, [empresas])

  const filtradas = useMemo(
    () =>
      empresas.filter((e) => {
        if (filtroEjecutivo === 'sin_asignar') {
          if (e.encargado_name) return false
        } else if (filtroEjecutivo !== 'todos') {
          if (e.encargado_name !== filtroEjecutivo) return false
        }

        if (filtroEstado !== 'todos' && e.estado !== filtroEstado) return false

        return true
      }),
    [empresas, filtroEjecutivo, filtroEstado]
  )

  if (loading) {
    return (
      <div className="container-fluid py-4 text-center">
        <Loader2 className="mb-2" size={32} />
        <p className="text-muted">Cargando empresas en proceso…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-3">
        <h1 className="h4 mb-1 font-primary">Empresas en Proceso</h1>
        <p className="text-muted mb-0">
          Vista global de las empresas que se están configurando o en proceso de PAP,
          agrupadas por ejecutivo OB.
        </p>
      </div>

      {/* Filtros */}
      <div className="card mb-3">
        <div className="card-body row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Filtrar por ejecutivo</label>
            <select
              className="form-select"
              value={filtroEjecutivo}
              onChange={(e) => setFiltroEjecutivo(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="sin_asignar">Sin asignar</option>
              {ejecutivos.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Filtrar por estado</label>
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

      {/* Tabla */}
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Empkey</th>
                <th>RUT</th>
                <th>Razón Social</th>
                <th>Producto</th>
                <th>Estado</th>
                <th>Progreso</th>
                <th>Ejecutivo</th>
                <th>Última actualización</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => {
                const pct = estadoToPorcentaje(e.estado)
                return (
                  <tr key={e.id}>
                    <td>{e.empkey}</td>
                    <td>{e.rut ?? '—'}</td>
                    <td>{e.nombre ?? 'Sin nombre'}</td>
                    <td>{e.producto ?? '—'}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {ESTADO_LABEL[e.estado]}
                      </span>
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: 6 }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="small text-muted">{pct}%</span>
                      </div>
                    </td>
                    <td>{e.encargado_name ?? <span className="text-muted">Sin asignar</span>}</td>
                    <td>
                      {e.updated_at
                        ? new Date(e.updated_at).toLocaleString('es-CL')
                        : '—'}
                    </td>
                  </tr>
                )
              })}
              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No se encontraron empresas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OnboardingEmpresasProceso
