import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AlertCircle, ArrowLeft, Loader2, UserCheck } from 'lucide-react'

type OnboardingEstado = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

interface OnboardingAsignacion {
  id: number            // id de empresa_onboarding
  empkey: number
  rut: string | null
  nombre: string | null
  producto: string | null
  encargado_name: string | null
  encargado_rut: string | null
  estado: OnboardingEstado
  updated_at: string | null
}

interface EjecutivoOB {
  rut: string
  nombre: string
}

const ESTADO_LABEL: Record<OnboardingEstado, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado: 'Cancelado'
}

const sb = supabase as any

const OnboardingAsignarEjecutivos: React.FC = () => {
  const [empresas, setEmpresas] = useState<OnboardingAsignacion[]>([])
  const [ejecutivos, setEjecutivos] = useState<EjecutivoOB[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [filtroEjecutivo, setFiltroEjecutivo] = useState<'todos' | 'sin_asignar' | string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | OnboardingEstado>('todos')

  const navigate = useNavigate()

  // ===== Carga de datos =====
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: empresaData, error: empresaError } = await sb
          .from('empresa')
          .select(`
            empkey,
            rut,
            nombre,
            empresa_onboarding (
              id,
              encargado_name,
              encargado_rut,
              estado,
              updated_at
            ),
            empresa_producto (
              producto:producto ( tipo )
            )
          `)

        if (empresaError) throw empresaError

        const rows: OnboardingAsignacion[] = (empresaData ?? [])
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
              encargado_name: (ob.encargado_name as string | null) ?? null,
              encargado_rut: (ob.encargado_rut as string | null) ?? null,
              estado: (ob.estado as OnboardingEstado) ?? 'pendiente',
              updated_at: (ob.updated_at as string | null) ?? null
            }
          })

        setEmpresas(rows)

        const { data: usuariosData, error: usuariosError } = await sb
          .from('usuario')
          .select('rut, nombre, perfil_usuarios!inner(nombre)')
          .eq('perfil_usuarios.nombre', 'OB')

        if (usuariosError) throw usuariosError

        const ejecutivosRows: EjecutivoOB[] = (usuariosData ?? []).map((u: any) => ({
          rut: u.rut as string,
          nombre: u.nombre as string
        }))

        setEjecutivos(ejecutivosRows)
      } catch (err: any) {
        console.error(err)
        setError(err.message ?? 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // ===== Asignar / reasignar ejecutivo =====
  const handleAsignar = async (row: OnboardingAsignacion, nuevoEncargadoRut: string) => {
    setError(null)
    setSavingId(row.id)

    try {
      const seleccionado = ejecutivos.find((e) => e.rut === nuevoEncargadoRut)
      const nombreEncargado = seleccionado?.nombre ?? null
      const ahora = new Date().toISOString()

      const { error: updateError } = await sb
        .from('empresa_onboarding')
        .update({
          encargado_name: nombreEncargado,
          encargado_rut: nuevoEncargadoRut,
          updated_at: ahora
        })
        .eq('id', row.id)

      if (updateError) throw updateError

      await sb.from('onboarding_notificacion').insert({
        empkey: row.empkey,
        tipo: 'asignado_ejecutivo',
        descripcion: `Asignada a ${nombreEncargado ?? 'Sin nombre'} (${nuevoEncargadoRut})`
      })

      setEmpresas((prev) =>
        prev.map((e) =>
          e.id === row.id
            ? {
                ...e,
                encargado_name: nombreEncargado,
                encargado_rut: nuevoEncargadoRut,
                updated_at: ahora
              }
            : e
        )
      )
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al asignar ejecutivo')
    } finally {
      setSavingId(null)
    }
  }

  // ===== Filtros y resumen =====
  const empresasFiltradas = useMemo(
    () =>
      empresas.filter((e) => {
        if (filtroEjecutivo === 'sin_asignar') {
          if (e.encargado_rut) return false
        } else if (filtroEjecutivo !== 'todos' && e.encargado_rut !== filtroEjecutivo) {
          return false
        }

        if (filtroEstado !== 'todos' && e.estado !== filtroEstado) return false
        return true
      }),
    [empresas, filtroEjecutivo, filtroEstado]
  )

  const resumenPorEjecutivo = useMemo(() => {
    const map = new Map<string, number>()

    empresas.forEach((e) => {
      const key = e.encargado_name ? e.encargado_name : 'Sin asignar'
      map.set(key, (map.get(key) ?? 0) + 1)
    })

    return Array.from(map.entries()).map(([nombre, cant]) => ({ nombre, cant }))
  }, [empresas])

  // ===== Render =====
  return (
    <div className="container-fluid py-4">
      {/* Header + botón Atrás */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="me-1" />
            Atrás
          </button>
          <div>
            <h1 className="h4 mb-0 font-primary">👥 Gestión de Ejecutivos</h1>
            <p className="text-muted small mb-0">
              Revisa y reasigna las empresas en Onboarding entre los distintos ejecutivos.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Loader2 className="mb-2" size={32} />
          <p className="text-muted">Cargando empresas…</p>
        </div>
      ) : empresas.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <UserCheck size={48} className="text-muted mb-3" />
            <h5 className="mb-2">No hay empresas en Onboarding</h5>
            <p className="text-muted mb-0">
              Cuando existan empresas en proceso, podrás gestionar sus asignaciones aquí.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Resumen por ejecutivo */}
          <div className="row mb-3">
            {resumenPorEjecutivo.map((r) => (
              <div key={r.nombre} className="col-md-3 mb-2">
                <div className="card h-100">
                  <div className="card-body py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-muted text-truncate">{r.nombre}</span>
                      <span className="badge bg-primary">{r.cant}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap gap-3">
              <div>
                <label className="form-label small mb-1">Filtrar por ejecutivo</label>
                <select
                  className="form-select form-select-sm"
                  value={filtroEjecutivo}
                  onChange={(e) => setFiltroEjecutivo(e.target.value as any)}
                >
                  <option value="todos">Todos</option>
                  <option value="sin_asignar">Sin asignar</option>
                  {ejecutivos.map((ej) => (
                    <option key={ej.rut} value={ej.rut}>
                      {ej.nombre} ({ej.rut})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label small mb-1">Filtrar por estado</label>
                <select
                  className="form-select form-select-sm"
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

          {/* Tabla principal */}
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
                    <th>Ejecutivo actual</th>
                    <th>Cambiar ejecutivo</th>
                  </tr>
                </thead>
                <tbody>
                  {empresasFiltradas.map((e) => (
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
                      <td>{e.encargado_name ?? <span className="text-muted">Sin asignar</span>}</td>
                      <td style={{ minWidth: 220 }}>
                        <select
                          className="form-select form-select-sm"
                          value={e.encargado_rut ?? ''}
                          onChange={(ev) => handleAsignar(e, ev.target.value)}
                        >
                          <option value="">Sin asignar</option>
                          {ejecutivos.map((ej) => (
                            <option key={ej.rut} value={ej.rut}>
                              {ej.nombre} ({ej.rut})
                            </option>
                          ))}
                        </select>
                        {savingId === e.id && (
                          <span className="text-muted small d-flex align-items-center gap-1 mt-1">
                            <Loader2 size={14} className="spin" />
                            Guardando…
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OnboardingAsignarEjecutivos
