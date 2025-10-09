// src/components/empresa-detail/SucursalesSection.tsx
import React, { useState } from 'react'
import { MapPin, Building, Eye, Plus } from 'lucide-react'
import { SucursalDetailModal } from '@/components/modals/SucursalDetailModal'
import type { EmpresaCompleta } from '@/types/empresa'

interface SucursalesSectionProps {
  empresa: EmpresaCompleta
}

export const SucursalesSection: React.FC<SucursalesSectionProps> = ({ empresa }) => {
  const [selectedSucursal, setSelectedSucursal] = useState<any>(null)
  
  // Determinar producto(s) contratado(s)
  const producto = empresa.comercial?.informacionPlan?.producto
  
  // Datos mock de sucursales según el producto
  const getSucursales = () => {
    if (producto === 'ENTERFAC') {
      return [
        {
          id: 'SUC001',
          nombre: 'Casa Matriz',
          direccion: 'Av. Providencia 1234, Santiago',
          tipo: 'ENTERFAC',
          activa: true
        },
        {
          id: 'SUC002',
          nombre: 'Sucursal Las Condes',
          direccion: 'Av. Apoquindo 5678, Las Condes',
          tipo: 'ENTERFAC',
          activa: true
        }
      ]
    } else if (producto === 'ANDESPOS') {
      return [
        {
          id: 'POS001',
          nombre: 'Local Centro',
          direccion: 'Estado 123, Santiago Centro',
          tipo: 'ANDESPOS',
          activa: true,
          tieneBox: true,
          cantidadCajas: 3
        },
        {
          id: 'POS002',
          nombre: 'Local Mall Plaza',
          direccion: 'Mall Plaza Norte, Local 205',
          tipo: 'ANDESPOS',
          activa: true,
          tieneBox: false,
          cantidadCajas: 2
        }
      ]
    } else {
      return [
        {
          id: 'SUC001',
          nombre: 'Casa Matriz EF',
          direccion: 'Av. Providencia 1234, Santiago',
          tipo: 'ENTERFAC',
          activa: true
        },
        {
          id: 'POS001',
          nombre: 'Local Centro POS',
          direccion: 'Estado 123, Santiago Centro',
          tipo: 'ANDESPOS',
          activa: true,
          tieneBox: true,
          cantidadCajas: 2
        }
      ]
    }
  }

  const sucursales = getSucursales()

  const handleSucursalClick = (sucursal: any) => {
    setSelectedSucursal(sucursal)
  }

  const getSucursalIcon = (tipo: string) => {
    return tipo === 'ENTERFAC' ? Building : MapPin
  }

  const getSucursalColor = (tipo: string) => {
    return tipo === 'ENTERFAC' ? 'primary' : 'success'
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 font-primary fw-semibold d-flex align-items-center gap-2">
            <Building size={20} />
            Sucursales
            <span className="badge bg-primary">{sucursales.length}</span>
          </h5>
          <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
            <Plus size={16} />
            Agregar Sucursal
          </button>
        </div>
      </div>
      <div className="card-body">
        {sucursales.length === 0 ? (
          <div className="text-center py-4">
            <Building size={48} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay sucursales registradas</p>
          </div>
        ) : (
          <div className="row g-3">
            {sucursales.map((sucursal) => {
              const IconComponent = getSucursalIcon(sucursal.tipo)
              const colorClass = getSucursalColor(sucursal.tipo)
              
              return (
                <div key={sucursal.id} className="col-lg-4 col-md-6">
                  <div 
                    className="card border h-100 cursor-pointer"
                    onClick={() => handleSucursalClick(sucursal)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center p-3">
                      <IconComponent 
                        size={40} 
                        className={`text-${colorClass} mb-3`} 
                      />
                      <h6 className="card-title mb-2">{sucursal.nombre}</h6>
                      <p className="card-text small text-muted mb-3">
                        {sucursal.direccion}
                      </p>
                      
                      <div className="d-flex justify-content-center gap-2 mb-3">
                        <span className={`badge bg-${colorClass}`}>
                          {sucursal.tipo}
                        </span>
                        <span className={`badge ${
                          sucursal.activa ? 'bg-success' : 'bg-danger'
                        }`}>
                          {sucursal.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>

                      {/* Info específica de ANDESPOS */}
                      {sucursal.tipo === 'ANDESPOS' && (
                        <div className="small text-muted mb-3">
                          <div>Cajas: {sucursal.cantidadCajas}</div>
                          {sucursal.tieneBox && (
                            <div className="text-success">
                              <strong>Con BOX</strong>
                            </div>
                          )}
                        </div>
                      )}

                      <button className="btn btn-sm btn-outline-primary">
                        <Eye size={14} className="me-1" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedSucursal && (
        <SucursalDetailModal
          sucursal={selectedSucursal}
          isOpen={!!selectedSucursal}
          onClose={() => setSelectedSucursal(null)}
        />
      )}
    </div>
  )
}
