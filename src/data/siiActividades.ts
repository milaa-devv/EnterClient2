/**
 * Actividades Económicas (SII Chile)
 *
 * Este módulo carga el JSON desde /public para NO inflar el bundle principal.
 * Ubicación del JSON:
 *   public/data/sii_actividades_economicas.json
 */

import type { ActividadEconomica } from '@/types/empresa'

export type SiiActividadRaw = {
  codigo: string
  actividad: string
  afectoIva: 'SI' | 'NO' | 'G' | string
  categoriaTributaria: string
  internetDisponible: boolean | null
  internetRaw: string
  rubroId: string | null
  rubro: string | null
  grupo: string | null
}

let cacheRaw: SiiActividadRaw[] | null = null
let inflight: Promise<SiiActividadRaw[]> | null = null

/**
 * Carga el listado oficial desde el JSON público y lo cachea en memoria.
 *
 * Nota: en Vite, todo lo que va en /public se sirve desde la raíz.
 */
export async function loadSiiActividadesRaw(): Promise<SiiActividadRaw[]> {
  if (cacheRaw) return cacheRaw
  if (inflight) return inflight

  inflight = fetch('/data/sii_actividades_economicas.json')
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`No se pudo cargar JSON de actividades (HTTP ${res.status})`)
      }
      const data = (await res.json()) as SiiActividadRaw[]
      cacheRaw = data
      return data
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export type GetActividadesParams = {
  /** Solo las que el SII marca como “Disponible Internet: SI” */
  onlyInternet?: boolean
}

const poseeIvaFromRaw = (afectoIva: string) => {
  const v = (afectoIva ?? '').trim().toUpperCase()
  return v === 'SI'
}

/**
 * Devuelve el listado en el shape que usa tu formulario actualmente.
 *
 * Importante:
 * - En el SII el código viene como string de 6 dígitos (puede tener 0 al inicio).
 * - Tu modelo interno usa number (y tu DB también), así que convertimos a Number.
 * - Para mostrar en UI: usa formatActividadCod(cod) y no pierdes el 0.
 */
export async function getActividadesEconomicas(params: GetActividadesParams = {}) {
  const raw = await loadSiiActividadesRaw()
  const filtered = params.onlyInternet ? raw.filter((a) => a.internetDisponible === true) : raw

  const mapped: ActividadEconomica[] = filtered.map((a) => ({
    cod: Number(a.codigo),
    nombre: a.actividad,
    posee_iva: poseeIvaFromRaw(a.afectoIva),
  }))

  return mapped
}

/** Formatea el código SII como 6 dígitos (p.ej. 11101 -> "011101"). */
export function formatActividadCod(cod: number) {
  return String(cod).padStart(6, '0')
}

/** Normaliza texto para búsquedas (minúsculas + sin tildes). */
export function normalizeSearchText(s: string) {
  return (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}