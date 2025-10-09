import React from 'react'
import { Users, Phone, Mail, User, Plus } from 'lucide-react'
import { formatRut } from '@/lib/utils'
import type { EmpresaCompleta } from '@/types/empresa'

interface RepresentantesLegalesSectionProps {
  empresa: EmpresaCompleta
}

export const RepresentantesLegalesSection: React.FC<RepresentantesLegalesSectionProps> = ({ 
  empresa 
}) => {
  const representantes = empresa.comercial?.representantesLegales || []

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 font-primary fw-semibold d-flex align-items-center gap-2">
            <Users size={20} />
            Representantes Legales
            {representantes.length > 0 && (
              <span className="badge bg-primary">{representantes.length}</span>
            )}
          </h5>
          <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
            <Plus size={16} />
            Agregar
          </button>
        </div>
      </div>
      <div className="card-body">
        {representantes.length === 0 ? (
          <div className="text-center py-4">
            <User size={48} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay representantes legales registrados</p>
          </div>
        ) : (
          <div className="row g-3">
            {representantes.map((representante, index) => (
              <div key={representante.rut || index} className="col-lg-6">
                <div className="border rounded p-3 h-100">
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-medium small">RUT</label>
                      <div className="form-control-plaintext small">
                        {representante.rut ? formatRut(representante.rut) : 'No especificado'}
                      </div>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-medium small">Nombre</label>
                      <div className="form-control-plaintext small">
                        {representante.nombre || 'No especificado'}
                      </div>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-medium small">Correo</label>
                      <div className="form-control-plaintext small d-flex align-items-center gap-1">
                        <Mail size={14} className="text-muted" />
                        <span className="text-truncate">
                          {representante.correo || 'No especificado'}
                        </span>
                      </div>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-medium small">Teléfono</label>
                      <div className="form-control-plaintext small d-flex align-items-center gap-1">
                        <Phone size={14} className="text-muted" />
                        <span>{representante.telefono || 'No especificado'}</span>
                      </div>
                    </div>
                    {representante.fecha_incorporacion && (
                      <div className="col-12">
                        <label className="form-label fw-medium small">Fecha de Incorporación</label>
                        <div className="form-control-plaintext small">
                          {formatDate(representante.fecha_incorporacion)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
