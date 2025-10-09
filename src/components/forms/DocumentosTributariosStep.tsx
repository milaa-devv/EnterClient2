import React, { useState, useEffect } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { FileText, Info, CheckCircle } from 'lucide-react'
import type { DocumentoTributario } from '@/types/empresa'

export const DocumentosTributariosStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const [documentos, setDocumentos] = useState<DocumentoTributario[]>([])

  // Tipos de documentos tributarios disponibles
  const tiposDocumentos: DocumentoTributario[] = [
    { id: '33', nombre: 'Factura Electrónica', selected: false },
    { id: '34', nombre: 'Factura Exenta', selected: false },
    { id: '39', nombre: 'Boleta Electrónica', selected: false },
    { id: '41', nombre: 'Boleta Exenta', selected: false },
    { id: '43', nombre: 'Liquidación Factura', selected: false },
    { id: '46', nombre: 'Factura de Compra', selected: false },
    { id: '52', nombre: 'Guía de Despacho', selected: false },
    { id: '56', nombre: 'Nota de Débito', selected: false },
    { id: '61', nombre: 'Nota de Crédito', selected: false },
    { id: '110', nombre: 'Factura de Exportación', selected: false },
    { id: '111', nombre: 'Nota de Débito de Exportación', selected: false },
    { id: '112', nombre: 'Nota de Crédito de Exportación', selected: false }
  ]

  useEffect(() => {
    // Inicializar con documentos guardados o tipos por defecto
    const savedDocumentos = state.data.documentosTributarios || []
    if (savedDocumentos.length > 0) {
      setDocumentos(savedDocumentos)
    } else {
      setDocumentos(tiposDocumentos)
    }
  }, [])

  const handleToggleDocumento = (id: string) => {
    const updatedDocumentos = documentos.map(doc => 
      doc.id === id ? { ...doc, selected: !doc.selected } : doc
    )
    setDocumentos(updatedDocumentos)
    updateData({ documentosTributarios: updatedDocumentos })
  }

  const handleSelectAll = () => {
    const allSelected = documentos.every(doc => doc.selected)
    const updatedDocumentos = documentos.map(doc => ({ ...doc, selected: !allSelected }))
    setDocumentos(updatedDocumentos)
    updateData({ documentosTributarios: updatedDocumentos })
  }

  const selectedCount = documentos.filter(doc => doc.selected).length

  const getDocumentoInfo = (id: string) => {
    const info: Record<string, { descripcion: string, categoria: string, requiereReceptor: boolean }> = {
      '33': { 
        descripcion: 'Documento principal para ventas afectas a IVA', 
        categoria: 'Venta',
        requiereReceptor: true
      },
      '34': { 
        descripcion: 'Para ventas exentas de IVA', 
        categoria: 'Venta',
        requiereReceptor: true
      },
      '39': { 
        descripcion: 'Para ventas al consumidor final', 
        categoria: 'Venta',
        requiereReceptor: false
      },
      '41': { 
        descripcion: 'Boleta para ventas exentas', 
        categoria: 'Venta',
        requiereReceptor: false
      },
      '52': { 
        descripcion: 'Para traslado de mercaderías', 
        categoria: 'Traslado',
        requiereReceptor: true
      },
      '56': { 
        descripcion: 'Para aumentar el monto de facturas', 
        categoria: 'Ajuste',
        requiereReceptor: true
      },
      '61': { 
        descripcion: 'Para disminuir el monto de facturas', 
        categoria: 'Ajuste',
        requiereReceptor: true
      }
    }
    return info[id] || { descripcion: 'Documento tributario', categoria: 'General', requiereReceptor: false }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Venta': return 'success'
      case 'Traslado': return 'info'
      case 'Ajuste': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Documentos Tributarios</h4>
        <p className="text-muted">
          Seleccione los tipos de documentos que la empresa va a emitir
        </p>
      </div>

      {/* Resumen y controles */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card bg-light">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2">
                <CheckCircle className="text-success" size={20} />
                <div>
                  <div className="fw-semibold">Documentos Seleccionados</div>
                  <div className="text-muted">{selectedCount} de {documentos.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 d-flex align-items-center">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleSelectAll}
          >
            {documentos.every(doc => doc.selected) ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
          </button>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="row g-3">
        {documentos.map((documento) => {
          const info = getDocumentoInfo(documento.id)
          
          return (
            <div key={documento.id} className="col-lg-6">
              <div 
                className={`card h-100 cursor-pointer transition-all ${
                  documento.selected 
                    ? 'border-success bg-success bg-opacity-10' 
                    : 'border-light'
                }`}
                onClick={() => handleToggleDocumento(documento.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <FileText 
                        size={20} 
                        className={documento.selected ? 'text-success' : 'text-muted'} 
                      />
                      <div>
                        <h6 className="mb-0">DTE {documento.id}</h6>
                        <div className="fw-semibold">{documento.nombre}</div>
                      </div>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={documento.selected}
                        onChange={() => handleToggleDocumento(documento.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  <div className="small text-muted mb-2">
                    {info.descripcion}
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <span className={`badge bg-${getCategoriaColor(info.categoria)}`}>
                      {info.categoria}
                    </span>
                    {info.requiereReceptor && (
                      <span className="badge bg-info">
                        Requiere Receptor
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Documentos más comunes */}
      <div className="mt-4">
        <div className="alert alert-info">
          <h6 className="alert-heading d-flex align-items-center gap-2">
            <Info size={18} />
            Documentos Más Comunes
          </h6>
          <div className="row g-2 mt-2">
            <div className="col-md-4">
              <strong>Empresas de Servicios:</strong>
              <div className="small">Factura Electrónica (33), Nota de Crédito (61)</div>
            </div>
            <div className="col-md-4">
              <strong>Retail/Comercio:</strong>
              <div className="small">Boleta Electrónica (39), Factura Electrónica (33)</div>
            </div>
            <div className="col-md-4">
              <strong>Distribuidores:</strong>
              <div className="small">Factura Electrónica (33), Guía de Despacho (52)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Información importante */}
      <div className="alert alert-warning">
        <h6 className="alert-heading">Importante</h6>
        <ul className="mb-0 small">
          <li>Seleccione solo los documentos que realmente va a emitir</li>
          <li>Los documentos seleccionados determinarán las configuraciones del sistema</li>
          <li>Podrá agregar más tipos de documentos posteriormente</li>
          <li>Algunos documentos requieren configuraciones adicionales</li>
          <li>La habilitación final depende de la autorización del SII</li>
        </ul>
      </div>
    </div>
  )
}
