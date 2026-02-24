import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AlertTriangle, CalendarClock, CheckCircle2, ImagePlus, Save } from 'lucide-react'

type PapEstado = 'PENDIENTE' | 'EN_EJECUCION' | 'REPROGRAMADO' | 'COMPLETADO'
type Producto = 'ENTERFAC' | 'ANDESPOS' | '—'

const PAP_TABLE = 'pap_sac'
const PAP_BUCKET = 'pap_sac'

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-CL')
  } catch {
    return String(iso)
  }
}

function safeArr(v: any): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String)
  return []
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

function extractProducto(empresa: any): Producto {
  return (
    empresa?.producto ||
    one(empresa?.empresa_onboarding)?.producto ||
    empresa?.empresa_comercial?.producto ||
    empresa?.onboarding?.producto ||
    '—'
  )
}

function extractFechaPAP(empresa: any): string | null {
  const ob = one(empresa?.empresa_onboarding)
  return (
    ob?.pap_fecha_hora ||
    empresa?.pap_fecha_hora ||
    ob?.fecha_pap ||
    ob?.pap_fecha ||
    empresa?.onboarding?.pap_fecha_hora ||
    null
  )
}

function extractCasilla(empresa: any): string {
  const ob = one(empresa?.empresa_onboarding)
  return ob?.casilla_intercambio || ob?.casilla || empresa?.onboarding?.casilla || ''
}

function extractDocumentos(empresa: any): string[] {
  const ob = one(empresa?.empresa_onboarding)
  return safeArr(ob?.documentos_dte) || safeArr(ob?.dte_habilitados) || safeArr(empresa?.onboarding?.documentos_dte) || []
}

function extractObTicket(empresa: any): string {
  const ob = one(empresa?.empresa_onboarding)
  return ob?.ticket_hs || ''
}

function extractObTipoIntegracion(empresa: any): string {
  const ob = one(empresa?.empresa_onboarding)
  return ob?.tipo_integracion || ''
}

function extractObTipoCertificacion(empresa: any): string {
  const ob = one(empresa?.empresa_onboarding)
  return ob?.tipo_certificacion || ''
}

function hasFacturaEnAndes(documentos: string[]) {
  return documentos.includes('33') || documentos.includes('34') || documentos.includes('46')
}

async function uploadOne(empkey: number, file: File, folder: string) {
  const ext = file.name.split('.').pop() || 'png'
  const path = `${empkey}/${folder}/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(PAP_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })
  if (error) throw error

  const { data } = supabase.storage.from(PAP_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function uploadMany(empkey: number, files: FileList, folder: string) {
  const out: string[] = []
  for (const f of Array.from(files)) out.push(await uploadOne(empkey, f, folder))
  return out
}

function badgeClass(estado: PapEstado) {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-secondary'
    case 'EN_EJECUCION':
      return 'bg-warning text-dark'
    case 'REPROGRAMADO':
      return 'bg-danger'
    case 'COMPLETADO':
      return 'bg-success'
    default:
      return 'bg-secondary'
  }
}

type PapData = {
  ticket_hs?: string
  tipo_integracion?: string
  tipo_certificacion?: string
  documentos_dte?: string[]

  declaracion_cumplimiento_img?: string | null
  sender_img?: string | null
  casillas_dte_img?: string | null
  desafiliacion_boleta_img?: string | null
  modelo_emision_img?: string | null

  folios_detalle?: string
  prueba_emision_imgs?: string[]
  observaciones?: string

  reprogramaciones?: Array<{
    motivo: string
    imagenes?: string[]
    created_at: string
  }>
}

const PapForm: React.FC = () => {
  const { empkey: empkeyParam } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const empkey = Number(empkeyParam)

  const [empresa, setEmpresa] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [estado, setEstado] = useState<PapEstado>('PENDIENTE')
  const [fechaHora, setFechaHora] = useState<string>('') // A
  const [casilla, setCasilla] = useState<string>('') // B

  const [pap, setPap] = useState<PapData>({
    prueba_emision_imgs: [],
    documentos_dte: [],
    reprogramaciones: [],
  })

  // Modal reprogramar
  const [showReprog, setShowReprog] = useState(false)
  const [reprogMotivo, setReprogMotivo] = useState('')
  const [reprogImgs, setReprogImgs] = useState<string[]>([])
  const [reprogUploading, setReprogUploading] = useState(false)

  const producto = useMemo<Producto>(() => extractProducto(empresa), [empresa])

  const documentos = useMemo(() => {
    const fromPap = safeArr(pap.documentos_dte)
    const fromEmpresa = extractDocumentos(empresa)
    return fromPap.length ? fromPap : fromEmpresa
  }, [pap.documentos_dte, empresa])

  // B desde OB (y fallback al pap.data por compat)
  const ticketHs = useMemo(() => extractObTicket(empresa) || pap.ticket_hs || '', [empresa, pap.ticket_hs])
  const tipoIntegracion = useMemo(() => extractObTipoIntegracion(empresa) || pap.tipo_integracion || '', [empresa, pap.tipo_integracion])
  const tipoCertificacion = useMemo(() => extractObTipoCertificacion(empresa) || pap.tipo_certificacion || '', [empresa, pap.tipo_certificacion])

  const andesConFactura = useMemo(() => {
    return producto === 'ANDESPOS' ? hasFacturaEnAndes(documentos) : false
  }, [producto, documentos])

  const ordenD = useMemo(() => {
    if (producto === 'ENTERFAC') return [1, 3, 2, 4, 5, 6]
    if (producto === 'ANDESPOS') return andesConFactura ? [8, 7, 1, 3, 2, 4, 5, 6] : [8, 7, 2, 4, 5, 6]
    return [1, 3, 2, 4, 5, 6]
  }, [producto, andesConFactura])

  const autoEstado = useMemo<PapEstado>(() => {
    if (estado === 'REPROGRAMADO' || estado === 'COMPLETADO') return estado
    if (!fechaHora) return 'PENDIENTE'
    const t = new Date(fechaHora).getTime()
    if (Number.isNaN(t)) return 'PENDIENTE'
    return Date.now() < t ? 'PENDIENTE' : 'EN_EJECUCION'
  }, [estado, fechaHora])

  // Load empresa + pap_sac
  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!empkeyParam || Number.isNaN(empkey)) throw new Error('Empkey inválido.')

        const { data: empresaData, error: empErr } = await supabase
          .from('empresa')
          .select('empkey,rut,nombre,estado,producto,empresa_onboarding(*)')
          .eq('empkey', empkey)
          .single()

        if (empErr) throw empErr

        setEmpresa(empresaData)

        const f = extractFechaPAP(empresaData)
        setFechaHora(f || '')
        setCasilla(extractCasilla(empresaData) || '')

        const { data: papRow, error: papErr } = await supabase
          .from(PAP_TABLE)
          .select('empkey,estado,fecha_hora,data,updated_at')
          .eq('empkey', empkey)
          .maybeSingle()

        if (papErr) throw papErr

        if (papRow) {
          setEstado((papRow.estado as PapEstado) || 'PENDIENTE')
          setFechaHora(papRow.fecha_hora || f || '')
          setPap((papRow.data as PapData) || {})
        } else {
          setPap((p) => ({
            ...p,
            documentos_dte: extractDocumentos(empresaData),
            ticket_hs: extractObTicket(empresaData),
            tipo_integracion: extractObTipoIntegracion(empresaData),
            tipo_certificacion: extractObTipoCertificacion(empresaData),
          }))
        }
      } catch (e: any) {
        setError(e?.message ?? 'Error cargando PAP.')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [empkey, empkeyParam])

  const save = async (
    nextEstado?: PapEstado,
    extraData?: Partial<PapData>,
    opts?: { silent?: boolean }
  ) => {
    setSaving(true)
    setError(null)

    try {
      if (!empresa?.empkey) throw new Error('No hay empresa cargada.')

      // Snapshot de B desde OB dentro del PAP (así queda guardado aunque OB cambie)
      const mergedData: PapData = {
        ...pap,
        ...(extraData || {}),
        documentos_dte: documentos,
        ticket_hs: ticketHs,
        tipo_integracion: tipoIntegracion,
        tipo_certificacion: tipoCertificacion,
      }

      const estadoToSave = nextEstado || autoEstado

      const payload = {
        empkey: empresa.empkey,
        estado: estadoToSave,
        fecha_hora: fechaHora || null,
        data: mergedData,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from(PAP_TABLE).upsert(payload, { onConflict: 'empkey' })
      if (error) throw error

      setPap(mergedData)
      setEstado(estadoToSave)

      if (!opts?.silent) alert('Guardado ✅')
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  const completar = async () => {
    const ok = confirm('¿Marcar como COMPLETADO y mover empresa a producción?')
    if (!ok) return

    setSaving(true)
    setError(null)

    try {
      if (!empresa?.empkey) throw new Error('No hay empresa cargada.')

      // 1) Guardar PAP como completado (silencioso)
      await save('COMPLETADO', undefined, { silent: true })

      // 2) Mover empresa a COMPLETADA + tracking
      const { error } = await supabase
        .from('empresa')
        .update({
          estado: 'COMPLETADA',
          paso_produccion_por_rut: profile?.rut ?? null,
          paso_produccion_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('empkey', empresa.empkey)

      if (error) throw error

      alert('PAP completado ✅')
      navigate('/sac/mis-empresas')
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo completar.')
    } finally {
      setSaving(false)
    }
  }

  const pickUploadSingle = async (folder: string, onSet: (url: string) => void) => {
    if (!empresa?.empkey) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        setSaving(true)
        const url = await uploadOne(empresa.empkey, file, folder)
        onSet(url)
      } catch (e: any) {
        setError(e?.message ?? 'Error subiendo imagen.')
      } finally {
        setSaving(false)
      }
    }
    input.click()
  }

  const pickUploadMulti = async (folder: string, onAdd: (urls: string[]) => void) => {
    if (!empresa?.empkey) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async () => {
      const files = input.files
      if (!files || files.length === 0) return
      try {
        setSaving(true)
        const urls = await uploadMany(empresa.empkey, files, folder)
        onAdd(urls)
      } catch (e: any) {
        setError(e?.message ?? 'Error subiendo imágenes.')
      } finally {
        setSaving(false)
      }
    }
    input.click()
  }

  const renderImgs = (urls?: string[], onRemove?: (idx: number) => void) => {
    const list = urls || []
    if (list.length === 0) return <div className="text-muted small">Sin imágenes.</div>

    return (
      <div className="d-flex flex-wrap gap-2">
        {list.map((u, idx) => (
          <div key={u + idx} className="position-relative">
            <img src={u} alt="evidencia" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }} />
            {onRemove && (
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                style={{ transform: 'translate(30%,-30%)' }}
                onClick={() => onRemove(idx)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  const abrirReprogramar = () => {
    setReprogMotivo('')
    setReprogImgs([])
    setShowReprog(true)
  }

  const subirImgsReprog = async () => {
    if (!empresa?.empkey) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async () => {
      const files = input.files
      if (!files || files.length === 0) return
      try {
        setReprogUploading(true)
        const urls = await uploadMany(empresa.empkey, files, 'reprogramacion')
        setReprogImgs((prev) => [...prev, ...urls])
      } catch (e: any) {
        setError(e?.message ?? 'Error subiendo imágenes.')
      } finally {
        setReprogUploading(false)
      }
    }
    input.click()
  }

  const confirmarReprogramacion = async () => {
    if (!reprogMotivo.trim()) {
      alert('Necesito el motivo sí o sí 😅')
      return
    }

    const evento = {
      motivo: reprogMotivo.trim(),
      imagenes: reprogImgs,
      created_at: new Date().toISOString(),
    }

    const nextList = [...(pap.reprogramaciones || []), evento]

    await save('REPROGRAMADO', { reprogramaciones: nextList })
    setShowReprog(false)

    alert('Reprogramado ✅ (quedó registrado para coordinación)')
  }

  // ------------------ UI D (tu mismo bloque, sin cambios funcionales) ------------------
  const D1 = (
    <div className="card mb-3">
      <div className="card-header fw-semibold">1) Declaración de cumplimiento de Requisitos</div>
      <div className="card-body">
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 mb-2"
          type="button"
          onClick={() => pickUploadSingle('declaracion', (url) => setPap((p) => ({ ...p, declaracion_cumplimiento_img: url })))}
          disabled={saving}
        >
          <ImagePlus size={16} />
          Cargar imagen
        </button>

        {pap.declaracion_cumplimiento_img ? (
          <img src={pap.declaracion_cumplimiento_img} alt="declaración" style={{ width: '100%', maxWidth: 520, borderRadius: 10 }} />
        ) : (
          <div className="text-muted small">Sin imagen.</div>
        )}
      </div>
    </div>
  )

  const D2 = (
    <div className="card mb-3">
      <div className="card-header fw-semibold">2) Actualizar Sender</div>
      <div className="card-body">
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 mb-2"
          type="button"
          onClick={() => pickUploadSingle('sender', (url) => setPap((p) => ({ ...p, sender_img: url })))}
          disabled={saving}
        >
          <ImagePlus size={16} />
          Cargar imagen
        </button>

        {pap.sender_img ? (
          <img src={pap.sender_img} alt="sender" style={{ width: '100%', maxWidth: 520, borderRadius: 10 }} />
        ) : (
          <div className="text-muted small">Sin imagen.</div>
        )}
      </div>
    </div>
  )

  const D3 = (
    <div className="card mb-3">
      <div className="card-header fw-semibold">3) Configuración de casillas para la emisión de DTE</div>
      <div className="card-body">
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 mb-2"
          type="button"
          onClick={() => pickUploadSingle('casillas', (url) => setPap((p) => ({ ...p, casillas_dte_img: url })))}
          disabled={saving}
        >
          <ImagePlus size={16} />
          Cargar imagen
        </button>

        {pap.casillas_dte_img ? (
          <img src={pap.casillas_dte_img} alt="casillas" style={{ width: '100%', maxWidth: 520, borderRadius: 10 }} />
        ) : (
          <div className="text-muted small">Sin imagen.</div>
        )}
      </div>
    </div>
  )

  const D4 = (
    <div className="card mb-3">
      <div className="card-header fw-semibold">4) Cargar Folios</div>
      <div className="card-body">
        <label className="form-label">Detalle de DTE + rango</label>
        <textarea
          className="form-control"
          rows={4}
          value={pap.folios_detalle || ''}
          onChange={(e) => setPap((p) => ({ ...p, folios_detalle: e.target.value }))}
          placeholder="Ej: 33 (100-300), 39 (500-900), etc."
        />
      </div>
    </div>
  )

  const D5 = (
    <div className="card mb-3">
      <div className="card-header fw-semibold">5) Prueba de emisión</div>
      <div className="card-body">
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 mb-2"
          type="button"
          onClick={() =>
            pickUploadMulti('prueba_emision', (urls) =>
              setPap((p) => ({ ...p, prueba_emision_imgs: [...(p.prueba_emision_imgs || []), ...urls] }))
            )
          }
          disabled={saving}
        >
          <ImagePlus size={16} />
          Subir 1 o + imágenes
        </button>

        {renderImgs(pap.prueba_emision_imgs, (idx) =>
          setPap((p) => ({
            ...p,
            prueba_emision_imgs: (p.prueba_emision_imgs || []).filter((_, i) => i !== idx),
          }))
        )}
      </div>
    </div>
  )

  const D6 = (
    <div className="card mb-3">
      <div className="card-header fw-semibold">6) Observaciones</div>
      <div className="card-body">
        <textarea
          className="form-control"
          rows={5}
          value={pap.observaciones || ''}
          onChange={(e) => setPap((p) => ({ ...p, observaciones: e.target.value }))}
          placeholder="Deja comentarios, pendientes, bloqueos, etc."
        />
      </div>
    </div>
  )

  const D7 = (
    <div className="card mb-3">
      <div className="card-header fw-semibold">7) Desafiliación del Sistema Gratuito de Boletas Electrónicas del SII</div>
      <div className="card-body">
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 mb-2"
          type="button"
          onClick={() => pickUploadSingle('desafiliacion', (url) => setPap((p) => ({ ...p, desafiliacion_boleta_img: url })))}
          disabled={saving}
        >
          <ImagePlus size={16} />
          Adjuntar imagen
        </button>

        {pap.desafiliacion_boleta_img ? (
          <img src={pap.desafiliacion_boleta_img} alt="desafiliación" style={{ width: '100%', maxWidth: 520, borderRadius: 10 }} />
        ) : (
          <div className="text-muted small">Sin imagen.</div>
        )}
      </div>
    </div>
  )

  const D8 = (
    <div className="card mb-3">
      <div className="card-header fw-semibold">8) Modelo de Emisión</div>
      <div className="card-body">
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 mb-2"
          type="button"
          onClick={() => pickUploadSingle('modelo_emision', (url) => setPap((p) => ({ ...p, modelo_emision_img: url })))}
          disabled={saving}
        >
          <ImagePlus size={16} />
          Adjuntar imagen
        </button>

        {pap.modelo_emision_img ? (
          <img src={pap.modelo_emision_img} alt="modelo" style={{ width: '100%', maxWidth: 520, borderRadius: 10 }} />
        ) : (
          <div className="text-muted small">Sin imagen.</div>
        )}
      </div>
    </div>
  )

  const mapD: Record<number, React.ReactNode> = { 1: D1, 2: D2, 3: D3, 4: D4, 5: D5, 6: D6, 7: D7, 8: D8 }

  // ------------------ Render ------------------
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="container-fluid py-4">
        <BackButton fallback="/sac/pap" />
        <div className="alert alert-danger mt-3">{error || 'No se encontró la empresa.'}</div>
      </div>
    )
  }

  return (
    <div className="container py-4" style={{ maxWidth: 980 }}>
      <div className="d-flex align-items-center gap-3 mb-3">
        <BackButton fallback="/sac/pap" />
        <div>
          <h4 className="mb-1">Formulario PAP (SAC)</h4>
          <p className="text-muted small mb-0">
            Empresa <b>{empresa.empkey}</b> • {empresa.nombre ?? '—'} • {empresa.rut ?? '—'} •{' '}
            {producto === 'ENTERFAC' ? 'Enterfact' : producto === 'ANDESPOS' ? 'AndesPOS' : '—'}
          </p>
        </div>
        <div className="ms-auto">
          <span className={`badge ${badgeClass(autoEstado)}`}>{autoEstado}</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* A */}
      <div className="card mb-3">
        <div className="card-header fw-semibold d-flex align-items-center gap-2">
          <CalendarClock size={18} />
          A) Fecha (definida por Onboarding)
        </div>
        <div className="card-body">
          <input className="form-control" value={fmtDate(fechaHora)} readOnly />
          <div className="form-text">* Solo lectura (viene de OB).</div>
        </div>
      </div>

      {/* B */}
      <div className="card mb-3">
        <div className="card-header fw-semibold">B) Razón Social / RUT / Ticket HS / Tipo Integración / Tipo Certificación</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Razón Social</label>
              <input className="form-control" value={empresa.nombre ?? '—'} readOnly />
            </div>
            <div className="col-md-3">
              <label className="form-label">RUT</label>
              <input className="form-control" value={empresa.rut ?? '—'} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">Ticket HS</label>
              <input className="form-control" value={ticketHs} readOnly />
            </div>
            <div className="col-md-3">
              <label className="form-label">Tipo de Integración</label>
              <input className="form-control" value={tipoIntegracion} readOnly />
            </div>
            <div className="col-md-3">
              <label className="form-label">Tipo de Certificación</label>
              <input className="form-control" value={tipoCertificacion} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">Casilla de Recepción DTE</label>
              <input className="form-control" value={casilla || ''} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* C */}
      <div className="card mb-3">
        <div className="card-header fw-semibold">C) Documentos a solicitar folios (desde OB)</div>
        <div className="card-body">
          {documentos.length === 0 ? (
            <div className="text-muted">—</div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {documentos.map((d) => (
                <span key={d} className="badge bg-light text-dark border">
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* D */}
      <div className="card mb-3">
        <div className="card-header fw-semibold">D) Configuración aplicar al contribuyente (según producto)</div>
        <div className="card-body">
          <div className="alert alert-info mb-3">
            <b>Orden aplicado:</b> {ordenD.join(' → ')}
          </div>
          {ordenD.map((n) => (
            <div key={n}>{mapD[n]}</div>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => save()} disabled={saving}>
          <Save size={18} />
          Guardar
        </button>

        <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={abrirReprogramar} disabled={saving}>
          <AlertTriangle size={18} />
          Reprogramar
        </button>

        <button className="btn btn-success d-flex align-items-center gap-2" onClick={completar} disabled={saving}>
          <CheckCircle2 size={18} />
          Marcar Completado
        </button>
      </div>

      {/* Modal Reprogramar */}
      {showReprog && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,.45)', zIndex: 9999 }}
          onClick={() => setShowReprog(false)}
        >
          <div
            className="card position-absolute top-50 start-50 translate-middle"
            style={{ width: 'min(720px, 92vw)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header fw-semibold">Reprogramar PAP</div>
            <div className="card-body">
              <label className="form-label">¿Por qué se reprograma el PAP?</label>
              <textarea
                className="form-control"
                rows={4}
                value={reprogMotivo}
                onChange={(e) => setReprogMotivo(e.target.value)}
                placeholder="Describe el acontecimiento + contexto"
              />

              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                  onClick={subirImgsReprog}
                  disabled={reprogUploading}
                >
                  <ImagePlus size={16} />
                  Adjuntar imágenes
                </button>
                <div className="mt-2">
                  {renderImgs(reprogImgs, (idx) => setReprogImgs((p) => p.filter((_, i) => i !== idx)))}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-outline-secondary" onClick={() => setShowReprog(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={confirmarReprogramacion} disabled={saving}>
                  Confirmar reprogramación
                </button>
              </div>

              <div className="form-text mt-2">* Queda registrado para que Admin SAC coordine nueva fecha.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PapForm