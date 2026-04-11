import React, { useRef, useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Upload, FileText, Image, X, CheckCircle } from 'lucide-react'

export const DocumentacionEmpresaStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const docs = state.data.documentacionEmpresa || {}

  const logoRef = useRef<HTMLInputElement>(null)
  const carpetaRef = useRef<HTMLInputElement>(null)
  const vbRef = useRef<HTMLInputElement>(null)

  const [logoPreview, setLogoPreview] = useState<string | null>(docs.logoPreview || null)
  const [logoNombre, setLogoNombre] = useState<string>(docs.logoNombre || '')
  const [carpetaNombre, setCarpetaNombre] = useState<string>(docs.carpetaNombre || '')
  const [vbNombre, setVbNombre] = useState<string>(docs.vbNombre || '')

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setLogoPreview(result)
      setLogoNombre(file.name)
      updateData({
        documentacionEmpresa: {
          ...docs,
          logo: result,
          logoNombre: file.name,
          logoPreview: result,
        }
      })
    }
    reader.readAsDataURL(file)
  }

  const handleCarpeta = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setCarpetaNombre(file.name)
      updateData({
        documentacionEmpresa: {
          ...docs,
          carpetaTributaria: result,
          carpetaNombre: file.name,
        }
      })
    }
    reader.readAsDataURL(file)
  }

  const quitarLogo = () => {
    setLogoPreview(null)
    setLogoNombre('')
    if (logoRef.current) logoRef.current.value = ''
    updateData({
      documentacionEmpresa: { ...docs, logo: null, logoNombre: '', logoPreview: null }
    })
  }

  const quitarCarpeta = () => {
    setCarpetaNombre('')
    if (carpetaRef.current) carpetaRef.current.value = ''
    updateData({
      documentacionEmpresa: { ...docs, carpetaTributaria: null, carpetaNombre: '' }
    })
  }

  const handleVb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setVbNombre(file.name)
      updateData({
        documentacionEmpresa: {
          ...docs,
          vistoBueno: result,
          vbNombre: file.name,
        }
      })
    }
    reader.readAsDataURL(file)
  }

  const quitarVb = () => {
    setVbNombre('')
    if (vbRef.current) vbRef.current.value = ''
    updateData({
      documentacionEmpresa: { ...docs, vistoBueno: null, vbNombre: '' }
    })
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Documentación Empresa</h4>
        <p className="text-muted">Adjunte el logo y la carpeta tributaria de la empresa</p>
      </div>

      <div className="row g-4">
        {/* Logo */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Image size={18} className="text-primary" />
                <h6 className="mb-0 fw-semibold">Logo de la Empresa</h6>
                <span className="badge bg-secondary fw-normal small">Opcional</span>
              </div>

              {logoPreview ? (
                <div className="text-center">
                  <div className="position-relative d-inline-block mb-3">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="rounded border"
                      style={{ maxWidth: '200px', maxHeight: '160px', objectFit: 'contain' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0"
                      style={{ borderRadius: '50%', padding: '2px 6px', transform: 'translate(50%, -50%)' }}
                      onClick={quitarLogo}
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-success small">
                    <CheckCircle size={14} />
                    <span>{logoNombre}</span>
                  </div>
                </div>
              ) : (
                <div
                  className="border border-2 border-dashed rounded p-4 text-center"
                  style={{ cursor: 'pointer', borderColor: 'var(--bs-primary)' }}
                  onClick={() => logoRef.current?.click()}
                >
                  <Upload size={32} className="text-primary mb-2" />
                  <p className="small text-muted mb-1">Haz clic para subir el logo</p>
                  <p className="small text-muted mb-0">PNG, JPG o GIF — máx. 5MB</p>
                </div>
              )}

              <input
                ref={logoRef}
                type="file"
                accept=".png,.jpg,.jpeg,.gif"
                className="d-none"
                onChange={handleLogo}
              />

              {!logoPreview && (
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 mt-3"
                  onClick={() => logoRef.current?.click()}
                >
                  <Upload size={16} className="me-2" />
                  Seleccionar logo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Carpeta Tributaria */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FileText size={18} className="text-danger" />
                <h6 className="mb-0 fw-semibold">Carpeta Tributaria</h6>
                <span className="badge bg-danger bg-opacity-10 text-danger fw-normal small">Requerido</span>
              </div>

              {carpetaNombre ? (
                <div className="border rounded p-3 d-flex align-items-center gap-3">
                  <FileText size={32} className="text-danger flex-shrink-0" />
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="mb-0 small fw-semibold text-truncate">{carpetaNombre}</p>
                    <p className="mb-0 small text-success d-flex align-items-center gap-1 mt-1">
                      <CheckCircle size={13} /> Archivo cargado correctamente
                    </p>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={quitarCarpeta}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  className="border border-2 border-dashed rounded p-4 text-center"
                  style={{ cursor: 'pointer', borderColor: 'var(--bs-danger)' }}
                  onClick={() => carpetaRef.current?.click()}
                >
                  <FileText size={32} className="text-danger mb-2" />
                  <p className="small text-muted mb-1">Haz clic para subir la carpeta tributaria</p>
                  <p className="small text-muted mb-0">Solo PDF — máx. 10MB</p>
                </div>
              )}

              <input
                ref={carpetaRef}
                type="file"
                accept=".pdf"
                className="d-none"
                onChange={handleCarpeta}
              />

              {!carpetaNombre && (
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 mt-3"
                  onClick={() => carpetaRef.current?.click()}
                >
                  <Upload size={16} className="me-2" />
                  Seleccionar PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Visto Bueno / Propuesta Comercial */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FileText size={18} className="text-success" />
                <h6 className="mb-0 fw-semibold">Visto Bueno / Propuesta Comercial</h6>
                <span className="badge bg-secondary fw-normal small">Opcional</span>
              </div>
              <p className="text-muted small mb-3">
                Adjunte el documento de Visto Bueno o Propuesta Comercial de Servicios que avala la implementación.
              </p>

              {vbNombre ? (
                <div className="border rounded p-3 d-flex align-items-center gap-3">
                  <FileText size={32} className="text-success flex-shrink-0" />
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="mb-0 small fw-semibold text-truncate">{vbNombre}</p>
                    <p className="mb-0 small text-success d-flex align-items-center gap-1 mt-1">
                      <CheckCircle size={13} /> Archivo cargado correctamente
                    </p>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={quitarVb}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  className="border border-2 border-dashed rounded p-4 text-center"
                  style={{ cursor: 'pointer', borderColor: 'var(--bs-success)' }}
                  onClick={() => vbRef.current?.click()}
                >
                  <FileText size={32} className="text-success mb-2" />
                  <p className="small text-muted mb-1">Haz clic para subir el documento</p>
                  <p className="small text-muted mb-0">Solo PDF — máx. 10MB</p>
                </div>
              )}

              <input
                ref={vbRef}
                type="file"
                accept=".pdf"
                className="d-none"
                onChange={handleVb}
              />

              {!vbNombre && (
                <button
                  type="button"
                  className="btn btn-outline-success w-100 mt-3"
                  onClick={() => vbRef.current?.click()}
                >
                  <Upload size={16} className="me-2" />
                  Seleccionar PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="col-12">
          <div className="alert alert-info small mb-0">
            <strong>Nota:</strong> El logo se usará en los documentos tributarios electrónicos.
            La carpeta tributaria debe ser el documento oficial del SII con RUT y actividades económicas.
            El Visto Bueno o Propuesta Comercial es de referencia para el equipo de Onboarding.
          </div>
        </div>
      </div>
    </div>
  )
}