import React, { useState, useRef } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Upload, Building2, Calendar } from 'lucide-react'

export const DatosGeneralesStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const [logoPreview, setLogoPreview] = useState<string | null>(
    state.data.datosGenerales?.logo || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const datosGenerales = state.data.datosGenerales || {}

  const handleInputChange = (field: string, value: string | number[]) => {
    updateData({
      datosGenerales: {
        ...datosGenerales,
        [field]: value
      }
    })
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        handleInputChange('logo', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const categoriasTributarias = [
    { id: 1, nombre: 'Primera Categoría' },
    { id: 2, nombre: 'Segunda Categoría' },
    { id: 3, nombre: 'Sin Categoría (Exenta)' }
  ]

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
            value={datosGenerales.nombre_fantasia || ''}
            onChange={(e) => handleInputChange('nombre_fantasia', e.target.value)}
          />
        </div>

        {/* Fecha de Inicio */}
        <div className="col-md-6">
          <label className="form-label">Fecha de Inicio de Actividades</label>
          <div className="input-group">
            <span className="input-group-text">
              <Calendar size={18} />
            </span>
            <input
              type="date"
              className="form-control"
              value={datosGenerales.fecha_inicio || ''}
              onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
            />
          </div>
        </div>

        {/* Categoría Tributaria */}
        <div className="col-12">
          <label className="form-label required">Categoría Tributaria</label>
          <div className="row g-2">
            {categoriasTributarias.map((categoria) => (
              <div key={categoria.id} className="col-md-6 col-lg-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`categoria-${categoria.id}`}
                    checked={(datosGenerales.categoria_tributaria || []).includes(categoria.id)}
                    onChange={(e) => {
                      const current = datosGenerales.categoria_tributaria || []
                      if (e.target.checked) {
                        handleInputChange('categoria_tributaria', [...current, categoria.id])
                      } else {
                        handleInputChange('categoria_tributaria', current.filter(id => id !== categoria.id))
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor={`categoria-${categoria.id}`}>
                    {categoria.nombre}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="col-12">
          <label className="form-label">Logo de la Empresa</label>
          <div className="row">
            <div className="col-md-8">
              <input
                ref={fileInputRef}
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleLogoUpload}
              />
              <div className="form-text">
                Formatos soportados: JPG, PNG, SVG. Tamaño máximo: 2MB
              </div>
            </div>
            <div className="col-md-4">
              <div 
                className="border rounded d-flex align-items-center justify-content-center"
                style={{ height: '100px' }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Vista previa logo"
                    className="img-fluid"
                    style={{ maxHeight: '80px', maxWidth: '100%' }}
                  />
                ) : (
                  <div className="text-center text-muted">
                    <Upload size={24} className="mb-1" />
                    <div className="small">Vista previa</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="col-12">
          <div className="alert alert-info">
            <h6 className="alert-heading">Información Importante</h6>
            <ul className="mb-0 small">
              <li>El nombre de la empresa debe coincidir exactamente con el registro oficial</li>
              <li>El RUT debe estar vigente y sin restricciones en el SII</li>
              <li>La categoría tributaria determina los tipos de documentos que puede emitir</li>
              <li>El logo será utilizado en los documentos tributarios electrónicos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
