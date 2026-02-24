import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BackButton } from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { AlertTriangle } from 'lucide-react'

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

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-CL')
  } catch {
    return String(iso)
  }
}

const Img: React.FC<{ url?: string | null; title: string }> = ({ url, title }) => {
  if (!url) return <div className="text-muted small">Sin imagen.</div>
  return (
    <div className="d-flex flex-column gap-2">
      <img src={url} alt={title} style={{ width: '100%', maxWidth: 520, borderRadius: 10 }} />
      <a href={url} target="_blank" rel="noreferrer" className="small">
        Abrir imagen
      </a>
    </div>
  )
}

const SacEmpresaDetalle: React.FC = () => {
  const { empkey: empkeyParam } = useParams()
  const empkey = Number(empkeyParam)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [empresa, setEmpresa] = useState<any>(null)
  const [onboarding, setOnboarding] = useState<any>(null)
  const [papRow, setPapRow] = useState<any>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!empkeyParam || Number.isNaN(empkey)) throw new Error('Empkey inválido.')

        const { data: eData, error: eErr } = await supabase
          .from('empresa')
          .select('empkey,rut,nombre,producto,estado,paso_produccion_at,paso_produccion_por_rut,updated_at')
          .eq('empkey', empkey)
          .single()
        if (eErr) throw eErr
        setEmpresa(eData)

        const { data: obData, error: obErr } = await supabase
          .from('empresa_onboarding')
          .select('*')
          .eq('empkey', empkey)
          .maybeSingle()
        if (obErr) throw obErr
        setOnboarding(obData)

        const { data: pData, error: pErr } = await supabase
          .from('pap_sac')
          .select('empkey,estado,fecha_hora,data,updated_at')
          .eq('empkey', empkey)
          .maybeSingle()
        if (pErr) throw pErr
        setPapRow(pData)
      } catch (e: any) {
        setError(e?.message ?? 'Error cargando detalle.')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [empkey, empkeyParam])

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
        <BackButton fallback="/sac/mis-empresas" />
        <div className="alert alert-danger mt-3">{error || 'No se encontró la empresa.'}</div>
      </div>
    )
  }

  const pap: PapData = (papRow?.data as PapData) || {}

  return (
    <div className="container py-4" style={{ maxWidth: 980 }}>
      <div className="d-flex align-items-center gap-3 mb-3">
        <BackButton fallback="/sac/mis-empresas" />
        <div>
          <h4 className="mb-1">Detalle empresa</h4>
          <p className="text-muted small mb-0">
            <b>{empresa.empkey}</b> • {empresa.nombre ?? '—'} • {empresa.rut ?? '—'}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <div className="card mb-3">
        <div className="card-header fw-semibold">Resumen</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3"><b>Producto:</b> {empresa.producto ?? '—'}</div>
            <div className="col-md-3"><b>Estado:</b> {empresa.estado ?? '—'}</div>
            <div className="col-md-3"><b>Pasó a prod:</b> {fmtDate(empresa.paso_produccion_at)}</div>
            <div className="col-md-3"><b>Actualizado:</b> {fmtDate(empresa.updated_at)}</div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header fw-semibold">Onboarding (si existe)</div>
        <div className="card-body">
          {!onboarding ? (
            <div className="text-muted">Sin registro de onboarding.</div>
          ) : (
            <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(onboarding, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header fw-semibold">PAP</div>
        <div className="card-body">
          {!papRow ? (
            <div className="text-muted">Sin PAP guardado.</div>
          ) : (
            <>
              <div className="row g-3 mb-3">
                <div className="col-md-3"><b>Estado PAP:</b> {papRow.estado ?? '—'}</div>
                <div className="col-md-4"><b>Fecha/Hora PAP:</b> {fmtDate(papRow.fecha_hora)}</div>
                <div className="col-md-5"><b>Última actualización PAP:</b> {fmtDate(papRow.updated_at)}</div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header fw-semibold">Declaración</div>
                    <div className="card-body"><Img title="declaración" url={pap.declaracion_cumplimiento_img} /></div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header fw-semibold">Sender</div>
                    <div className="card-body"><Img title="sender" url={pap.sender_img} /></div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header fw-semibold">Casillas DTE</div>
                    <div className="card-body"><Img title="casillas" url={pap.casillas_dte_img} /></div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header fw-semibold">Modelo de emisión</div>
                    <div className="card-body"><Img title="modelo" url={pap.modelo_emision_img} /></div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header fw-semibold">Desafiliación boletas</div>
                    <div className="card-body"><Img title="desafiliación" url={pap.desafiliacion_boleta_img} /></div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header fw-semibold">Folios (detalle)</div>
                    <div className="card-body">
                      <div className="small" style={{ whiteSpace: 'pre-wrap' }}>
                        {pap.folios_detalle || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card">
                    <div className="card-header fw-semibold">Observaciones</div>
                    <div className="card-body">
                      <div className="small" style={{ whiteSpace: 'pre-wrap' }}>
                        {pap.observaciones || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card">
                    <div className="card-header fw-semibold">Prueba de emisión</div>
                    <div className="card-body">
                      {!pap.prueba_emision_imgs?.length ? (
                        <div className="text-muted small">Sin imágenes.</div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {pap.prueba_emision_imgs.map((u, i) => (
                            <a key={u + i} href={u} target="_blank" rel="noreferrer">
                              <img
                                src={u}
                                alt="prueba"
                                style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }}
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card">
                    <div className="card-header fw-semibold">Reprogramaciones</div>
                    <div className="card-body">
                      {!pap.reprogramaciones?.length ? (
                        <div className="text-muted small">Sin reprogramaciones.</div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {pap.reprogramaciones.map((r, idx) => (
                            <div key={idx} className="border rounded p-3">
                              <div className="small"><b>Fecha:</b> {fmtDate(r.created_at)}</div>
                              <div className="small" style={{ whiteSpace: 'pre-wrap' }}>
                                <b>Motivo:</b> {r.motivo}
                              </div>
                              {!!r.imagenes?.length && (
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                  {r.imagenes.map((u, i) => (
                                    <a key={u + i} href={u} target="_blank" rel="noreferrer">
                                      <img
                                        src={u}
                                        alt="reprog"
                                        style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }}
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SacEmpresaDetalle