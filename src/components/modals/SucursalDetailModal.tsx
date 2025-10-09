import React from 'react'
import { X, MapPin, Building, Monitor, Wifi, HardDrive } from 'lucide-react'

interface SucursalDetailModalProps {
  sucursal: any
  isOpen: boolean
  onClose: () => void
}

export const SucursalDetailModal: React.FC<SucursalDetailModalProps> = ({ 
  sucursal, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null

  // Datos mock de BOX si la sucursal los tiene
  const datosBox = sucursal.tieneBox ? {
    id: 'BOX001',
    puntoAccesoKey: 'PA-' + sucursal.id,
    puntoAccesoNombre: 'Acceso Principal',
    router: 'TP-Link AC1750',
    ip: '192.168.1.100',
    macEth0: '00:1B:44:11:3A:B7',
    macWlan0: '00:1B:44:11:3A:B8'
  } : null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center gap-2">
              {sucursal.tipo === 'ENTERFAC' ? (
                <Building size={20} />
              ) : (
                <MapPin size={20} />
              )}
              {sucursal.nombre} - {sucursal.tipo}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />
          </div>
          
          <div className="modal-body">
            <div className="row g-4">
              {/* Información General */}
              <div className="col-lg-6">
                <h6 className="font-primary fw-semibold mb-3">Información General</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>ID Sucursal:</strong></td>
                      <td>{sucursal.id}</td>
                    </tr>
                    <tr>
                      <td><strong>Nombre:</strong></td>
                      <td>{sucursal.nombre}</td>
                    </tr>
                    <tr>
                      <td><strong>Dirección:</strong></td>
                      <td>{sucursal.direccion}</td>
                    </tr>
                    <tr>
                      <td><strong>Tipo:</strong></td>
                      <td>
                        <span className={`badge ${
                          sucursal.tipo === 'ENTERFAC' ? 'bg-primary' : 'bg-success'
                        }`}>
                          {sucursal.tipo}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Estado:</strong></td>
                      <td>
                        <span className={`badge ${
                          sucursal.activa ? 'bg-success' : 'bg-danger'
                        }`}>
                          {sucursal.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Información específica de ANDESPOS */}
                {sucursal.tipo === 'ANDESPOS' && (
                  <>
                    <h6 className="font-primary fw-semibold mt-4 mb-3">Configuración POS</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Cantidad de Cajas:</strong></td>
                          <td>{sucursal.cantidadCajas}</td>
                        </tr>
                        <tr>
                          <td><strong>Tiene BOX:</strong></td>
                          <td>
                            <span className={`badge ${
                              sucursal.tieneBox ? 'bg-success' : 'bg-secondary'
                            }`}>
                              {sucursal.tieneBox ? 'Sí' : 'No'}
                            </span>
                          </td>
                        </tr>
                        {sucursal.tieneBox && (
                          <tr>
                            <td><strong>Estado BOX:</strong></td>
                            <td>
                              <span className="badge bg-success">Conectado</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>

              {/* Información de BOX (solo si existe) */}
              {datosBox && (
                <div className="col-lg-6">
                  <h6 className="font-primary fw-semibold mb-3 d-flex align-items-center gap-2">
                    <Monitor size={18} />
                    Información del BOX
                  </h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>ID BOX:</strong></td>
                        <td className="font-monospace">{datosBox.id}</td>
                      </tr>
                      <tr>
                        <td><strong>Punto de Acceso Key:</strong></td>
                        <td className="font-monospace">{datosBox.puntoAccesoKey}</td>
                      </tr>
                      <tr>
                        <td><strong>Punto de Acceso Nombre:</strong></td>
                        <td>{datosBox.puntoAccesoNombre}</td>
                      </tr>
                      <tr>
                        <td><strong>Router:</strong></td>
                        <td>{datosBox.router}</td>
                      </tr>
                      <tr>
                        <td><strong>IP:</strong></td>
                        <td className="font-monospace">{datosBox.ip}</td>
                      </tr>
                      <tr>
                        <td><strong>MAC ETH0:</strong></td>
                        <td className="font-monospace">{datosBox.macEth0}</td>
                      </tr>
                      <tr>
                        <td><strong>MAC WLAN0:</strong></td>
                        <td className="font-monospace">{datosBox.macWlan0}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Estado de conexión del BOX */}
                  <div className="mt-4">
                    <h6 className="font-primary fw-semibold mb-3">Estado de Conectividad</h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="card border-success">
                          <div className="card-body text-center p-2">
                            <Wifi className="text-success mb-1" size={20} />
                            <div className="small fw-semibold">Wi-Fi</div>
                            <div className="small text-success">Conectado</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card border-success">
                          <div className="card-body text-center p-2">
                            <HardDrive className="text-success mb-1" size={20} />
                            <div className="small fw-semibold">Sistema</div>
                            <div className="small text-success">Online</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Si no tiene BOX, mostrar otras configuraciones */}
              {sucursal.tipo === 'ANDESPOS' && !sucursal.tieneBox && (
                <div className="col-lg-6">
                  <h6 className="font-primary fw-semibold mb-3">Configuración de Red</h6>
                  <div className="alert alert-info">
                    <p className="mb-2">
                      <strong>Configuración Simplificada</strong>
                    </p>
                    <p className="small mb-0">
                      Esta sucursal no requiere BOX dedicado. Los terminales POS 
                      se conectan directamente a la red local de la empresa.
                    </p>
                  </div>

                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Tipo de Conexión:</strong></td>
                        <td>Directa</td>
                      </tr>
                      <tr>
                        <td><strong>Protocolo:</strong></td>
                        <td>HTTP/HTTPS</td>
                      </tr>
                      <tr>
                        <td><strong>Backup:</strong></td>
                        <td>Automático</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Para ENTERFAC mostrar configuración diferente */}
              {sucursal.tipo === 'ENTERFAC' && (
                <div className="col-lg-6">
                  <h6 className="font-primary fw-semibold mb-3">Configuración Enterfac</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Servidor:</strong></td>
                        <td>Servidor Principal</td>
                      </tr>
                      <tr>
                        <td><strong>Base de Datos:</strong></td>
                        <td>PostgreSQL 13</td>
                      </tr>
                      <tr>
                        <td><strong>Certificado:</strong></td>
                        <td>
                          <span className="badge bg-success">Vigente</span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Última Conexión:</strong></td>
                        <td>Hoy 08:30</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Historial de Actividad */}
            <div className="mt-4">
              <h6 className="font-primary fw-semibold mb-3">Actividad Reciente</h6>
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Evento</th>
                      <th>Usuario</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>21/09/2025 08:30</td>
                      <td>Conexión establecida</td>
                      <td>Sistema</td>
                      <td><span className="badge bg-success">OK</span></td>
                    </tr>
                    <tr>
                      <td>20/09/2025 18:45</td>
                      <td>Respaldo completado</td>
                      <td>Sistema</td>
                      <td><span className="badge bg-success">OK</span></td>
                    </tr>
                    <tr>
                      <td>20/09/2025 14:20</td>
                      <td>Configuración actualizada</td>
                      <td>admin@empresa.cl</td>
                      <td><span className="badge bg-info">Modificado</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
            <button type="button" className="btn btn-outline-primary">
              Exportar Configuración
            </button>
            <button type="button" className="btn btn-primary">
              Editar Sucursal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
