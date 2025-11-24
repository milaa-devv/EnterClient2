import React from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Users,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'
import { getStatusLabel, formatDate, formatRut } from '@/lib/utils'
import type { EmpresaCompleta } from '@/types/empresa'

interface EmpresaListItemProps {
  empresa: EmpresaCompleta
  /** Callback opcional para botón "Actualizar" */
  onRefresh?: () => void
}

const SUPABASE_PUBLIC_URL =
  'https://zaewjhhtvnoyoisitkog.supabase.co/storage/v1/object/public/logos'

const getLogoUrl = (logoPath?: string): string | undefined => {
  if (!logoPath) return undefined
  if (logoPath.startsWith('http')) return logoPath
  const fileName = logoPath.split('/').pop() || ''
  return `${SUPABASE_PUBLIC_URL}/${fileName}`
}

/**
 * Calcula un porcentaje de avance "genérico" para Onboarding
 * según los estados conocidos.
 */
function getProgress(empresa: EmpresaCompleta) {
  const topEstado = empresa.estado || ''
  const obEstado = (empresa as any).empresa_onboarding?.estado || ''
  const estado = (obEstado || topEstado || '').toUpperCase()

  if (!estado || estado === 'COMERCIAL' || estado === 'PENDIENTE') {
    return { value: 0, label: 'Pendiente', color: 'secondary' as const }
  }

  if (estado === 'ONBOARDING') {
    return { value: 50, label: 'En progreso', color: 'info' as const }
  }

  if (estado === 'SAC') {
    return { value: 80, label: 'Preparando PAP', color: 'warning' as const }
  }

  // COMPLETADA u otros estados finales
  return { value: 100, label: 'Completado', color: 'success' as const }
}

export const EmpresaListItem: React.FC<EmpresaListItemProps> = ({
  empresa,
  onRefresh,
}) => {
  const estado = empresa.estado ?? ''
  const statusLabel = getStatusLabel(estado)

  const logoSrc: string | undefined = getLogoUrl(
    empresa.logo ||
      (empresa as any).comercial?.datosGenerales?.logo ||
      undefined
  )

  const nombre =
    empresa.nombre ||
    (empresa as any).comercial?.datosGenerales?.nombre ||
    'Sin nombre'

  const rutRaw =
    empresa.rut ||
    (empresa as any).comercial?.datosGenerales?.rut ||
    undefined

  const rutFmt = rutRaw ? formatRut(rutRaw) : 'Sin RUT'

  const telefono =
    empresa.telefono ||
    (empresa as any).comercial?.datosContacto?.telefono ||
    undefined
  const correo =
    empresa.correo ||
    (empresa as any).comercial?.datosContacto?.correo ||
    undefined
  const domicilio =
    empresa.domicilio ||
    (empresa as any).comercial?.datosContacto?.domicilio ||
    undefined

  // Producto (si lo tienes desde relaciones; si no, muestra "—")
  const producto =
    (empresa as any).comercial?.informacionPlan?.producto ||
    (empresa as any).productos?.[0]?.producto?.nombre ||
    '—'

  const fechaInicio =
    (empresa as any).comercial?.datosGenerales?.fecha_inicio ||
    empresa.fecha_inicio ||
    null

  const representantesCount =
    (empresa as any).comercial?.representantesLegales?.length || 0

  const progress = getProgress(empresa)

  return (
    <div className="card">
      <div className="card-body">
        <div className="row align-items-center">
          {/* Logo + nombre */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-3">
              <div className="empresa-logo">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={nombre}
                    className="w-100 h-100 object-fit-cover rounded"
                  />
                ) : (
                  <Building2 size={32} className="text-muted" />
                )}
              </div>
              <div className="min-width-0 flex-grow-1">
                <h6 className="mb-1 text-truncate">{nombre}</h6>
                <p className="mb-1 text-muted small">{rutFmt}</p>
                <p className="mb-0 small">
                  <strong>Empkey:</strong> {empresa.empkey}
                </p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="d-flex flex-column gap-1">
              {telefono && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Phone size={14} />
                  <span>{telefono}</span>
                </div>
              )}
              {correo && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Mail size={14} />
                  <span className="text-truncate">{correo}</span>
                </div>
              )}
              {domicilio && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <MapPin size={14} />
                  <span className="text-truncate">{domicilio}</span>
                </div>
              )}
            </div>
          </div>

          {/* Producto + fechas + reps */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="d-flex flex-column gap-1">
              {producto && (
                <div className="d-flex gap-1 flex-wrap">
                  <span
                    className={`badge ${
                      producto === 'ENTERFAC' ? 'bg-primary' : 'bg-success'
                    }`}
                  >
                    {producto}
                  </span>
                </div>
              )}
              {fechaInicio && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Calendar size={14} />
                  <span>Inicio: {formatDate(fechaInicio)}</span>
                </div>
              )}
              {representantesCount > 0 && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Users size={14} />
                  <span>{representantesCount} representante(s)</span>
                </div>
              )}
            </div>
          </div>

          {/* Estado + progreso + acciones */}
          <div className="col-lg-2">
            <div className="d-flex flex-column align-items-end gap-2">
              <span className={`empresa-status status-${estado.toLowerCase()}`}>
                {statusLabel}
              </span>

              {/* Progreso Onboarding */}
              <div className="w-100">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Progreso</span>
                  <span className="text-muted">
                    {progress.value}% · {progress.label}
                  </span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div
                    className={`progress-bar bg-${progress.color}`}
                    role="progressbar"
                    style={{ width: `${progress.value}%` }}
                    aria-valuenow={progress.value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>

              <div className="d-flex gap-1 mt-2">
                <Link
                  to={`/empresa/${empresa.empkey}`}
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                >
                  <ExternalLink size={14} />
                  Ver
                </Link>

                {onRefresh && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={onRefresh}
                  >
                    <RotateCcw size={14} />
                    Actualizar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Versión mobile (contacto + producto) */}
        <div className="d-lg-none mt-3 pt-3 border-top">
          <div className="row g-3">
            <div className="col-6">
              {telefono && (
                <div className="d-flex align-items-center gap-2 small">
                  <Phone size={14} />
                  <span>{telefono}</span>
                </div>
              )}
            </div>
            <div className="col-6">
              {producto && (
                <span
                  className={`badge ${
                    producto === 'ENTERFAC' ? 'bg-primary' : 'bg-success'
                  }`}
                >
                  {producto}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
