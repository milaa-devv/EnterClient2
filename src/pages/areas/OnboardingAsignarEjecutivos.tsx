// src/pages/areas/OnboardingAsignarEjecutivos.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { UserCheck, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

type OnboardingEstado = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

interface OnboardingAsignacion {
  id: number
  empkey: number
  rut: string | null
  nombre: string | null
  producto: string | null
  encargado_name: string | null
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

const OnboardingAsignarEjecutivos: React.FC = () => {
  const [empresas, setEmpresas] = useState<OnboardingAsignacion[]>([])
  const [ejecutivos, setEjecutivos] = useState<EjecutivoOB[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  // ===== Carga de datos =====
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Empresas con registro en empresa_onboarding
        const { data: empresaData, error: empresaError } = await supabase
          .from('empresa')
          .select(`
            empkey,
            rut,
            nombre,
            empresa_onboarding (
              id,
              encargado_name,
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
              estado: (ob.estado as OnboardingEstado) ?? 'pendiente',
              updated_at: (ob.updated_at as string | null) ?? null
            }
          })

        setEmpresas(rows)

        // Ejecutivos OB disponibles
        const { data: usuariosData, error: usuariosError } = await supabase
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

      // 👇 Aquí va el cast para evitar el 'never'
      const { error: updateError } = await (supabase as any)
        .from('empresa_onboarding')
        .update({
          encargado_name: nombreEncargado,
          updated_at: ahora
        })
        .eq('id', row.id)

      if (updateError) throw updateError

      // Actualizar en memoria
      setEmpresas((prev) =>
        prev.map((e) =>
          e.id === row.id
            ? {
                ...e,
                encargado_name: nombreEncargado,
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
            <h1 className="h4 mb-0 font-primary">Asignar ejecutivos OB</h1>
            <p className="text-muted small mb-0">
              Gestiona qué ejecutivo de Onboarding se hará cargo de cada empresa.
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
              Cuando Comercial envíe empresas a Onboarding, podrás asignarlas desde aquí.
            </p>
          </div>
        </div>
      ) : (
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
                  <th>Ejecutivo asignado</th>
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
                      <span className="badge bg-light text-dark border">
                        {ESTADO_LABEL[e.estado]}
                      </span>
                    </td>
                    <td style={{ minWidth: 220 }}>
                      <select
                        className="form-select form-select-sm"
                        value={ejecutivos.find((x) => x.nombre === e.encargado_name)?.rut ?? ''}
                        onChange={(ev) => handleAsignar(e, ev.target.value)}
                      >
                        <option value="">Sin asignar</option>
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
      )}
    </div>
  )
}

export default OnboardingAsignarEjecutivos
