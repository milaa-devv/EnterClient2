import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Building2 } from 'lucide-react'
import { formatRut } from '@/lib/utils'

interface EmpresaOnboardingRow {
  empkey: number
  rut: string | null
  nombre: string | null
  estado_onboarding: string | null
  encargado: string | null
}

const getProgressFromEstado = (estado: string | null): number => {
  if (!estado) return 0
  if (estado === 'pendiente') return 0
  if (estado === 'en_proceso') return 60
  if (estado === 'completado') return 100
  return 0
}

const OnboardingEmpresasProceso: React.FC = () => {
  const [empresas, setEmpresas] = useState<EmpresaOnboardingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEmpresas = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('empresa')
        .select(`
          empkey,
          rut,
          nombre,
          empresa_onboarding (
            estado,
            encargado_name
          )
        `)

      if (error) throw error

      const mapped: EmpresaOnboardingRow[] = (data || []).map((e: any) => ({
        empkey: e.empkey,
        rut: e.rut ?? null,
        nombre: e.nombre ?? null,
        estado_onboarding: e.empresa_onboarding?.estado ?? null,
        encargado: e.empresa_onboarding?.encargado_name ?? null
      }))

      const enProceso = mapped.filter(
        e => e.estado_onboarding === 'en_proceso' || e.estado_onboarding === 'completado'
      )

      setEmpresas(enProceso)
    } catch (err: any) {
      console.error(err)
      setError('Error al cargar empresas en proceso: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmpresas()
  }, [])

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <h1 className="font-primary fw-bold mb-1">
            Empresas en Proceso
          </h1>
          <p className="text-muted mb-0">
            Empresas en configuración y en estado PAP (completadas en Onboarding)
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando empresas en proceso...</p>
        </div>
      ) : empresas.length === 0 ? (
        <div className="text-center py-5">
          <Building2 size={48} className="text-muted mb-2" />
          <p className="text-muted mb-0">No hay empresas en proceso actualmente</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>RUT</th>
                  <th>Empkey</th>
                  <th>Ejecutivo OB</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((e) => {
                  const progress = getProgressFromEstado(e.estado_onboarding)
                  return (
                    <tr key={e.empkey}>
                      <td>{e.nombre || 'Sin nombre'}</td>
                      <td>{e.rut ? formatRut(e.rut) : 'Sin RUT'}</td>
                      <td className="fw-bold text-primary">{e.empkey}</td>
                      <td>{e.encargado || 'Sin ejecutivo'}</td>
                      <td>
                        <span className={`badge ${
                          e.estado_onboarding === 'completado'
                            ? 'bg-success'
                            : 'bg-info'
                        }`}>
                          {e.estado_onboarding || '—'}
                        </span>
                      </td>
                      <td style={{ width: 180 }}>
                        <div className="progress" style={{ height: 8 }}>
                          <div
                            className={`progress-bar ${
                              progress === 100 ? 'bg-success' : 'bg-info'
                            }`}
                            role="progressbar"
                            style={{ width: `${progress}%` }}
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <small className="text-muted ms-1">{progress}%</small>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingEmpresasProceso
