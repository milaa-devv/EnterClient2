import React from 'react'
import { X, FileText, DollarSign, Percent, Info } from 'lucide-react'

interface DTEDetailModalProps {
  dte: any
  isOpen: boolean
  onClose: () => void
}

export const DTEDetailModal: React.FC<DTEDetailModalProps> = ({ dte, isOpen, onClose }) => {
  if (!isOpen) return null

  // Datos mock de impuestos por tipo de DTE
  const getImpuestosPorDTE = (dteId: string) => {
    const impuestos: Record<string, any[]> = {
      '33': [
        { codigo: 14, nombre: 'IVA', tasa: 19, aplicado: true },
        { codigo: 15, nombre: 'Impuesto Específico', tasa: 0, aplicado: false },
        { codigo: 17, nombre: 'Retención', tasa: 10, aplicado: false }
      ],
      '34': [
        { codigo: 14, nombre: 'IVA', tasa: 0, aplicado: false, motivo: 'Factura Exenta' }
      ],
      '39': [
        { codigo: 14, nombre: 'IVA', tasa: 19, aplicado: true },
        { codigo: 271, nombre: 'Impuesto Municipal', tasa: 0.5, aplicado: true }
      ],
      '52': [
        { codigo: 14, nombre: 'IVA', tasa: 19, aplicado: true }
      ]
    }
    
    return impuestos[dteId] || []
  }

  const impuestos = getImpuestosPorDTE(dte.id)

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <FileText size={20} />
              {dte.nombre} - Código {dte.id}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />
          </div>
          
          <div className="modal-body">
            {/* Estado del DTE */}
            <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
              <Info size={18} />
              <div>
                <strong>Estado:</strong> {dte.habilitado ? 'Habilitado para emisión' : 'No habilitado'}
                {!dte.habilitado && (
                  <div className="small mt-1">
                    Este tipo de documento no está configurado para la empresa
                  </div>
                )}
              </div>
            </div>

            {/* Información del Documento */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6 className="font-primary fw-semibold mb-3">Información General</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Código SII:</strong></td>
                      <td>{dte.id}</td>
                    </tr>
                    <tr>
                      <td><strong>Nombre:</strong></td>
                      <td>{dte.nombre}</td>
                    </tr>
                    <tr>
                      <td><strong>Tipo:</strong></td>
                      <td>
                        {dte.id.startsWith('3') ? 'Documento Tributario' : 
                         dte.id.startsWith('5') ? 'Documento de Traslado' : 
                         'Documento de Ajuste'}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Requiere Timbre:</strong></td>
                      <td>
                        <span className="badge bg-success">Sí</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="col-md-6">
                <h6 className="font-primary fw-semibold mb-3">Configuración</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Folio Desde:</strong></td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td><strong>Folio Hasta:</strong></td>
                      <td>1000000</td>
                    </tr>
                    <tr>
                      <td><strong>Próximo Folio:</strong></td>
                      <td className="text-primary fw-bold">00001</td>
                    </tr>
                    <tr>
                      <td><strong>Fecha Autorización:</strong></td>
                      <td>15/03/2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Impuestos */}
            <div className="mb-4">
              <h6 className="font-primary fw-semibold mb-3 d-flex align-items-center gap-2">
                <DollarSign size={18} />
                Impuestos Aplicables
              </h6>
              
              {impuestos.length === 0 ? (
                <div className="alert alert-light">
                  <Percent size={18} className="me-2" />
                  No hay impuestos específicos configurados para este tipo de documento
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Impuesto</th>
                        <th>Tasa (%)</th>
                        <th>Estado</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {impuestos.map((impuesto, index) => (
                        <tr key={index}>
                          <td className="fw-bold">{impuesto.codigo}</td>
                          <td>{impuesto.nombre}</td>
                          <td>
                            {impuesto.tasa > 0 ? (
                              <span className="badge bg-info">{impuesto.tasa}%</span>
                            ) : (
                              <span className="badge bg-secondary">0%</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${
                              impuesto.aplicado ? 'bg-success' : 'bg-warning'
                            }`}>
                              {impuesto.aplicado ? 'Aplicado' : 'No Aplicado'}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {impuesto.motivo || 'Según configuración estándar'}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Restricciones */}
            <div className="alert alert-warning">
              <h6 className="alert-heading">Restricciones y Validaciones</h6>
              <ul className="mb-0 small">
                <li>Los folios deben ser correlativos</li>
                <li>El certificado digital debe estar vigente</li>
                <li>Se requiere conexión con SII para timbrado</li>
                {dte.id === '33' && <li>Factura requiere datos completos del receptor</li>}
                {dte.id === '39' && <li>Boleta permite receptor genérico</li>}
              </ul>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cerrar
            </button>
            <button type="button" className="btn btn-primary">
              Configurar Impuestos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
