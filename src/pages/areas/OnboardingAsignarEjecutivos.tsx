import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AlertCircle, ArrowLeft, Inbox, Loader2, UserCheck } from 'lucide-react'

type OnboardingEstado = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

interface BandejaRow {
  id: number            // id de empresa_onboarding
  empkey: number
  rut: string | null
  nombre: string | null
  producto: string | null
  estado: OnboardingEstado
  encargado_name: string | null
  encargado_rut: string | null
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

// Usaremos este alias para no pelear con los tipos de Supabase
const sb = supabase as any

const OnboardingSolicitudesPendientes: React.FC = () => {
  const [empresas, setEmpresas] = useState<BandejaRow[]>([])
  const [ejecutivos, setEjecutivos] = useState<EjecutivoOB[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Traemos empresas + onboarding + producto
      const { data, error: empresaError } = await sb
        .from('empresa')
        .select(`
          empkey,
          rut,
          nombre,
          empresa_onboarding (
            id,
            estado,
            encargado_name,
            encargado_rut,
            updated_at
          ),
          empresa_producto (
            producto:producto ( tipo )
          )
        `)

      if (empresaError) throw empresaError

      const allRows: BandejaRow[] = (data ?? [])
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
            encargado_rut: (ob.encargado_rut as string | null) ?? null,
            updated_at: (ob.updated_at as string | null) ?? null
          }
        })

      // Solo empresas pendientes y sin ejecutivo asignado
      const pendientesSinEncargado = allRows.filter(
        (r) => r.estado === 'pendiente' && !r.encargado_rut
      )

      setEmpresas(pendientesSinEncargado)

      // Ejecutivos OB disponibles
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

  useEffect(() => {
    loadData()
  }, [])

  const handleAsignar = async (row: BandejaRow, nuevoEncargadoRut: string) => {
    if (!nuevoEncargadoRut) return

    setError(null)
    setSavingId(row.id)

    try {
      const seleccionado = ejecutivos.find((e) => e.rut === nuevoEncargadoRut)
      const nombreEncargado = seleccionado?.nombre ?? null
      const ahora = new Date().toISOString()

      // Actualizar empresa_onboarding
      const { error: updateError } = await sb
        .from('empresa_onboarding')
        .update({
          encargado_name: nombreEncargado,
          encargado_rut: nuevoEncargadoRut,
          updated_at: ahora
        })
        .eq('id', row.id)

      if (updateError) throw updateError

      // Insertar notificación de asignación
      await sb.from('onboarding_notificacion').insert({
        empkey: row.empkey,
        tipo: 'asignado_ejecutivo',
        descripcion: `Asignada a ${nombreEncargado ?? 'Sin nombre'} (${nuevoEncargadoRut})`
      })

      // Como esta pantalla es SOLO de pendientes SIN asignar,
      // si se asigna la empresa se debe sacar del listado.
      setEmpresas((prev) => prev.filter((e) => e.id !== row.id))
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al asignar ejecutivo')
    } finally {
      setSavingId(null)
    }
  }

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
            <h1 className="h4 mb-0 font-primary">📥 Bandeja de Solicitudes</h1>
            <p className="text-muted small mb-0">
              Empresas que llegaron desde Comercial y aún no tienen ejecutivo asignado.
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
          <p className="text-muted">Cargando solicitudes…</p>
        </div>
      ) : empresas.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <Inbox size={48} className="text-muted mb-3" />
            <h5 className="mb-2">No hay solicitudes pendientes</h5>
            <p className="text-muted mb-0">
              Cuando Comercial termine una ficha y la envíe a Onboarding, aparecerá aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body table-responsive">
            <h5 className="mb-3 d-flex align-items-center gap-2">
              <UserCheck size={18} />
              Solicitudes pendientes por asignar
            </h5>

            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Empkey</th>
                  <th>RUT</th>
                  <th>Razón Social</th>
                  <th>Producto</th>
                  <th>Estado</th>
                  <th>Ejecutivo a asignar</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((e) => (
                  <tr key={e.id}>
                    <td>{e.empkey}</td>
                    <td>{e.rut ?? '—'}</td>
                    <td>{e.nombre ?? 'Sin nombre'}</td>
                    <td>{e.producto ?? '—'}</td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {ESTADO_LABEL[e.estado]}
                      </span>
                    </td>
                    <td style={{ minWidth: 220 }}>
                      <select
                        className="form-select form-select-sm"
                        defaultValue=""
                        onChange={(ev) => handleAsignar(e, ev.target.value)}
                      >
                        <option value="">Seleccionar ejecutivo…</option>
                        {ejecutivos.map((ej) => (
                          <option key={ej.rut} value={ej.rut}>
                            {ej.nombre} ({ej.rut})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {savingId === e.id && (
                        <span className="text-muted small d-flex align-items-center gap-1">
                          <Loader2 size={14} className="spin" />
                          Asignando…
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingSolicitudesPendientes
