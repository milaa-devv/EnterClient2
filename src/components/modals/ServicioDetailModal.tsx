import React from 'react'
import { X, Package, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface ServicioDetailModalProps {
  servicio: any
  isOpen: boolean
  onClose: () => void
}

export const ServicioDetailModal: React.FC<ServicioDetailModalProps> = ({ 
  servicio, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null

  // Datos mock expandidos por servicio
  const getDetalleServicio = (codigo: string) => {
    const servicios: Record<string, any> = {
      'EF001': {
        descripcion: 'Servicio completo de facturación electrónica que incluye emisión, recepción y gestión de documentos tributarios electrónicos según normativas del SII.',
        caracteristicas: [
          'Emisión de facturas electrónicas',
          'Recepción de documentos',
          'Validación automática con SII',
          'Archivo digital de documentos',
          'Reportes de facturación'
        ],
        requisitos: [
          'Certificado digital vigente',
          'Conexión a internet estable',
          'Navegador web actualizado'
        ],
        precio: '$15.000',
        periodo: 'mensual'
      },
      'EF002': {
        descripcion: 'Certificado digital para firma electrónica de documentos tributarios, válido por 2 años con renovación automática.',
        caracteristicas: [
          'Certificado digital clase 3',
          'Válido por 24 meses',
          'Renovación automática',
          'Soporte técnico incluido',
          'Compatible con todos los navegadores'
        ],
        requisitos: [
          'Cédula de identidad vigente',
          'Poder notarial (para empresas)',
          'Correo electrónico válido'
        ],
        precio: '$25.000',
        periodo: 'anual'
      },
      'AP001': {
        descripcion: 'Terminal punto de venta completo con hardware y software integrado para gestión de ventas y control de inventario.',
        caracteristicas: [
          'Terminal táctil 15 pulgadas',
          'Impresora térmica integrada',
          'Lector código de barras',
          'Cajón monedero automático',
          'Software de gestión incluido'
        ],
        requisitos: [
          'Conexión a internet',
          'Alimentación eléctrica estable',
          'Espacio físico adecuado'
        ],
        precio: '$180.000',
        periodo: 'único'
      },
      'AP002': {
        descripcion: 'Sistema avanzado de gestión de inventario con control de stock en tiempo real y alertas automáticas.',
        caracteristicas: [
          'Control de stock en tiempo real',
          'Alertas de stock mínimo',
          'Gestión de proveedores',
          'Reportes de inventario',
          'Códigos de barras'
        ],
        requisitos: [
          'Base de datos configurada',
          'Terminal POS activo',
          'Capacitación del personal'
        ],
        precio: '$8.000',
        periodo: 'mensual'
      }
    }

    return servicios[codigo] || {
      descripcion: 'Servicio especializado para mejorar la gestión empresarial.',
      caracteristicas: ['Funcionalidad especializada', 'Soporte técnico'],
      requisitos: ['Configuración básica'],
      precio: 'Consultar',
      periodo: 'variable'
    }
  }

  const detalle = getDetalleServicio(servicio.codigo)

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <Package size={20} />
              {servicio.nombre} ({servicio.codigo})
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />
          </div>
          
          <div className="modal-body">
            {/* Estado del Servicio */}
            <div className={`alert ${
              servicio.activo ? 'alert-success' : 'alert-warning'
            } d-flex align-items-center gap-2 mb-4`}>
              {servicio.activo ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <div>
                <strong>Estado:</strong> {servicio.activo ? 'Servicio Activo' : 'Servicio Inactivo'}
                {!servicio.activo && (
                  <div className="small mt-1">
                    Este servicio está disponible pero no activado para la empresa
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <h6 className="font-primary fw-semibold mb-2">Descripción</h6>
              <p className="text-muted">{detalle.descripcion}</p>
            </div>

            <div className="row g-4">
              {/* Características */}
              <div className="col-md-6">
                <h6 className="font-primary fw-semibold mb-3">Características Incluidas</h6>
                <ul className="list-unstyled">
                  {detalle.caracteristicas.map((caracteristica: string, index: number) => (
                    <li key={index} className="d-flex align-items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-success flex-shrink-0" />
                      <span className="small">{caracteristica}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requisitos */}
              <div className="col-md-6">
                <h6 className="font-primary fw-semibold mb-3">Requisitos</h6>
                <ul className="list-unstyled">
                  {detalle.requisitos.map((requisito: string, index: number) => (
                    <li key={index} className="d-flex align-items-center gap-2 mb-2">
                      <AlertCircle size={16} className="text-info flex-shrink-0" />
                      <span className="small">{requisito}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Información de Precio */}
            <div className="card bg-light mt-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h6 className="card-title mb-1">Información de Facturación</h6>
                    <p className="card-text small text-muted mb-0">
                      Precio {detalle.periodo === 'único' ? 'único' : `por ${detalle.periodo === 'mensual' ? 'mes' : 'año'}`}
                    </p>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="h4 mb-0 text-primary">{detalle.precio}</div>
                    {detalle.periodo !== 'único' && (
                      <small className="text-muted">/{detalle.periodo}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de Actividad */}
            <div className="mt-4">
              <h6 className="font-primary fw-semibold mb-3">Actividad Reciente</h6>
              <div className="timeline">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <Clock size={16} className="text-muted" />
                  <div>
                    <div className="small fw-semibold">Servicio activado</div>
                    <div className="small text-muted">15/03/2024 - Por sistema automático</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <Clock size={16} className="text-muted" />
                  <div>
                    <div className="small fw-semibold">Configuración completada</div>
                    <div className="small text-muted">16/03/2024 - Por equipo técnico</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <Clock size={16} className="text-muted" />
                  <div>
                    <div className="small fw-semibold">Último uso</div>
                    <div className="small text-muted">21/09/2025 - Funcionamiento normal</div>
                  </div>
                </div>
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
            {!servicio.activo ? (
              <button type="button" className="btn btn-success">
                Activar Servicio
              </button>
            ) : (
              <button type="button" className="btn btn-outline-danger">
                Desactivar Servicio
              </button>
            )}
            <button type="button" className="btn btn-primary">
              Configurar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
