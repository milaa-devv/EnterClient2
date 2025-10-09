import React, { useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Package, DollarSign, Check, Star } from 'lucide-react'
import type { InformacionPlan } from '@/types/empresa'

export const InformacionPlanStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const [planInfo, setPlanInfo] = useState<Partial<InformacionPlan>>(
    state.data.informacionPlan || {}
  )

  const productos = [
    { 
      id: 'ENTERFAC', 
      nombre: 'Enterfac', 
      descripcion: 'Facturación electrónica completa',
      caracteristicas: [
        'Emisión de documentos tributarios',
        'Integración con SII',
        'Portal web cliente',
        'Reportes tributarios',
        'Soporte técnico'
      ]
    },
    { 
      id: 'ANDESPOS', 
      nombre: 'AndesPOS', 
      descripcion: 'Sistema punto de venta',
      caracteristicas: [
        'Terminal punto de venta',
        'Control de inventario',
        'Gestión de ventas',
        'Reportes comerciales',
        'Integración contable'
      ]
    }
  ]

  const planes = {
    ENTERFAC: [
      { 
        codigo: 'EF-BASIC', 
        nombre: 'Plan Básico', 
        precio: '$15.000',
        descripcion: 'Ideal para empresas pequeñas',
        caracteristicas: [
          'Hasta 100 documentos/mes',
          'Portal web básico',
          'Soporte por email',
          '1 usuario incluido'
        ]
      },
      { 
        codigo: 'EF-PRO', 
        nombre: 'Plan Pro', 
        precio: '$25.000',
        descripcion: 'Para empresas en crecimiento',
        caracteristicas: [
          'Hasta 500 documentos/mes',
          'Portal web avanzado',
          'Soporte telefónico',
          '5 usuarios incluidos',
          'API incluida'
        ],
        popular: true
      },
      { 
        codigo: 'EF-ENTERPRISE', 
        nombre: 'Plan Enterprise', 
        precio: '$45.000',
        descripcion: 'Para grandes empresas',
        caracteristicas: [
          'Documentos ilimitados',
          'Portal personalizado',
          'Soporte prioritario',
          'Usuarios ilimitados',
          'Integraciones avanzadas'
        ]
      }
    ],
    ANDESPOS: [
      { 
        codigo: 'AP-STARTER', 
        nombre: 'Plan Starter', 
        precio: '$8.000',
        descripcion: 'Para emprendedores',
        caracteristicas: [
          '1 terminal POS',
          'Inventario básico',
          'Reportes estándar',
          'Soporte por email'
        ]
      },
      { 
        codigo: 'AP-BUSINESS', 
        nombre: 'Plan Business', 
        precio: '$15.000',
        descripcion: 'Para comercios establecidos',
        caracteristicas: [
          'Hasta 3 terminales',
          'Inventario avanzado',
          'Reportes detallados',
          'Soporte telefónico',
          'Backup automático'
        ],
        popular: true
      },
      { 
        codigo: 'AP-PREMIUM', 
        nombre: 'Plan Premium', 
        precio: '$25.000',
        descripcion: 'Para múltiples sucursales',
        caracteristicas: [
          'Terminales ilimitadas',
          'Multi-sucursal',
          'Reportes ejecutivos',
          'Soporte prioritario',
          'Integraciones ERP'
        ]
      }
    ]
  }

  const handleProductoChange = (productoId: string) => {
    const newPlanInfo = { 
      ...planInfo, 
      producto: productoId,
      codigo_plan: '', // Reset plan selection
      plan_nombre: '',
      precio: ''
    }
    setPlanInfo(newPlanInfo)
    updateData({ informacionPlan: newPlanInfo })
  }

  const handlePlanChange = (plan: any) => {
    const newPlanInfo = { 
      ...planInfo, 
      codigo_plan: plan.codigo,
      plan_nombre: plan.nombre,
      precio: plan.precio
    }
    setPlanInfo(newPlanInfo)
    updateData({ informacionPlan: newPlanInfo })
  }

  const selectedProducto = productos.find(p => p.id === planInfo.producto)

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Información del Plan</h4>
        <p className="text-muted">
          Seleccione el producto y plan que la empresa ha contratado
        </p>
      </div>

      {/* Selección de producto */}
      <div className="mb-5">
        <h5 className="font-primary fw-semibold mb-3">1. Seleccionar Producto</h5>
        <div className="row g-3">
          {productos.map(producto => (
            <div key={producto.id} className="col-md-6">
              <div 
                className={`card h-100 cursor-pointer transition-all ${
                  planInfo.producto === producto.id 
                    ? 'border-primary bg-primary bg-opacity-10' 
                    : 'border-light'
                }`}
                onClick={() => handleProductoChange(producto.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body p-4">
                  <div className="text-center mb-3">
                    <Package 
                      size={40} 
                      className={`mb-2 ${
                        planInfo.producto === producto.id ? 'text-primary' : 'text-muted'
                      }`} 
                    />
                    <h5 className="card-title font-primary fw-semibold">
                      {producto.nombre}
                    </h5>
                    <p className="card-text text-muted small mb-3">
                      {producto.descripcion}
                    </p>
                  </div>

                  <div className="border-top pt-3">
                    <h6 className="small fw-semibold mb-2">Características:</h6>
                    <ul className="small text-muted mb-0">
                      {producto.caracteristicas.slice(0, 3).map((caracteristica, index) => (
                        <li key={index}>{caracteristica}</li>
                      ))}
                    </ul>
                  </div>

                  {planInfo.producto === producto.id && (
                    <div className="mt-3 text-center">
                      <span className="badge bg-primary">
                        <Check size={12} className="me-1" />
                        Seleccionado
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selección de plan */}
      {planInfo.producto && (
        <div className="mb-5">
          <h5 className="font-primary fw-semibold mb-3">
            2. Seleccionar Plan - {selectedProducto?.nombre}
          </h5>
          <div className="row g-3">
            {planes[planInfo.producto as keyof typeof planes]?.map(plan => (
              <div key={plan.codigo} className="col-lg-4">
                <div 
                  className={`card h-100 cursor-pointer transition-all position-relative ${
                    planInfo.codigo_plan === plan.codigo 
                      ? 'border-success bg-success bg-opacity-10' 
                      : 'border-light'
                  }`}
                  onClick={() => handlePlanChange(plan)}
                  style={{ cursor: 'pointer' }}
                >
                  {plan.popular && (
                    <div className="position-absolute top-0 start-50 translate-middle">
                      <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                        <Star size={12} />
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="card-body p-4 text-center">
                    <h5 className="card-title font-primary fw-semibold mb-2">
                      {plan.nombre}
                    </h5>
                    <p className="small text-muted mb-3">{plan.descripcion}</p>
                    
                    <div className="mb-4">
                      <div className="h3 text-primary d-flex align-items-center justify-content-center gap-1">
                        <DollarSign size={20} />
                        {plan.precio.replace('$', '')}
                      </div>
                      <small className="text-muted">por mes</small>
                    </div>

                    <div className="border-top pt-3">
                      <h6 className="small fw-semibold mb-2">Incluye:</h6>
                      <ul className="small text-muted list-unstyled">
                        {plan.caracteristicas.map((caracteristica, index) => (
                          <li key={index} className="mb-1 d-flex align-items-center gap-2">
                            <Check size={12} className="text-success flex-shrink-0" />
                            {caracteristica}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {planInfo.codigo_plan === plan.codigo && (
                      <div className="mt-3">
                        <span className="badge bg-success">
                          <Check size={12} className="me-1" />
                          Plan Seleccionado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen de selección */}
      {planInfo.producto && planInfo.codigo_plan && (
        <div className="card bg-light">
          <div className="card-body">
            <h6 className="card-title font-primary fw-semibold mb-3">
              Resumen de Selección
            </h6>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="small text-muted mb-1">Producto</div>
                <div className="fw-semibold">{selectedProducto?.nombre}</div>
              </div>
              <div className="col-md-4">
                <div className="small text-muted mb-1">Plan</div>
                <div className="fw-semibold">{planInfo.plan_nombre}</div>
              </div>
              <div className="col-md-4">
                <div className="small text-muted mb-1">Precio Mensual</div>
                <div className="fw-semibold text-success">{planInfo.precio}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información importante */}
      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">Información Importante</h6>
        <ul className="mb-0 small">
          <li>El plan seleccionado determina las funcionalidades disponibles para la empresa</li>
          <li>Los precios mostrados son valores de referencia mensuales</li>
          <li>El cambio de plan puede realizarse posteriormente</li>
          <li>Algunos planes incluyen servicios adicionales que se configurarán durante el onboarding</li>
        </ul>
      </div>
    </div>
  )
}
