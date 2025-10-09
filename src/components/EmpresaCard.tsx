import React from 'react'
import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { formatRut } from '@/lib/utils'
import type { EmpresaCompleta } from '@/types/empresa'

// URL de tu bucket Supabase Storage
const SUPABASE_PUBLIC_URL = 'https://zaewjhhtvnoyoisitkog.supabase.co/storage/v1/object/public/logos'

const getLogoUrl = (logoPath?: string): string | undefined => {
  if (!logoPath) return undefined
  if (logoPath.startsWith('http')) return logoPath
  const fileName = logoPath.split('/').pop() || logoPath
  return `${SUPABASE_PUBLIC_URL}/${fileName}`
}

export const EmpresaCard: React.FC<{ empresa: EmpresaCompleta }> = ({ empresa }) => {
  const logoSrc = getLogoUrl(empresa.logo)
  return (
    <Link to={`/empresa/${empresa.empkey}`} className="text-decoration-none">
      <div className="empresa-card h-100">
        <div className="d-flex gap-3 mb-3">
          <div className="empresa-logo">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={empresa.nombre ?? 'Logo'}
                className="w-100 h-100 object-fit-cover rounded"
              />
            ) : (
              <Building2 size={28} className="text-muted" />
            )}
          </div>
          <div className="empresa-info flex-grow-1 min-width-0">
            <h5 className="empresa-nombre text-truncate">
              {empresa.nombre ?? 'Sin nombre'}
            </h5>
            <p className="empresa-rut mb-1">
              {empresa.rut ? formatRut(empresa.rut) : 'Sin RUT'}
            </p>
            <p className="empresa-empkey mb-0">
              Empkey: <strong>{empresa.empkey}</strong>
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
