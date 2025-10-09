import React from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { MapPin, Phone, Mail } from 'lucide-react'

export const DatosContactoStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const datosContacto = state.data.datosContacto || {}

  const handleInputChange = (field: string, value: string) => {
    updateData({
      datosContacto: {
        ...datosContacto,
        [field]: value
      }
    })
  }

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '')
    if (cleanValue.startsWith('56')) {
      // Ya tiene código país
      return cleanValue.replace(/(\d{2})(\d{1})(\d{8})/, '+$1 $2 $3')
    } else if (cleanValue.startsWith('9') && cleanValue.length === 9) {
      // Móvil sin código país
      return `+56 ${cleanValue}`
    } else if (cleanValue.length === 9) {
      // Teléfono fijo
      return `+56 ${cleanValue.slice(0, 1)} ${cleanValue.slice(1)}`
    }
    return value
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Datos de Contacto</h4>
        <p className="text-muted">
          Información de contacto principal de la empresa
        </p>
      </div>

      <div className="row g-4">
        {/* Domicilio */}
        <div className="col-12">
          <label className="form-label required">Domicilio Legal</label>
          <div className="input-group">
            <span className="input-group-text">
              <MapPin size={18} />
            </span>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Dirección completa incluyendo comuna y región"
              value={datosContacto.domicilio || ''}
              onChange={(e) => handleInputChange('domicilio', e.target.value)}
              required
            />
          </div>
          <div className="form-text">
            Ej: Av. Providencia 1234, Oficina 567, Providencia, Región Metropolitana
          </div>
        </div>

        {/* Teléfono */}
        <div className="col-md-6">
          <label className="form-label required">Teléfono Principal</label>
          <div className="input-group">
            <span className="input-group-text">
              <Phone size={18} />
            </span>
            <input
              type="tel"
              className="form-control"
              placeholder="+56 9 1234 5678"
              value={datosContacto.telefono || ''}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                handleInputChange('telefono', formatted)
              }}
              required
            />
          </div>
          <div className="form-text">Incluir código país (+56)</div>
        </div>

        {/* Teléfono Secundario */}
        <div className="col-md-6">
          <label className="form-label">Teléfono Secundario</label>
          <div className="input-group">
            <span className="input-group-text">
              <Phone size={18} />
            </span>
            <input
              type="tel"
              className="form-control"
              placeholder="+56 2 1234 5678"
              value={datosContacto.telefono_secundario || ''}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                handleInputChange('telefono_secundario', formatted)
              }}
            />
          </div>
        </div>

        {/* Correo Principal */}
        <div className="col-md-6">
          <label className="form-label required">Correo Electrónico Principal</label>
          <div className="input-group">
            <span className="input-group-text">
              <Mail size={18} />
            </span>
            <input
              type="email"
              className="form-control"
              placeholder="contacto@empresa.cl"
              value={datosContacto.correo || ''}
              onChange={(e) => handleInputChange('correo', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Correo Secundario */}
        <div className="col-md-6">
          <label className="form-label">Correo Electrónico Secundario</label>
          <div className="input-group">
            <span className="input-group-text">
              <Mail size={18} />
            </span>
            <input
              type="email"
              className="form-control"
              placeholder="administracion@empresa.cl"
              value={datosContacto.correo_secundario || ''}
              onChange={(e) => handleInputChange('correo_secundario', e.target.value)}
            />
          </div>
        </div>

        {/* Página Web */}
        <div className="col-md-6">
          <label className="form-label">Página Web</label>
          <input
            type="url"
            className="form-control"
            placeholder="https://www.empresa.cl"
            value={datosContacto.sitio_web || ''}
            onChange={(e) => handleInputChange('sitio_web', e.target.value)}
          />
        </div>

        {/* Región */}
        <div className="col-md-6">
          <label className="form-label required">Región</label>
          <select
            className="form-select"
            value={datosContacto.region || ''}
            onChange={(e) => handleInputChange('region', e.target.value)}
            required
          >
            <option value="">Seleccionar región</option>
            <option value="XV">XV - Arica y Parinacota</option>
            <option value="I">I - Tarapacá</option>
            <option value="II">II - Antofagasta</option>
            <option value="III">III - Atacama</option>
            <option value="IV">IV - Coquimbo</option>
            <option value="V">V - Valparaíso</option>
            <option value="RM">RM - Región Metropolitana</option>
            <option value="VI">VI - O'Higgins</option>
            <option value="VII">VII - Maule</option>
            <option value="XVI">XVI - Ñuble</option>
            <option value="VIII">VIII - Biobío</option>
            <option value="IX">IX - La Araucanía</option>
            <option value="XIV">XIV - Los Ríos</option>
            <option value="X">X - Los Lagos</option>
            <option value="XI">XI - Aysén</option>
            <option value="XII">XII - Magallanes</option>
          </select>
        </div>

        {/* Información adicional */}
        <div className="col-12">
          <div className="alert alert-warning">
            <h6 className="alert-heading">Importante</h6>
            <ul className="mb-0 small">
              <li>El domicilio debe coincidir con el registrado en el SII</li>
              <li>El correo principal será usado para notificaciones oficiales</li>
              <li>Mantenga siempre actualizados los datos de contacto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
