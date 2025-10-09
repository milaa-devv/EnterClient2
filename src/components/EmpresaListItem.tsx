import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Calendar, MapPin, Phone, Mail, Users, ExternalLink } from 'lucide-react'
import { getStatusLabel, formatDate, formatRut } from '@/lib/utils'
import type { EmpresaCompleta } from '@/types/empresa'

interface EmpresaListItemProps {
  empresa: EmpresaCompleta
}

const SUPABASE_PUBLIC_URL = 'https://zaewjhhtvnoyoisitkog.supabase.co/storage/v1/object/public/logos'

const getLogoUrl = (logoPath?: string): string | undefined => {
  if (!logoPath) return undefined
  if (logoPath.startsWith('http')) return logoPath
  const fileName = logoPath.split('/').pop() || ''
  return `${SUPABASE_PUBLIC_URL}/${fileName}`
}

export const EmpresaListItem: React.FC<EmpresaListItemProps> = ({ empresa }) => {
  const estado = empresa.estado ?? ''
  const statusLabel = getStatusLabel(estado)

  const logoSrc: string | undefined = getLogoUrl(empresa.comercial?.datosGenerales?.logo ?? undefined)

  return (
    <div className="card">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-3">
              <div className="empresa-logo">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={empresa.comercial.datosGenerales.nombre}
                    className="w-100 h-100 object-fit-cover rounded"
                  />
                ) : (
                  <Building2 size={32} className="text-muted" />
                )}
              </div>
              <div className="min-width-0 flex-grow-1">
                <h6 className="mb-1 text-truncate">
                  {empresa.comercial?.datosGenerales?.nombre || 'Sin nombre'}
                </h6>
                <p className="mb-1 text-muted small">
                  {empresa.comercial?.datosGenerales?.rut
                    ? formatRut(empresa.comercial.datosGenerales.rut)
                    : 'Sin RUT'}
                </p>
                <p className="mb-0 small">
                  <strong>Empkey:</strong> {empresa.empkey}
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 d-none d-lg-block">
            <div className="d-flex flex-column gap-1">
              {empresa.comercial?.datosContacto?.telefono && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Phone size={14} />
                  <span>{empresa.comercial.datosContacto.telefono}</span>
                </div>
              )}
              {empresa.comercial?.datosContacto?.correo && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Mail size={14} />
                  <span className="text-truncate">{empresa.comercial.datosContacto.correo}</span>
                </div>
              )}
              {empresa.comercial?.datosContacto?.domicilio && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <MapPin size={14} />
                  <span className="text-truncate">{empresa.comercial.datosContacto.domicilio}</span>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-3 d-none d-lg-block">
            <div className="d-flex flex-column gap-1">
              {empresa.comercial?.informacionPlan && (
                <div className="d-flex gap-1 flex-wrap">
                  <span
                    className={`badge ${
                      empresa.comercial.informacionPlan.producto === 'ENTERFAC'
                        ? 'bg-primary'
                        : 'bg-success'
                    }`}
                  >
                    {empresa.comercial.informacionPlan.producto}
                  </span>
                </div>
              )}
              {empresa.comercial?.datosGenerales?.fecha_inicio && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Calendar size={14} />
                  <span>Inicio: {formatDate(empresa.comercial.datosGenerales.fecha_inicio)}</span>
                </div>
              )}
              {empresa.comercial?.representantesLegales?.length > 0 && (
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Users size={14} />
                  <span>{empresa.comercial.representantesLegales.length} representante(s)</span>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-2">
            <div className="d-flex flex-column align-items-end gap-2">
              <span className={`empresa-status status-${estado.toLowerCase()}`}>
                {statusLabel}
              </span>
              <Link
                to={`/empresa/${empresa.empkey}`}
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              >
                <ExternalLink size={14} />
                Ver Detalle
              </Link>
            </div>
          </div>
        </div>

        <div className="d-lg-none mt-3 pt-3 border-top">
          <div className="row g-3">
            <div className="col-6">
              {empresa.comercial?.datosContacto?.telefono && (
                <div className="d-flex align-items-center gap-2 small">
                  <Phone size={14} />
                  <span>{empresa.comercial.datosContacto.telefono}</span>
                </div>
              )}
            </div>
            <div className="col-6">
              {empresa.comercial?.informacionPlan && (
                <span
                  className={`badge ${
                    empresa.comercial.informacionPlan.producto === 'ENTERFAC'
                      ? 'bg-primary'
                      : 'bg-success'
                  }`}
                >
                  {empresa.comercial.informacionPlan.producto}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
