import React from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Building2 } from 'lucide-react'

export const DatosGeneralesStep: React.FC = () => {
  const { state, updateData } = useFormContext()

  const datosGenerales = state.data.datosGenerales || {}

  const handleInputChange = (field: string, value: string) => {
    updateData({
      datosGenerales: {
        ...datosGenerales,
        [field]: value
      }
    })
  }

  const formatRut = (value: string) => {
    const cleanValue = value.replace(/[^0-9kK]/g, '')
    if (cleanValue.length <= 1) return cleanValue
    const body = cleanValue.slice(0, -1)
    const dv = cleanValue.slice(-1)
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${formattedBody}-${dv}`
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Datos Generales</h4>
        <p className="text-muted">
          Ingrese la información básica de la empresa cliente
        </p>
      </div>

      <div className="row g-4">
        {/* Nombre Empresa */}
        <div className="col-md-6">
          <label className="form-label required">Nombre de la Empresa</label>
          <div className="input-group">
            <span className="input-group-text">
              <Building2 size={18} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Ingrese el nombre completo"
              value={datosGenerales.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              required
            />
          </div>
        </div>

        {/* RUT Empresa */}
        <div className="col-md-6">
          <label className="form-label required">RUT de la Empresa</label>
          <input
            type="text"
            className="form-control"
            placeholder="12.345.678-9"
            value={datosGenerales.rut || ''}
            onChange={(e) => handleInputChange('rut', formatRut(e.target.value))}
            maxLength={12}
            required
          />
          <div className="form-text">Formato: 12.345.678-9</div>
        </div>

        {/* Nombre Fantasía */}
        <div className="col-md-6">
          <label className="form-label">Nombre de Fantasía</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nombre comercial (opcional)"
            value={datosGenerales.nombreFantasia || datosGenerales.nombre_fantasia || ''}
            onChange={(e) => handleInputChange('nombreFantasia', e.target.value)}
          />
        </div>

        {/* Info */}
        <div className="col-12">
          <div className="alert alert-info">
            <h6 className="alert-heading">Información Importante</h6>
            <ul className="mb-0 small">
              <li>El nombre de la empresa debe coincidir exactamente con el registro oficial</li>
              <li>El RUT debe estar vigente y sin restricciones en el SII</li>
              <li>El logo y la carpeta tributaria se adjuntan en el paso <strong>"Documentación Empresa"</strong></li>
              <li>La categoría tributaria se configura en el paso <strong>"Actividades Económicas"</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}