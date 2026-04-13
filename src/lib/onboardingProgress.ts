import type { EmpresaCompleta } from '@/types/empresa'

/**
 * Obtiene el estado de Onboarding de una empresa
 */
export function getEstadoOnb(e: EmpresaCompleta): string {
  const fromOnb = ((e as any).empresa_onboarding?.estado || '').toString()
  if (fromOnb) return fromOnb
  return ((e as any).estado || 'pendiente').toString()
}

/**
 * Verifica si una empresa fue enviada a SAC
 */
export function isEnSACoCompletada(e: EmpresaCompleta): boolean {
  // 1. Verificar en pap_solicitud si fue enviada (tiene enviado_a_sac_at)
  const pap: any = (e as any).pap
  if (Array.isArray(pap) && pap.length > 0) {
    return !!pap[0]?.enviado_a_sac_at
  }
  if (pap && typeof pap === 'object') {
    return !!pap.enviado_a_sac_at
  }
  
  // 2. Verificar en empresa.estado si es 'SAC'
  const estadoEmpresa = ((e as any).estado || '').toString().toUpperCase()
  if (estadoEmpresa === 'SAC') return true
  
  return false
}

/**
 * Calcula el progreso de configuración de una empresa
 * @returns Porcentaje de progreso (0, 50, 80, 100)
 */
export function getProgress(e: EmpresaCompleta): number {
  const estado = getEstadoOnb(e).toLowerCase()
  
  // Verificar si fue enviada a SAC (100%)
  if (isEnSACoCompletada(e)) return 100
  
  // Verificar si hay configuración guardada
  const tieneConfiguracion = !!(e as any).empresa_onboarding?.configuracion

  // Estados según constraint: 'pendiente', 'en_proceso', 'completado', 'cancelado'
  if (estado === 'completado') return 80
  if (estado === 'en_proceso') {
    // Si está en proceso pero no tiene configuración, es 0%
    // Si tiene configuración, es 50%
    return tieneConfiguracion ? 50 : 0
  }
  if (estado === 'pendiente') return 0
  if (estado === 'cancelado') return 0
  
  // Fallback para otros estados no definidos
  return 0
}

/**
 * Verifica si una empresa está pendiente de PAP
 */
export function isPendientePAP(e: EmpresaCompleta): boolean {
  const estado = getEstadoOnb(e).toLowerCase()
  return estado === 'completado' && !isEnSACoCompletada(e)
}

/**
 * Obtiene el label del estado para mostrar
 */
export function getEstadoLabel(e: EmpresaCompleta): string {
  if (isEnSACoCompletada(e)) return 'Enviado a SAC'
  
  const estado = getEstadoOnb(e).toLowerCase()
  const progress = getProgress(e)
  
  if (estado === 'completado') return 'Completado'
  if (estado === 'en_proceso') {
    return progress === 50 ? 'En proceso (50%)' : 'En proceso (0%)'
  }
  if (estado === 'pendiente') return 'Pendiente'
  if (estado === 'cancelado') return 'Cancelado'
  
  return estado
}