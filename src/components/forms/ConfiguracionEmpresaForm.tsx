import React, { useState } from 'react'
import { Settings, Printer, Server, Layout, Shield } from 'lucide-react'
import type { ConfiguracionEmpresa } from '@/types/empresa'

interface ConfiguracionEmpresaFormProps {
  empresa?: any
  onSave: (config: ConfiguracionEmpresa) => void
}

export const ConfiguracionEmpresaForm: React.FC<ConfiguracionEmpresaFormProps> = ({ 
  empresa, 
  onSave 
}) => {
  const [config, setConfig] = useState<Partial<ConfiguracionEmpresa>>({
    formato_impresion: 'LASER',
    layout: 'ESTANDAR',
    ...empresa?.onboarding?.configuracionEmpresa
  })

  const versiones = {
    mensaje: ['1.0', '1.1', '1.2'],
    emisor: ['1.0', '1.1'],
    appFull: ['2024.1', '2024.2', '2024.3'],
    winPlugin: ['3.1', '3.2', '3.3']
  }

  const tiposIntegracion = [
    'API REST',
    'SOAP Web Services',
    'FTP',
    'Email',
    'Manual'
  ]

  const dteHabilitados = [
    { id: '33', nombre: 'Factura Electrónica' },
    { id: '34', nombre: 'Factura Exenta' },
    { id: '39', nombre: 'Boleta Electrónica' },
    { id: '52', nombre: 'Guía de Despacho' },
    { id: '56', nombre: 'Nota de Débito' },
    { id: '61', nombre: 'Nota de Crédito' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(config as ConfiguracionEmpresa)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-4">
        {/* Configuración Básica */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <Settings size={18} />
                Configuración Básica
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Formato de Impresión</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Printer size={16} />
                    </span>
                    <select
                      className="form-select"
                      value={config.formato_impresion || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        formato_impresion: e.target.value as 'TERMICA' | 'LASER'
                      })}
                    >
                      <option value="LASER">Láser</option>
                      <option value="TERMICA">Térmica</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Casilla de Intercambio</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ingrese casilla"
                    value={config.casilla_intercambio || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      casilla_intercambio: e.target.value
                    })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Replica Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={config.replica_password || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      replica_password: e.target.value
                    })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Empkey</label>
                  <input
                    type="number"
                    className="form-control"
                    value={config.empkey || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      empkey: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* URLs */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">URLs</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">URL Visto Bueno</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://"
                  value={config.url_visto_bueno || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    url_visto_bueno: e.target.value
                  })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">URL Membrete</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://"
                  value={config.url_membrete || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    url_membrete: e.target.value
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <Layout size={18} />
                Layout
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Tipo de Layout</label>
                <select
                  className="form-select"
                  value={config.layout || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    layout: e.target.value as 'CUSTOM' | 'ESTANDAR'
                  })}
                >
                  <option value="ESTANDAR">Estándar</option>
                  <option value="CUSTOM">Personalizado</option>
                </select>
              </div>

              {config.layout === 'ESTANDAR' && (
                <div>
                  <label className="form-label">Opciones Estándar</label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="layout1" />
                    <label className="form-check-label" htmlFor="layout1">
                      Layout Clásico
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="layout2" />
                    <label className="form-check-label" htmlFor="layout2">
                      Layout Moderno
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DTE Habilitados */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">DTE Habilitados</h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {dteHabilitados.map(dte => (
                  <div key={dte.id} className="col-md-4 col-lg-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`dte-${dte.id}`}
                        checked={(config.dte_habilitados || []).includes(dte.id)}
                        onChange={(e) => {
                          const current = config.dte_habilitados || []
                          if (e.target.checked) {
                            setConfig({
                              ...config,
                              dte_habilitados: [...current, dte.id]
                            })
                          } else {
                            setConfig({
                              ...config,
                              dte_habilitados: current.filter(id => id !== dte.id)
                            })
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={`dte-${dte.id}`}>
                        DTE {dte.id} - {dte.nombre}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Versiones */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <Server size={18} />
                Versiones del Sistema
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Versión Mensaje</label>
                  <select
                    className="form-select"
                    value={config.version_mensaje || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      version_mensaje: e.target.value
                    })}
                  >
                    <option value="">Seleccionar</option>
                    {versiones.mensaje.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Versión Emisor</label>
                  <select
                    className="form-select"
                    value={config.version_emisor || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      version_emisor: e.target.value
                    })}
                  >
                    <option value="">Seleccionar</option>
                    {versiones.emisor.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Versión App Full</label>
                  <select
                    className="form-select"
                    value={config.version_app_full || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      version_app_full: e.target.value
                    })}
                  >
                    <option value="">Seleccionar</option>
                    {versiones.appFull.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Versión WinPlugin</label>
                  <select
                    className="form-select"
                    value={config.version_winplugin || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      version_winplugin: e.target.value
                    })}
                  >
                    <option value="">Seleccionar</option>
                    {versiones.winPlugin.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Otros */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Información Adicional</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Observaciones adicionales sobre la configuración..."
                  value={config.otros || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    otros: e.target.value
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="col-12">
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Guardar Configuración
            </button>
            <button type="button" className="btn btn-outline-success">
              Completar y Enviar a SAC
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
