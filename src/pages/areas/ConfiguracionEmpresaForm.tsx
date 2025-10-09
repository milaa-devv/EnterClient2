import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const opcionesFormatoImpresion = ['Termica', 'Laser']
const opcionesLayout = ['Estandar', 'Custom']
const opcionesDTEHabilitados = ['Factura', 'Boleta', 'Guia', 'Nota Credito', 'Nota Debito']
const opcionesTipoIntegracion = ['Integracion A', 'Integracion B', 'Integracion C']
const versiones = ['v1.0', 'v2.0', 'v3.0']
const opcionesModalidadFirma = ['Controlada', 'Automatica']
const opcionesModalidadEmision = ['Online', 'Semi Offline']
const opcionesFolios = ['Administrados por Enternet', 'Administrados por el Cliente']

const ConfiguracionEmpresaForm = () => {
  const { empkey } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    formatoImpresion: 'Termica',
    casillaIntercambio: '',
    replicaPassword: '',
    empkey: empkey || '',
    urlVistoBueno: '',
    urlMembrete: '',
    layout: 'Estandar',
    dteHabilitados: [] as string[],
    tipoIntegracion: '',
    otros: '',
    versionMensaje: '',
    versionEmisor: '',
    versionAppFull: '',
    versionWinPlugin: '',
    modalidadFirma: 'Controlada',
    modalidadEmision: 'Online',
    folios: 'Administrados por Enternet',
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleDteHabilitado = (dte: string) => {
    setFormData((prev) => {
      const exists = prev.dteHabilitados.includes(dte)
      const newList = exists
        ? prev.dteHabilitados.filter((x) => x !== dte)
        : [...prev.dteHabilitados, dte]
      return { ...prev, dteHabilitados: newList }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save to backend / Supabase
    alert('Datos guardados y enviados a SAC')
    navigate('/sac') // Navigate to SAC dashboard
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
      <h2 className="font-primary mb-4">Configuración Empresa (Empkey: {empkey})</h2>
      
      <div className="mb-3">
        <label htmlFor="formatoImpresion" className="form-label required">
          Formato Impresión
        </label>
        <select
          id="formatoImpresion"
          className="form-select"
          value={formData.formatoImpresion}
          onChange={(e) => handleChange('formatoImpresion', e.target.value)}
          required
        >
          {opcionesFormatoImpresion.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="casillaIntercambio" className="form-label required">
          Casilla de intercambio
        </label>
        <input
          type="text"
          id="casillaIntercambio"
          className="form-control"
          value={formData.casillaIntercambio}
          onChange={(e) => handleChange('casillaIntercambio', e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="replicaPassword" className="form-label required">
          Replica Password
        </label>
        <input
          type="text"
          id="replicaPassword"
          className="form-control"
          value={formData.replicaPassword}
          onChange={(e) => handleChange('replicaPassword', e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="empkey" className="form-label required">
          Empkey
        </label>
        <input
          type="number"
          id="empkey"
          className="form-control"
          value={formData.empkey}
          onChange={(e) => handleChange('empkey', e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="urlVistoBueno" className="form-label">
          URL Visto Bueno
        </label>
        <input
          type="url"
          id="urlVistoBueno"
          className="form-control"
          value={formData.urlVistoBueno}
          onChange={(e) => handleChange('urlVistoBueno', e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="urlMembrete" className="form-label">
          URL Membrete
        </label>
        <input
          type="url"
          id="urlMembrete"
          className="form-control"
          value={formData.urlMembrete}
          onChange={(e) => handleChange('urlMembrete', e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="layout" className="form-label">
          Layout
        </label>
        <select
          id="layout"
          className="form-select"
          value={formData.layout}
          onChange={(e) => handleChange('layout', e.target.value)}
        >
          {opcionesLayout.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {formData.layout === 'Custom' && (
        <div className="mb-3 text-primary">
          <em>Aquí despliega opciones avanzadas para Layout personalizado.</em>
        </div>
      )}

      <fieldset className="mb-3">
        <legend>DTE Habilitados</legend>
        {opcionesDTEHabilitados.map((dte) => (
          <div className="form-check" key={dte}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`dte-${dte}`}
              checked={formData.dteHabilitados.includes(dte)}
              onChange={() => toggleDteHabilitado(dte)}
            />
            <label className="form-check-label" htmlFor={`dte-${dte}`}>
              {dte}
            </label>
          </div>
        ))}
      </fieldset>

      <div className="mb-3">
        <label htmlFor="tipoIntegracion" className="form-label">
          Tipo de Integración
        </label>
        <select
          id="tipoIntegracion"
          className="form-select"
          value={formData.tipoIntegracion}
          onChange={(e) => handleChange('tipoIntegracion', e.target.value)}
        >
          {opcionesTipoIntegracion.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="otros" className="form-label">
          Otros
        </label>
        <textarea
          id="otros"
          className="form-control"
          rows={3}
          value={formData.otros}
          onChange={(e) => handleChange('otros', e.target.value)}
        />
      </div>

      {['versionMensaje','versionEmisor','versionAppFull','versionWinPlugin'].map(field => (
        <div className="mb-3" key={field}>
          <label htmlFor={field} className="form-label">
            {field.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <select
            id={field}
            className="form-select"
            value={(formData as any)[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          >
            {versiones.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      ))}

      <div className="mb-3">
        <label htmlFor="modalidadFirma" className="form-label">
          Modalidad de Firma
        </label>
        <select
          id="modalidadFirma"
          className="form-select"
          value={formData.modalidadFirma}
          onChange={(e) => handleChange('modalidadFirma', e.target.value)}
        >
          {opcionesModalidadFirma.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="modalidadEmision" className="form-label">
          Modalidad de Emisión
        </label>
        <select
          id="modalidadEmision"
          className="form-select"
          value={formData.modalidadEmision}
          onChange={(e) => handleChange('modalidadEmision', e.target.value)}
        >
          {opcionesModalidadEmision.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="folios" className="form-label">
          Folios
        </label>
        <select
          id="folios"
          className="form-select"
          value={formData.folios}
          onChange={(e) => handleChange('folios', e.target.value)}
        >
          {opcionesFolios.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary mt-3">
        Guardar y Enviar a SAC
      </button>
    </form>
  )
}

export default ConfiguracionEmpresaForm
