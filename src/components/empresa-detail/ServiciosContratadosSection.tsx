import React, { useState } from 'react'
import { Package, Info, Eye } from 'lucide-react'
import { ServicioDetailModal } from '@/components/modals/ServicioDetailModal'
import type { EmpresaCompleta } from '@/types/empresa'

interface ServiciosContratadosSectionProps {
  empresa: EmpresaCompleta
}

export const ServiciosContratadosSection: React.FC<ServiciosContratadosSectionProps> = ({ 
  empresa 
}) => {
  const [selectedServicio, setSelectedServicio] = useState<any>(null)
  const producto = empresa.comercial?.informacionPlan?.producto

  // Datos mock de servicios según producto
  const getServicios = () => {
    const serviciosEF = [
      { codigo: 'EF001', nombre: 'Facturación Electrónica', activo: true },
      { codigo: 'EF002', nombre: 'Certificado Digital', activo: true },
      { codigo: 'EF003', nombre: 'Portal Web Cliente', activo: false },
      { codigo: 'EF004', nombre: 'API Integración', activo: true }
    ]

    const serviciosAndesPOS = [
      { codigo: 'AP001', nombre: 'Terminal POS', activo: true },
      { codigo: 'AP002', nombre: 'Gestión Inventario', activo: true },
      { codigo: 'AP003', nombre: 'Reportes Avanzados', activo: false },
      { codigo: 'AP004', nombre: 'Backup Automático', activo: true }
    ]

    if (producto === 'ENTERFAC') {
      return { enterfac: serviciosEF, andespos: [] }
    } else if (producto === 'ANDESPOS') {
      return { enterfac: [], andespos: serviciosAndesPOS }
    } else {
      return { enterfac: serviciosEF, andespos: serviciosAndesPOS }
    }
  }

  const servicios = getServicios()

  const handleServicioClick = (servicio: any, tipo: string) => {
    setSelectedServicio({ ...servicio, tipo })
  }

  const renderServiciosColumn = (servicios: any[], titulo: string, color: string) => {
    if (servicios.length === 0) return null

    return (
      <div className="mb-4">
        <h6 className={`font-primary fw-semibold text-${color} mb-3`}>
          {titulo}
        </h6>
        <div className="d-flex flex-column gap-2">
          {servicios.map((servicio) => (
            <div 
              key={servicio.codigo}
              className={`border rounded p-2 cursor-pointer transition-all ${
                servicio.activo 
                  ? `border-${color} bg-light` 
                  : 'border-light bg-light text-muted'
              }`}
              onClick={() => handleServicioClick(servicio, titulo.toLowerCase())}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold small">
                    {servicio.codigo}
                  </div>
                  <div className="small">
                    {servicio.nombre}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${
                    servicio.activo ? `bg-${color}` : 'bg-secondary'
                  }`}>
                    {servicio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <button 
                    className="btn btn-sm btn-outline-secondary p-1"
                    title="Ver descripción"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="mb-0 font-primary fw-semibold d-flex align-items-center gap-2">
          <Package size={20} />
          Servicios Contratados
        </h5>
      </div>
      <div className="card-body">
        <p className="text-muted small mb-4">
          <Info size={16} className="me-1" />
          Haz clic en cualquier código para ver la descripción del servicio
        </p>

        {servicios.enterfac.length === 0 && servicios.andespos.length === 0 ? (
          <div className="text-center py-4">
            <Package size={48} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay servicios contratados</p>
          </div>
        ) : (
          <>
            {renderServiciosColumn(servicios.enterfac, 'Enterfac', 'primary')}
            {renderServiciosColumn(servicios.andespos, 'AndesPOS', 'success')}
          </>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedServicio && (
        <ServicioDetailModal
          servicio={selectedServicio}
          isOpen={!!selectedServicio}
          onClose={() => setSelectedServicio(null)}
        />
      )}
    </div>
  )
}
