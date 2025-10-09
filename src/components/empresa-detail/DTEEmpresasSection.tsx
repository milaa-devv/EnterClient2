import React, { useState } from 'react'
import { FileText, Info, Eye } from 'lucide-react'
import { DTEDetailModal } from '@/components/modals/DTEDetailModal'
import type { EmpresaCompleta, DocumentoTributario } from '@/types/empresa'

interface DTEEmpresasSectionProps {
  empresa: EmpresaCompleta
}

export const DTEEmpresasSection: React.FC<DTEEmpresasSectionProps> = ({ empresa }) => {
  const [selectedDTE, setSelectedDTE] = useState<DocumentoTributario | null>(null)
  const documentos = empresa.comercial?.documentosTributarios || []

  // Datos mock de tipos de DTE comunes
  const tiposDTE = [
    { id: '33', nombre: 'Factura Electrónica', habilitado: true },
    { id: '34', nombre: 'Factura Exenta', habilitado: false },
    { id: '39', nombre: 'Boleta Electrónica', habilitado: true },
    { id: '41', nombre: 'Boleta Exenta', habilitado: false },
    { id: '52', nombre: 'Guía de Despacho', habilitado: true },
    { id: '56', nombre: 'Nota de Débito', habilitado: true },
    { id: '61', nombre: 'Nota de Crédito', habilitado: false },
    { id: '110', nombre: 'Factura de Exportación', habilitado: false }
  ]

  const handleDTEClick = (documento: any) => {
    setSelectedDTE(documento)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0 font-primary fw-semibold d-flex align-items-center gap-2">
          <FileText size={20} />
          DTE Empresas
          <span className="badge bg-primary">
            {tiposDTE.filter(d => d.habilitado).length}/{tiposDTE.length}
          </span>
        </h5>
      </div>
      <div className="card-body">
        <p className="text-muted small mb-4">
          <Info size={16} className="me-1" />
          Haz clic en cualquier documento para ver detalles de impuestos y configuración
        </p>
        
        <div className="row g-3">
          {tiposDTE.map((dte) => (
            <div key={dte.id} className="col-lg-3 col-md-4 col-sm-6">
              <div 
                className={`card border h-100 cursor-pointer transition-all ${
                  dte.habilitado 
                    ? 'border-success bg-light-success' 
                    : 'border-light bg-light text-muted'
                }`}
                onClick={() => handleDTEClick(dte)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body text-center p-3">
                  <FileText 
                    size={32} 
                    className={`mb-2 ${
                      dte.habilitado ? 'text-success' : 'text-muted'
                    }`} 
                  />
                  <h6 className="card-title small mb-1">{dte.id}</h6>
                  <p className="card-text small mb-2">{dte.nombre}</p>
                  <span className={`badge ${
                    dte.habilitado ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {dte.habilitado ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
                <div className="card-footer bg-transparent border-0 text-center p-2">
                  <button className="btn btn-sm btn-outline-primary">
                    <Eye size={14} className="me-1" />
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tiposDTE.filter(d => d.habilitado).length === 0 && (
          <div className="text-center py-4">
            <FileText size={48} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay documentos tributarios habilitados</p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedDTE && (
        <DTEDetailModal
          dte={selectedDTE}
          isOpen={!!selectedDTE}
          onClose={() => setSelectedDTE(null)}
        />
      )}
    </div>
  )
}
