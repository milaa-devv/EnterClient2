import { useMemo } from 'react'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { getEstadoOnb, isEnSACoCompletada } from '@/lib/onboardingProgress'

/**
 * Hook para obtener estadísticas de Onboarding
 * Usado principalmente para badges en el sidebar
 */
export const useOnboardingStats = () => {
  const { empresas } = useEmpresaSearch()
  
  const stats = useMemo(() => {
    if (!empresas || empresas.length === 0) {
      return {
        nuevasSolicitudes: 0,
        enProceso: 0,
        completadas: 0,
        enviadasSAC: 0,
      }
    }
    
    let nuevasSolicitudes = 0
    let enProceso = 0
    let completadas = 0
    let enviadasSAC = 0
    
    empresas.forEach((e: any) => {
      const estado = getEstadoOnb(e).toLowerCase()
      const enviada = isEnSACoCompletada(e)
      
      if (enviada) {
        enviadasSAC++
      } else if (estado === 'completado') {
        completadas++
      } else if (estado === 'en_proceso') {
        enProceso++
      } else if (estado === 'pendiente') {
        nuevasSolicitudes++
      }
    })
    
    return {
      nuevasSolicitudes: nuevasSolicitudes + enProceso, // Total de solicitudes activas
      enProceso,
      completadas,
      enviadasSAC,
    }
  }, [empresas])
  
  return stats
}