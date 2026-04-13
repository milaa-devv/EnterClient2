import React from 'react'

interface ResumenOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  empresa: any
  configuracion: any
}

export const ResumenOnboardingModal: React.FC<ResumenOnboardingModalProps> = ({
  isOpen,
  onClose,
  empresa,
  configuracion,
}) => {
  if (!isOpen) return null

  const cfg = configuracion || {}
  
  // Extraer datos según el producto configurado
  const productos = cfg.productos || []
  const esEnternet = productos.includes('ENTERFAC')
  const esAndespos = productos.includes('ANDESPOS') || productos.includes('ANDESPOS_ENTERBOX')
  
  const productoConfig = esEnternet ? cfg.enterfac : esAndespos ? cfg.andespos : {}
  const productoNombre = esEnternet ? 'Enternet' : esAndespos ? 'AndesPOS' : '—'

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-xl modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">
              Resumen de Configuración: {empresa?.nombre || '—'}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Cerrar"
            />
          </div>

          {/* Body */}
          <div className="modal-body">
            <div className="row g-3">
              {/* Columna Izquierda */}
              <div className="col-lg-6">
                {/* Productos Seleccionados */}
                <div className="card mb-3">
                  <div className="card-header" style={{ backgroundColor: '#E8D5F2', borderColor: '#D5B8E8' }}>
                    <strong>Productos seleccionados</strong>
                  </div>
                  <div className="card-body">
                    <div className="d-flex gap-2">
                      {productos.map((p: string) => (
                        <span 
                          key={p} 
                          className="badge"
                          style={{ 
                            backgroundColor: p === 'ENTERFAC' ? '#C8E6C9' : '#BBDEFB',
                            color: '#2E7D32',
                            fontSize: '0.875rem',
                            padding: '0.5rem 0.75rem'
                          }}
                        >
                          {p === 'ENTERFAC' ? 'Enternet' : p === 'ANDESPOS' ? 'AndesPOS' : p}
                        </span>
                      ))}
                      {productos.length === 0 && <span className="text-muted">—</span>}
                    </div>
                  </div>
                </div>

                {/* Configuración del Producto */}
                <div className="card mb-3">
                  <div className="card-header">
                    <strong>{productoNombre}</strong>
                  </div>
                  <div className="card-body small">
                    <div className="row g-2">
                      <div className="col-6">
                        <span className="text-muted">Empkey:</span>
                      </div>
                      <div className="col-6">
                        <strong>{productoConfig.empkey || '—'}</strong>
                      </div>

                      <div className="col-6">
                        <span className="text-muted">ReplicaPass:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.replica_password || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">Pass:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.pass || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">Casilla de intercambio:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.casilla_intercambio || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">Archivo Visto Bueno:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.visto_bueno_nombre || productoConfig.url_visto_bueno ? (
                          <span className="text-success">✓ {productoConfig.visto_bueno_nombre || productoConfig.url_visto_bueno}</span>
                        ) : (
                          '—'
                        )}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">Logo / Membrete:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.url_membrete ? (
                          <span className="text-success">✓ {productoConfig.url_membrete}</span>
                        ) : (
                          '—'
                        )}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">Layout:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.layout || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">URL Layout:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.url_layout_selected || productoConfig.url_layout_custom || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">Layout Térmico:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.layout_termico || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">URL Layout Térmico:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.url_layout_termico_selected || productoConfig.url_layout_termico_custom || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DTE Habilitados */}
                <div className="card mb-3">
                  <div className="card-header">
                    <strong>DTE Habilitados</strong>
                  </div>
                  <div className="card-body">
                    <div className="d-flex flex-wrap gap-1">
                      {productoConfig.dte_habilitados?.length > 0 ? (
                        productoConfig.dte_habilitados.map((dte: any) => (
                          <span 
                            key={dte} 
                            className="badge"
                            style={{ 
                              backgroundColor: '#B3E5FC',
                              color: '#01579B',
                              fontSize: '0.875rem',
                              padding: '0.5rem 0.75rem'
                            }}
                          >
                            {dte}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modalidad de Emisión */}
                <div className="card mb-3">
                  <div className="card-header">
                    <strong>Modalidad de Emisión</strong>
                  </div>
                  <div className="card-body small">
                    <p className="mb-0">{productoConfig.modalidad_firma || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="col-lg-6">
                {/* Integraciones */}
                <div className="card mb-3">
                  <div className="card-header">
                    <strong>Integraciones por Documento</strong>
                  </div>
                  <div className="card-body small">
                    {productoConfig.integraciones ? (
                      <div className="row g-2">
                        {/* General */}
                        {productoConfig.integraciones.general && (
                          <>
                            <div className="col-6">
                              <span className="text-muted">General:</span>
                            </div>
                            <div className="col-6">
                              {Array.isArray(productoConfig.integraciones.general) 
                                ? productoConfig.integraciones.general.join(', ') 
                                : productoConfig.integraciones.general}
                            </div>
                          </>
                        )}
                        
                        {/* Por Documento */}
                        {productoConfig.integraciones.porDocumento && Object.keys(productoConfig.integraciones.porDocumento).length > 0 && (
                          <>
                            <div className="col-12 mt-2">
                              <strong className="text-muted">Por Documento:</strong>
                            </div>
                            {Object.entries(productoConfig.integraciones.porDocumento).map(([dte, integ]: [string, any]) => (
                              <React.Fragment key={dte}>
                                <div className="col-6 ps-4">
                                  <span className="text-muted">DTE {dte}:</span>
                                </div>
                                <div className="col-6">
                                  {Array.isArray(integ) ? integ.join(', ') : String(integ)}
                                </div>
                              </React.Fragment>
                            ))}
                          </>
                        )}
                        
                        {/* AppFull */}
                        {productoConfig.integraciones.appFull && (
                          <>
                            <div className="col-12 mt-2">
                              <strong className="text-muted">AppFull:</strong>
                            </div>
                            <div className="col-6 ps-4">
                              <span className="text-muted">Versión:</span>
                            </div>
                            <div className="col-6">
                              {productoConfig.integraciones.appFull.version || '—'}
                            </div>
                            {productoConfig.integraciones.appFull.dispositivos?.length > 0 && (
                              <>
                                <div className="col-6 ps-4">
                                  <span className="text-muted">Dispositivos:</span>
                                </div>
                                <div className="col-6">
                                  {productoConfig.integraciones.appFull.dispositivos.map((d: any, i: number) => (
                                    <div key={i}>
                                      {d.nombre || d} {d.activo && <span className="text-success">✓</span>}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                </div>

                {/* Tipo de Mensaje */}
                <div className="card mb-3">
                  <div className="card-header">
                    <strong>Tipo de Mensaje</strong>
                  </div>
                  <div className="card-body small">
                    <div className="row g-2">
                      <div className="col-6">
                        <span className="text-muted">Tipo de Texto:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.tipo_texto || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">Parser:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.parser || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modalidad de Firma */}
                <div className="card mb-3">
                  <div className="card-header">
                    <strong>Modalidad de Firma</strong>
                  </div>
                  <div className="card-body small">
                    <div className="row g-2">
                      <div className="col-6">
                        <span className="text-muted">Modalidad de Firma:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.modalidad_firma || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">Administrador de Folios:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.admin_folios || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* WinSII */}
                <div className="card mb-3">
                  <div className="card-header">
                    <strong>WinSII</strong>
                  </div>
                  <div className="card-body small">
                    <div className="row g-2">
                      <div className="col-6">
                        <span className="text-muted">WinPlugin:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.versiones?.winPlugin || productoConfig.version_winplugin || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">WinEmisor:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.versiones?.winEmisor || productoConfig.version_emisor || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">WinEmisor WS:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.versiones?.winEmisorWS || productoConfig.version_win_emisor_ws || '—'}
                      </div>

                      <div className="col-6">
                        <span className="text-muted">WinBatch:</span>
                      </div>
                      <div className="col-6">
                        {productoConfig.versiones?.winBatch || productoConfig.version_winbatch || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}