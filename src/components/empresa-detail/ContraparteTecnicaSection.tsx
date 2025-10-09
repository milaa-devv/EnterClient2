import React from 'react'
import { Settings, Phone, Mail, User, Plus } from 'lucide-react'
import { formatRut } from '@/lib/utils'
import type { EmpresaCompleta } from '@/types/empresa'

interface ContraparteTecnicaSectionProps {
  empresa: EmpresaCompleta
}

export const ContraparteTecnicaSection: React.FC<ContraparteTecnicaSectionProps> = ({ 
  empresa 
}) => {
  const contrapartes = empresa.comercial?.contrapartes?.filter(c => c.tipo === 'TECNICA') || []

  return (
    <div className="card h-100">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 font-primary fw-semibold d-flex align-items-center gap-2">
            <Settings size={20} />
            Contraparte Técnica
            {contrapartes.length > 0 && (
              <span className="badge bg-info">{contrapartes.length}</span>
            )}
          </h5>
          <button className="btn btn-sm btn-outline-info d-flex align-items-center gap-1">
            <Plus size={16} />
            Agregar
          </button>
        </div>
      </div>
      <div className="card-body">
        {contrapartes.length === 0 ? (
          <div className="text-center py-4">
            <Settings size={48} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay contraparte técnica registrada</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {contrapartes.map((contraparte, index) => (
              <div key={contraparte.id || index} className="border rounded p-3">
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label fw-medium small">RUT</label>
                    <div className="form-control-plaintext small">
                      {contraparte.rut ? formatRut(contraparte.rut) : 'No especificado'}
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-medium small">Nombre</label>
                    <div className="form-control-plaintext small">
                      {contraparte.nombre || 'No especificado'}
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-medium small">Correo</label>
                    <div className="form-control-plaintext small d-flex align-items-center gap-1">
                      <Mail size={14} className="text-muted" />
                      <span className="text-truncate">
                        {contraparte.correo || 'No especificado'}
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-medium small">Teléfono</label>
                    <div className="form-control-plaintext small d-flex align-items-center gap-1">
                      <Phone size={14} className="text-muted" />
                      <span>{contraparte.telefono || 'No especificado'}</span>
                    </div>
                  </div>
                  {contraparte.cargo && (
                    <div className="col-12">
                      <label className="form-label fw-medium small">Cargo</label>
                      <div className="form-control-plaintext small">
                        {contraparte.cargo}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
