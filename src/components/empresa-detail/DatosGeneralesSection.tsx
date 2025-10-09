import React from 'react'
import { Building2, Calendar, MapPin, Phone, Mail } from 'lucide-react'
import { formatRut, formatDate } from '@/lib/utils'
import type { EmpresaCompleta } from '@/types/empresa'

interface DatosGeneralesSectionProps {
  empresa: EmpresaCompleta
}

export const DatosGeneralesSection: React.FC<DatosGeneralesSectionProps> = ({ empresa }) => {
  const datosGenerales = empresa.comercial?.datosGenerales
  const datosContacto = empresa.comercial?.datosContacto

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0 font-primary fw-semibold d-flex align-items-center gap-2">
          <Building2 size={20} />
          Datos Generales de la Empresa
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-4">
          {/* Logo y datos principales */}
          <div className="col-lg-8">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">Empkey</label>
                <div className="form-control-plaintext fw-bold text-primary">
                  {empresa.empkey}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Nombre</label>
                <div className="form-control-plaintext">
                  {datosGenerales?.nombre || 'No especificado'}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">RUT</label>
                <div className="form-control-plaintext">
                  {datosGenerales?.rut ? formatRut(datosGenerales.rut) : 'No especificado'}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Nombre de Fantasía</label>
                <div className="form-control-plaintext">
                  {datosGenerales?.nombre_fantasia || 'No especificado'}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Fecha de Inicio de Actividades</label>
                <div className="form-control-plaintext d-flex align-items-center gap-2">
                  <Calendar size={16} className="text-muted" />
                  {datosGenerales?.fecha_inicio ? 
                    formatDate(datosGenerales.fecha_inicio) : 
                    'No especificado'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="col-lg-4">
            <label className="form-label fw-medium">Logo</label>
            <div className="d-flex justify-content-center align-items-center border rounded" 
                 style={{ height: '150px' }}>
              {datosGenerales?.logo ? (
                <img
                  src={datosGenerales.logo}
                  alt="Logo empresa"
                  className="img-fluid"
                  style={{ maxHeight: '120px', maxWidth: '100%' }}
                />
              ) : (
                <div className="text-center text-muted">
                  <Building2 size={48} className="mb-2" />
                  <p className="small mb-0">Sin logo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="my-4" />

        {/* Datos de Contacto */}
        <h6 className="font-primary fw-semibold mb-3">Datos de Contacto</h6>
        <div className="row g-3">
          <div className="col-lg-4">
            <label className="form-label fw-medium">Domicilio</label>
            <div className="form-control-plaintext d-flex align-items-center gap-2">
              <MapPin size={16} className="text-muted flex-shrink-0" />
              <span>{datosContacto?.domicilio || 'No especificado'}</span>
            </div>
          </div>
          <div className="col-lg-4">
            <label className="form-label fw-medium">Teléfono</label>
            <div className="form-control-plaintext d-flex align-items-center gap-2">
              <Phone size={16} className="text-muted" />
              <span>{datosContacto?.telefono || 'No especificado'}</span>
            </div>
          </div>
          <div className="col-lg-4">
            <label className="form-label fw-medium">Correo</label>
            <div className="form-control-plaintext d-flex align-items-center gap-2">
              <Mail size={16} className="text-muted" />
              <span>{datosContacto?.correo || 'No especificado'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
