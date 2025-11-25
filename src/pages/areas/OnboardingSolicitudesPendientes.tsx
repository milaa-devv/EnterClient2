// src/pages/areas/OnboardingSolicitudesPendientes.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, UserPlus, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatRut } from '@/lib/utils'

type EstadoOnboarding = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

interface SolicitudPendiente {
  id: number
  empkey: number
  estado: EstadoOnboarding
  encargado_name: string | null
  updated_at: string | null
  empresa: {
    empkey: number
    rut: string | null
    nombre: string | null
  } | null
}

const OnboardingSolicitudesPendientes: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  const loadSolicitudes = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('empresa_onboarding')
      .select(
        `
        id,
        empkey,
        estado,
        encargado_name,
        updated_at,
        empresa:empresa (
          empkey,
          rut,
          nombre
        )
      `
      )
      .eq('estado', 'pendiente')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error(error)
      setError('Error al cargar las solicitudes pendientes')
    } else {
      setSolicitudes((data || []) as SolicitudPendiente[])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSolicitudes()
  }, [])

  const handleVerDetalle = (empkey: number) => {
    navigate(`/empresa/${empkey}`)
  }

  const handleIrAsignar = (empkey: number) => {
    navigate('/onboarding/asignar-ejecutivos', { state: { empkey } })
  }

  const formatFecha = (iso?: string | null) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleString('es-CL')
  }

  return (
    <div className="container-fluid">
      {/* Header con botón Atrás */}
      <div className="row mb-4">
        <div className="col d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} /> Atrás
            </button>
            <div>
              <h1 className="font-primary fw-bold mb-0">Solicitudes Pendientes</h1>
              <p className="text-muted small mb-0">
                Empresas que llegaron desde Comercial y aún no tienen ejecutivo asignado.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={loadSolicitudes}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Actualizar listado
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando solicitudes pendientes…</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <Clock size={48} className="text-muted mb-3" />
            <h5 className="mb-2">No hay solicitudes pendientes</h5>
            <p className="text-muted mb-0">
              Cuando Comercial termine una empresa y aún no esté asignada, aparecerá aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 font-primary fw-semibold">
              Empresas sin ejecutivo asignado
            </h5>
            <span className="badge bg-warning">
              {solicitudes.length} pendiente(s)
            </span>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Empkey</th>
                    <th>RUT</th>
                    <th>Razón Social</th>
                    <th>Estado</th>
                    <th>Última actualización</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <tr key={s.id}>
                      <td>{s.empkey}</td>
                      <td>{s.empresa?.rut ? formatRut(s.empresa.rut) : '—'}</td>
                      <td>{s.empresa?.nombre ?? '—'}</td>
                      <td>
                        <span className="badge bg-warning text-dark text-uppercase">
                          {s.estado}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatFecha(s.updated_at)}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleVerDetalle(s.empkey)}
                          >
                            Ver detalle
                          </button>
                          <button
                            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                            onClick={() => handleIrAsignar(s.empkey)}
                          >
                            <UserPlus size={14} />
                            Asignar ejecutivo
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingSolicitudesPendientes
