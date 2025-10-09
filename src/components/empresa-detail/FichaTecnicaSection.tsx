import React from 'react'
import { Monitor, Settings, Printer, Shield, Layout } from 'lucide-react'
import type { EmpresaCompleta } from '@/types/empresa'

interface FichaTecnicaSectionProps {
  empresa: EmpresaCompleta
}

export const FichaTecnicaSection: React.FC<FichaTecnicaSectionProps> = ({ empresa }) => {
  // Datos mock de ficha técnica
  const fichaTecnica = {
    sistemaOperativo: 'Windows Server 2019',
    versionSO: '10.0.17763',
    versionAppFull: '2024.3.1',
    modoFirma: 'Certificado Digital',
    formatoImpresion: 'Láser',
    layout: 'Estándar',
    administracionFolios: 'Automática'
  }

  const fichaItems = [
    {
      icon: Monitor,
      label: 'Sistema Operativo',
      value: fichaTecnica.sistemaOperativo,
      detail: `Versión: ${fichaTecnica.versionSO}`
    },
    {
      icon: Settings,
      label: 'Versión APP FULL',
      value: fichaTecnica.versionAppFull,
      detail: 'Última actualización'
    },
    {
      icon: Shield,
      label: 'Modo Firma',
      value: fichaTecnica.modoFirma,
      detail: 'Certificado válido'
    },
    {
      icon: Printer,
      label: 'Formato de Impresión',
      value: fichaTecnica.formatoImpresion,
      detail: 'Configuración activa'
    },
    {
      icon: Layout,
      label: 'Layout',
      value: fichaTecnica.layout,
      detail: 'Plantilla aplicada'
    },
    {
      icon: Settings,
      label: 'Administración de Folios',
      value: fichaTecnica.administracionFolios,
      detail: 'Sistema integrado'
    }
  ]

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="mb-0 font-primary fw-semibold d-flex align-items-center gap-2">
          <Monitor size={20} />
          Ficha Técnica General
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {fichaItems.map((item, index) => (
            <div key={index} className="col-md-6">
              <div className="d-flex align-items-start gap-3 p-3 border rounded">
                <div className="flex-shrink-0">
                  <item.icon size={24} className="text-primary" />
                </div>
                <div className="flex-grow-1 min-width-0">
                  <label className="form-label fw-medium small mb-1">
                    {item.label}
                  </label>
                  <div className="fw-semibold mb-1">
                    {item.value}
                  </div>
                  <div className="small text-muted">
                    {item.detail}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
