import React, { useEffect, useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Bell, CheckCircle2, RefreshCw } from 'lucide-react'

const sb = supabase as any

type Noti = {
  id: number
  destinatario_rut: string
  titulo: string | null
  mensaje: string | null
  empkey: number | null
  leida: boolean
  created_at: string
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-CL')
  } catch {
    return String(iso)
  }
}

const SacNotificaciones: React.FC = () => {
  const { profile } = useAuth()
  const rut = profile?.rut

  const [rows, setRows] = useState<Noti[]>([])
  const [loading, setLoading] = useState(false)
  const [missingTable, setMissingTable] = useState(false)

  const fetchRows = async () => {
    if (!rut) return
    setLoading(true)
    setMissingTable(false)

    try {
      const { data, error } = await sb
        .from('sac_notificacion')
        .select('id,destinatario_rut,titulo,mensaje,empkey,leida,created_at')
        .eq('destinatario_rut', rut)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        if (String(error.message || '').toLowerCase().includes('does not exist')) {
          setMissingTable(true)
          setRows([])
          return
        }
        throw error
      }

      setRows((data as Noti[]) ?? [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    if (!rut) return
    try {
      await sb.from('sac_notificacion').update({ leida: true }).eq('destinatario_rut', rut).eq('leida', false)
      fetchRows()
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rut])

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/sac/mis-empresas" />
          <div>
            <h1 className="font-primary fw-bold mb-1">Notificaciones</h1>
            <p className="text-muted mb-0">Asignaciones y avisos SAC.</p>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={fetchRows} disabled={loading}>
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button className="btn btn-success d-flex align-items-center gap-2" onClick={markAllRead}>
            <CheckCircle2 size={16} />
            Marcar todo leído
          </button>
        </div>
      </div>

      {missingTable && (
        <div className="alert alert-warning">
          No existe la tabla <code>sac_notificacion</code>. Si quieres la notificación real (como pediste), hay que crearla.
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {rows.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Bell size={40} className="mb-2" />
              <div>No hay notificaciones por ahora.</div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {rows.map((n) => (
                <div key={n.id} className={`border rounded p-3 ${n.leida ? 'opacity-75' : ''}`}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-semibold">{n.titulo ?? 'Notificación'}</div>
                      <div className="small text-muted">{fmtDate(n.created_at)}</div>
                    </div>
                    {!n.leida && <span className="badge bg-danger">Nueva</span>}
                  </div>

                  <div className="mt-2 small" style={{ whiteSpace: 'pre-wrap' }}>
                    {n.mensaje ?? '—'}
                  </div>

                  {n.empkey && (
                    <div className="mt-2">
                      <a className="small" href={`/sac/empresa/${n.empkey}`}>
                        Ver empresa {n.empkey}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SacNotificaciones