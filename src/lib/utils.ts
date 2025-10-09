export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const formatRut = (rut: string): string => {
  const cleanRut = rut.replace(/[^0-9kK]/g, '')
  if (cleanRut.length <= 1) return cleanRut
  
  const body = cleanRut.slice(0, -1)
  const dv = cleanRut.slice(-1)
  
  // Agregar puntos
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  return `${formattedBody}-${dv}`
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

export const getStatusColor = (estado: string): string => {
  const statusColors = {
    COMERCIAL: 'warning',
    ONBOARDING: 'info',
    SAC: 'primary',
    COMPLETADA: 'success'
  }
  
  return statusColors[estado as keyof typeof statusColors] || 'secondary'
}

export const getStatusLabel = (estado: string): string => {
  const statusLabels = {
    COMERCIAL: 'En Comercial',
    ONBOARDING: 'En Onboarding',
    SAC: 'En SAC',
    COMPLETADA: 'Completada'
  }
  
  return statusLabels[estado as keyof typeof statusLabels] || estado
}
