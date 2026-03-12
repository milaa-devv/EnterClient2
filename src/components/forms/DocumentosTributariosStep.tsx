import React, { useEffect, useMemo, useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { FileText, Info, CheckCircle } from 'lucide-react'
import type { DocumentoTributario } from '@/types/empresa'

type GrupoKey = 'NACIONALES' | 'EXPORTACION' | 'NO_TRIBUTARIO'

type DocDef = {
  id: string
  nombre: string
  grupo: GrupoKey
  descripcion: string
  categoria: string
  requiereReceptor: boolean
}

const GRUPOS: { key: GrupoKey; titulo: string; subtitle: string }[] = [
  { key: 'NACIONALES', titulo: 'Documentos Nacionales', subtitle: 'DTE para operación dentro de Chile' },
  { key: 'EXPORTACION', titulo: 'Documentos de Exportación', subtitle: 'DTE asociados a exportaciones' },
  { key: 'NO_TRIBUTARIO', titulo: 'Documento No Tributario', subtitle: 'Documentos no Tributarios' }
]

// Catálogo (ordenado por grupos)
const DOC_DEFS: DocDef[] = [
  // ===== Nacionales
  {
    id: '33',
    nombre: 'Factura Electrónica (Afecta)',
    grupo: 'NACIONALES',
    descripcion: 'Documento principal para ventas afectas a IVA',
    categoria: 'Venta',
    requiereReceptor: true
  },
  {
    id: '34',
    nombre: 'Factura Exenta Electrónica',
    grupo: 'NACIONALES',
    descripcion: 'Para ventas exentas de IVA',
    categoria: 'Venta',
    requiereReceptor: true
  },
  {
    id: '39',
    nombre: 'Boleta Electrónica (Afecta)',
    grupo: 'NACIONALES',
    descripcion: 'Para ventas al consumidor final',
    categoria: 'Venta',
    requiereReceptor: false
  },
  {
    id: '41',
    nombre: 'Boleta Exenta Electrónica',
    grupo: 'NACIONALES',
    descripcion: 'Boleta para ventas exentas',
    categoria: 'Venta',
    requiereReceptor: false
  },
  {
    id: '43',
    nombre: 'Liquidación de Factura Electrónica',
    grupo: 'NACIONALES',
    descripcion: 'Documento de liquidación asociado a operaciones específicas',
    categoria: 'Venta',
    requiereReceptor: true
  },
  {
    id: '46',
    nombre: 'Factura de Compra',
    grupo: 'NACIONALES',
    descripcion: 'Documento para registrar compras (según flujo del contribuyente)',
    categoria: 'Compra',
    requiereReceptor: true
  },
  {
    id: '52',
    nombre: 'Guía de Despacho Electrónica',
    grupo: 'NACIONALES',
    descripcion: 'Para traslado de mercaderías',
    categoria: 'Traslado',
    requiereReceptor: true
  },
  {
    id: '56',
    nombre: 'Nota de Débito Electrónica',
    grupo: 'NACIONALES',
    descripcion: 'Para aumentar el monto de facturas',
    categoria: 'Ajuste',
    requiereReceptor: true
  },
  {
    id: '61',
    nombre: 'Nota de Crédito Electrónica',
    grupo: 'NACIONALES',
    descripcion: 'Para disminuir el monto de facturas',
    categoria: 'Ajuste',
    requiereReceptor: true
  },

  // ===== Exportación
  {
    id: '110',
    nombre: 'Factura de Exportación',
    grupo: 'EXPORTACION',
    descripcion: 'DTE para ventas de exportación',
    categoria: 'Exportación',
    requiereReceptor: true
  },
  {
    id: '111',
    nombre: 'Nota de Débito de Exportación',
    grupo: 'EXPORTACION',
    descripcion: 'Ajuste (alza) de una factura de exportación',
    categoria: 'Exportación',
    requiereReceptor: true
  },
  {
    id: '112',
    nombre: 'Nota de Crédito de Exportación',
    grupo: 'EXPORTACION',
    descripcion: 'Ajuste (baja) de una factura de exportación',
    categoria: 'Exportación',
    requiereReceptor: true
  },

  // ===== No tributario
  {
    id: 'TNT',
    nombre: 'Ticket No Tributario',
    grupo: 'NO_TRIBUTARIO',
    descripcion: 'Comprobante interno/no DTE (según configuración del negocio)',
    categoria: 'No tributario',
    requiereReceptor: false
  }
]

const DEFAULT_DOCS: DocumentoTributario[] = DOC_DEFS.map(d => ({
  id: d.id,
  nombre: d.nombre,
  selected: false
}))

const META_BY_ID = DOC_DEFS.reduce((acc, d) => {
  acc[d.id] = d
  return acc
}, {} as Record<string, DocDef>)

const getCategoriaColor = (categoria: string) => {
  switch (categoria) {
    case 'Venta':
      return 'success'
    case 'Traslado':
      return 'info'
    case 'Ajuste':
      return 'warning'
    case 'Exportación':
      return 'primary'
    case 'Compra':
      return 'secondary'
    case 'No tributario':
      return 'dark'
    default:
      return 'secondary'
  }
}

export const DocumentosTributariosStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const [documentos, setDocumentos] = useState<DocumentoTributario[]>([])

  useEffect(() => {
    // Merge: si hay guardados, los aplicamos sobre el catálogo actual
    const saved = (state.data.documentosTributarios as DocumentoTributario[]) || []
    if (saved.length > 0) {
      const selectedMap = new Map(saved.map(d => [d.id, !!d.selected]))
      const merged = DEFAULT_DOCS.map(d => ({ ...d, selected: selectedMap.get(d.id) ?? false }))
      setDocumentos(merged)
      updateData({ documentosTributarios: merged })
    } else {
      setDocumentos(DEFAULT_DOCS)
      updateData({ documentosTributarios: DEFAULT_DOCS })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedCount = useMemo(() => documentos.filter(d => d.selected).length, [documentos])

  const handleToggleDocumento = (id: string) => {
    const updated = documentos.map(doc => (doc.id === id ? { ...doc, selected: !doc.selected } : doc))
    setDocumentos(updated)
    updateData({ documentosTributarios: updated })
  }

  const handleSelectAll = () => {
    const allSelected = documentos.length > 0 && documentos.every(doc => doc.selected)
    const updated = documentos.map(doc => ({ ...doc, selected: !allSelected }))
    setDocumentos(updated)
    updateData({ documentosTributarios: updated })
  }

  const groupIds = useMemo(() => {
    const map: Record<GrupoKey, string[]> = {
      NACIONALES: [],
      EXPORTACION: [],
      NO_TRIBUTARIO: []
    }
    for (const d of DOC_DEFS) {
      map[d.grupo].push(d.id)
    }
    return map
  }, [])

  const getGroupState = (groupKey: GrupoKey) => {
    const ids = groupIds[groupKey]
    const docs = documentos.filter(d => ids.includes(d.id))
    const all = docs.length > 0 && docs.every(d => d.selected)
    const some = docs.some(d => d.selected)
    return { all, some, count: docs.filter(d => d.selected).length, total: docs.length }
  }

  const handleToggleGroup = (groupKey: GrupoKey) => {
    const { all } = getGroupState(groupKey)
    const ids = new Set(groupIds[groupKey])
    const updated = documentos.map(d => (ids.has(d.id) ? { ...d, selected: !all } : d))
    setDocumentos(updated)
    updateData({ documentosTributarios: updated })
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Documentos Tributarios</h4>
        <p className="text-muted">Selecciona los tipos de documentos que la empresa va a emitir (por grupo o individual).</p>
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

        <div className="col-md-6 d-flex align-items-center justify-content-md-end">
          <button type="button" className="btn btn-outline-primary" onClick={handleSelectAll}>
            {documentos.every(doc => doc.selected) ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
          </button>
        </div>
      </div>

      {/* Grupos */}
      <div className="d-flex flex-column gap-4">
        {GRUPOS.map(g => {
          const st = getGroupState(g.key)
          const ids = new Set(groupIds[g.key])
          const docsInGroup = documentos.filter(d => ids.has(d.id))

          return (
            <div key={g.key} className="card border-light">
              {/* Header del grupo */}
              <div className="card-body pb-2">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div className="fw-semibold">{g.titulo}</div>
                    <div className="small text-muted">{g.subtitle}</div>
                    <div className="small text-muted mt-1">
                      Seleccionados: <strong>{st.count}</strong> / {st.total}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleToggleGroup(g.key)}
                    >
                      {st.all ? 'Deseleccionar grupo' : 'Seleccionar grupo'}
                    </button>

                    <div className="form-check mt-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={st.all}
                        ref={(el) => {
                          if (el) el.indeterminate = st.some && !st.all
                        }}
                        onChange={() => handleToggleGroup(g.key)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista del grupo */}
              <div className="card-body pt-2">
                <div className="row g-3">
                  {docsInGroup.map(doc => {
                    const meta = META_BY_ID[doc.id]
                    const label = doc.id === 'TNT' ? 'TNT' : `DTE ${doc.id}`

                    return (
                      <div key={doc.id} className="col-lg-6">
                        <div
                          className={`card h-100 cursor-pointer transition-all ${
                            doc.selected ? 'border-success bg-success bg-opacity-10' : 'border-light'
                          }`}
                          onClick={() => handleToggleDocumento(doc.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <FileText size={20} className={doc.selected ? 'text-success' : 'text-muted'} />
                                <div>
                                  <h6 className="mb-0">{label}</h6>
                                  <div className="fw-semibold">{doc.nombre}</div>
                                </div>
                              </div>

                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={doc.selected}
                                  onChange={() => handleToggleDocumento(doc.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>

                            <div className="small text-muted mb-2">{meta?.descripcion ?? 'Documento'}</div>

                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                              <span className={`badge bg-${getCategoriaColor(meta?.categoria ?? 'General')}`}>
                                {meta?.categoria ?? 'General'}
                              </span>

                              {meta?.requiereReceptor && (
                                <span className="badge bg-info">Requiere Receptor</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
              <div className="small">Factura (33), Nota de Crédito (61)</div>
            </div>
            <div className="col-md-4">
              <strong>Retail/Comercio:</strong>
              <div className="small">Boleta (39), Factura (33)</div>
            </div>
            <div className="col-md-4">
              <strong>Distribuidores:</strong>
              <div className="small">Factura (33), Guía (52)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Información importante */}
      <div className="alert alert-warning">
        <h6 className="alert-heading">Importante</h6>
        <ul className="mb-0 small">
          <li>Selecciona solo los documentos que realmente vas a emitir</li>
          <li>Los documentos seleccionados determinan configuraciones del sistema</li>
          <li>Podrás agregar más tipos de documentos posteriormente</li>
          <li>Algunos documentos requieren configuraciones adicionales</li>
          <li>La habilitación final depende de la autorización del SII</li>
        </ul>
      </div>
    </div>
  )
}