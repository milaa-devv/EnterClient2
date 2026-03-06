import React, { useEffect, useMemo, useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Package, Check, Star } from 'lucide-react'
import type { InformacionPlan } from '@/types/empresa'

/**
 * ProductoId:
 * - TAX  = Enterfact
 * - POS  = AndesPOS
 * - POS_BOX = AndesPOS EnterBOX (misma familia POS, pero forzamos BOX)
 * - LCE  = Libros contables electrónicos
 *
 * Fuente de códigos/ayudas: HTML “Facturación códigos Enternet…”
 */

type ProductoPrefix = 'TAX' | 'POS' | 'LCE'
type ProductoId = 'TAX' | 'POS' | 'POS_BOX' | 'LCE'

type PlanKey = 'Bus' | 'Cor' | 'SUp' | 'Cad' | 'Cus' | 'Fam' | 'Neg' | 'LCE'

type ItemKey =
  | 'Base'
  | 'CLD'
  | 'CesAd'
  | 'DocAd'
  | 'Off'
  | 'RutAd'
  | 'UsrAd'
  | 'otro'
  | 'Admin'
  | 'Cons'
  | 'AdmAd'
  | 'BOX'
  | 'BodAd'
  | 'CajAd'
  | 'LocalAd'
  | 'SopEx'

type AddonKey = Exclude<ItemKey, 'Base'>

type CodeDef = {
  code: string
  prefix: ProductoPrefix
  planKey: PlanKey
  itemKey: ItemKey
  title: string
  help: string[]
}

type PlanDef = {
  plan_key: PlanKey
  nombre: string
  descripcion: string
  caracteristicas: string[]
  popular?: boolean
}

type AddonSelection = {
  key: AddonKey
  titulo: string
  cod: string
  legible: string
  qty?: number
  options?: string[]
  detalle?: string
}

type Selection = {
  plan_key?: PlanKey
  plan_nombre?: string
  // cod & legible base
  cod_base?: string
  legible_base?: string
  detalle_base?: string
  // addons
  addons?: AddonSelection[]
  cod_addons?: string[]
  // subtotal “sin plata”: conteo de códigos (Base + Addons activos)
  subtotal?: number
}

// Estado consolidado del paso (multi-producto)
type MultiInfo = {
  productos: Record<ProductoId, boolean>
  selections: Partial<Record<ProductoId, Selection>>
  // total “sin plata”: total de códigos seleccionados
  total: number
} & Partial<InformacionPlan>

// =====================
// Catálogo (desde HTML)
// =====================

const CODE_DEFS: CodeDef[] = [
  {
    code: 'LCELCEBase',
    prefix: 'LCE' as ProductoPrefix,
    planKey: 'LCE' as PlanKey,
    itemKey: 'Base' as ItemKey,
    title: 'Plan base (Libros contables electrónicos)',
    help: [
      'Ej: Libros Contables Electronicos 2, 3, 4',
      'Que el usuario indique la cantidad de libros contables que se requiere de forma manual'
    ]
  },
  {
    code: 'POSCadAdmAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cad' as PlanKey,
    itemKey: 'AdmAd' as ItemKey,
    title: 'Usuarios administrador',
    help: [
      'Temas que aparecen en las descripciones: Usuarios Admin (2)',
      'Ej: Usuario Administrador Facturación',
      'Indicar la cantidad de usuarios administradores'
    ]
  },
  {
    code: 'POSCadBOX',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cad' as PlanKey,
    itemKey: 'BOX' as ItemKey,
    title: 'Mensualidad punto SemiOffline (EnterBOX)',
    help: [
      'Enterbox Modo Activo (Contingencia)',
      'Mantención mensual punto semioffline',
      'Servicio Semi Offline y servidor',
      'Servicio semi-offline EnterBOX',
      'Esto podria desplegarse como opciones y poder elegir entre 1 o más'
    ]
  },
  {
    code: 'POSCadBase',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cad' as PlanKey,
    itemKey: 'Base' as ItemKey,
    title: 'Plan base (Punto de venta)',
    help: [
      'Temas que aparecen en las descripciones: Cajas (30), Locales (22), Inventario (15), Licencia (7), Sucursales (6)',
      'Ej: Plan Andespos Cadena Multiempresa 3 locales y 9 cajas',
      'Que el usuario indique cuantos locales y cajas se incorporan en la base del plan'
    ]
  },
  {
    code: 'POSCadBodAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cad' as PlanKey,
    itemKey: 'BodAd' as ItemKey,
    title: 'Ubicación Adicional',
    help: [
      'Ubicación adicional de inventario',
      'Indicar la cantidad de ubicaciones adicionales'
    ]
  },
  {
    code: 'POSCadCajAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cad' as PlanKey,
    itemKey: 'CajAd' as ItemKey,
    title: 'Caja Adicional',
    help: [
      'Caja adicional POS',
      'Indicar la cantidad de cajas adicionales'
    ]
  },
  {
    code: 'POSCadDocAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cad' as PlanKey,
    itemKey: 'DocAd' as ItemKey,
    title: 'Documentos Tributarios Adicionales',
    help: [
      'Ej: Documentos Adicionales 2.000 DTE',
      'Ej: Documentos Adicionales 10.000 DTE',
      'Que el usuario ingrese el número de documentos'
    ]
  },
  {
    code: 'POSCadLocalAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cad' as PlanKey,
    itemKey: 'LocalAd' as ItemKey,
    title: 'Local adicional',
    help: [
      'Local adicional, 1 caja',
      'Que el usuario indique cuantos locales y cajas a agregar de forma manual'
    ]
  },
  {
    code: 'POSCadSopEx',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cad' as PlanKey,
    itemKey: 'SopEx' as ItemKey,
    title: 'Soporte extendido',
    help: ['Soporte extendido']
  },
  {
    code: 'POSCadUsrAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cad' as PlanKey,
    itemKey: 'UsrAd' as ItemKey,
    title: 'Usuario adicional (facturación)',
    help: [
      'Temas que aparecen en las descripciones: Usuarios (7)',
      'Ej: Usuario Adicional Facturación',
      'Indicar la cantidad de usuarios adicionales Facturación'
    ]
  },
  {
    code: 'POSCusBase',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Cus' as PlanKey,
    itemKey: 'Base' as ItemKey,
    title: 'Plan base (Punto de venta)',
    help: [
      'Ej: Plan Andespos Custom 1 local y 1 caja',
      'Que el usuario indique cuantos locales y cajas se incorporan en la base del plan'
    ]
  },
  {
    code: 'POSFamBase',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Fam' as PlanKey,
    itemKey: 'Base' as ItemKey,
    title: 'Plan base (Punto de venta)',
    help: [
      'Ej: Plan Andespos Familiar 1 local y 1 caja',
      'Que el usuario indique cuantos locales y cajas se incorporan en la base del plan'
    ]
  },
  {
    code: 'POSFamDocAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Fam' as PlanKey,
    itemKey: 'DocAd' as ItemKey,
    title: 'Documentos Tributarios Adicionales',
    help: [
      'Ej: Documentos Adicionales 2.000 DTE',
      'Ej: Documentos Adicionales 10.000 DTE',
      'Que el usuario ingrese el número de documentos'
    ]
  },
  {
    code: 'POSNegAdmAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Neg' as PlanKey,
    itemKey: 'AdmAd' as ItemKey,
    title: 'Usuarios administrador',
    help: [
      'Ej: Usuario Administrador Facturación',
      'Indicar la cantidad de usuarios administradores'
    ]
  },
  {
    code: 'POSNegBOX',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Neg' as PlanKey,
    itemKey: 'BOX' as ItemKey,
    title: 'Mensualidad punto SemiOffline (EnterBOX)',
    help: [
      'Enterbox Modo Activo (Contingencia)',
      'Mantención mensual punto semioffline',
      'Servicio Semi Offline y servidor',
      'Servicio semi-offline EnterBOX',
      'Esto podria desplegarse como opciones y poder elegir entre 1 o más'
    ]
  },
  {
    code: 'POSNegBase',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Neg' as PlanKey,
    itemKey: 'Base' as ItemKey,
    title: 'Plan base (Punto de venta)',
    help: [
      'Ej: Plan Andespos Negocio 1 local y 1 caja',
      'Que el usuario indique cuantos locales y cajas se incorporan en la base del plan'
    ]
  },
  {
    code: 'POSNegCajAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Neg' as PlanKey,
    itemKey: 'CajAd' as ItemKey,
    title: 'Caja Adicional',
    help: [
      'Caja adicional POS',
      'Indicar la cantidad de cajas adicionales'
    ]
  },
  {
    code: 'POSNegDocAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Neg' as PlanKey,
    itemKey: 'DocAd' as ItemKey,
    title: 'Documentos Tributarios Adicionales',
    help: [
      'Ej: Documentos Adicionales 2.000 DTE',
      'Ej: Documentos Adicionales 10.000 DTE',
      'Que el usuario ingrese el número de documentos'
    ]
  },
  {
    code: 'POSNegLocalAd',
    prefix: 'POS' as ProductoPrefix,
    planKey: 'Neg' as PlanKey,
    itemKey: 'LocalAd' as ItemKey,
    title: 'Local adicional',
    help: [
      'Local adicional, 1 caja',
      'Que el usuario indique cuantos locales y cajas a agregar de forma manual'
    ]
  },
  {
    code: 'TAXBusBase',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Bus' as PlanKey,
    itemKey: 'Base' as ItemKey,
    title: 'Plan base (documentos tributarios)',
    help: [
      'Temas que aparecen en las descripciones: Documentos/DTE (92), Usuarios (62), Facturas (47), Boletas (24), Exportación (8), Guía despacho (7)',
      'Ej: Plan Facturación Electrónica 100 DTE y 3 usuarios',
      'Ej: Plan Guía Despacho Panaderia 200 DTE',
      'Ej: Plan Boletas Electrónicas 10.000 documentos (Integradas)',
      'Ej: Plan Factura Electronica Exportacion 500 documentos',
      'Que el usuario escoja el tipo de documento y la cantidad de documentos y si son integrados o no y si el plan de documentos viene con usuarios, en caso de venir con usuarios indicar la cantidad'
    ]
  },
  {
    code: 'TAXBusCLD',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Bus' as PlanKey,
    itemKey: 'CLD' as ItemKey,
    title: 'Servicios/Hosting (Agente WS, ListaGet, Semi Offline, servidor)',
    help: [
      'Ej: Servicio Semi Offline y servidor',
      'Ej: Servicio ListaGet',
      'Ej: Servicio de arriendo del servicio hosting',
      'Ej: Servicio de Arriendo / Hosting Agente WS',
      'Que el usuario escoja el servicio que mas se adecue o que indique cual requiere de forma manual'
    ]
  },
  {
    code: 'TAXBusCesAd',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Bus' as PlanKey,
    itemKey: 'CesAd' as ItemKey,
    title: 'Cesión Adicional',
    help: [
      'Ej: Cesión Adicional',
      'Indicar la cantidad de cesiones adicionales'
    ]
  },
  {
    code: 'TAXBusDocAd',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Bus' as PlanKey,
    itemKey: 'DocAd' as ItemKey,
    title: 'Documentos Tributarios Adicionales',
    help: [
      'Ej: Documentos Adicionales 1.000 DTE',
      'Ej: Documentos Adicionales 10.000 DTE',
      'Ej: Documentos Adicionales 2.000 DTE',
      'Ej: Documentos Adicionales 5.000 DTE',
      'Que el usuario ingrese el número de documentos'
    ]
  },
  {
    code: 'TAXBusOff',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Bus' as PlanKey,
    itemKey: 'Off' as ItemKey,
    title: 'Servicio Semi Offline',
    help: [
      'Mantención mensual punto semioffline',
      'Servicio Semi Offline y servidor',
      'Servicio semi-offline EnterBOX',
      'Que el usuario escoja el servicio que mas se adecue o que indique cual requiere de forma manual'
    ]
  },
  {
    code: 'TAXBusRutAd',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Bus' as PlanKey,
    itemKey: 'RutAd' as ItemKey,
    title: 'RUT Adicional (multiempresa)',
    help: [
      'RUT empresa adicional',
      'Indicar la cantidad de RUT adicionales (multiempresa)'
    ]
  },
  {
    code: 'TAXBusUsrAd',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Bus' as PlanKey,
    itemKey: 'UsrAd' as ItemKey,
    title: 'Usuario Adicional',
    help: [
      'Ej: Usuario adicional',
      'Indicar la cantidad de usuarios adicionales'
    ]
  },
  {
    code: 'TAXBusotro',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Bus' as PlanKey,
    itemKey: 'otro' as ItemKey,
    title: 'Módulo contable / Registro contable',
    help: [
      'Modulo contable',
      'Registro contable',
      'Poder seleccionar la opción más adecuada para el usuario'
    ]
  },
  {
    code: 'TAXCorAdmin',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Cor' as PlanKey,
    itemKey: 'Admin' as ItemKey,
    title: 'Servicio prorrateo por empresa',
    help: ['Servicio prorrateo por empresa']
  },
  {
    code: 'TAXCorBase',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Cor' as PlanKey,
    itemKey: 'Base' as ItemKey,
    title: 'Plan base (documentos tributarios)',
    help: [
      'Temas que aparecen en las descripciones: Documentos/DTE (70), Usuarios (39), Facturas (37), Boletas (24), Exportación (8), Soporte (5)',
      'Ej: Plan Facturacion Electronica 1.000 DTE y 2 Usuarios',
      'Ej: Plan Facturacion Electronica 1.200 Documentos y 3 Usuarios',
      'Ej: Plan Boletas Electrónicas 10.000 documentos (Integradas)',
      'Ej: Plan Factura Electronica Exportacion 500 documentos',
      'Que el usuario escoja el tipo de documento y la cantidad de documentos y si son integrados o no y si el plan de documentos viene con usuarios, en caso de venir con usuarios indicar la cantidad'
    ]
  },
  {
    code: 'TAXCorCLD',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Cor' as PlanKey,
    itemKey: 'CLD' as ItemKey,
    title: 'Servicios/Hosting (Agente WS, ListaGet, Semi Offline, servidor)',
    help: [
      'Ej: Servicio Semi Offline y servidor',
      'Ej: Servicio ListaGet',
      'Ej: Servicio de arriendo del servicio hosting',
      'Ej: Servicio de Arriendo / Hosting Agente WS',
      'Que el usuario escoja el servicio que mas se adecue o que indique cual requiere de forma manual'
    ]
  },
  {
    code: 'TAXCorCons',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Cor' as PlanKey,
    itemKey: 'Cons' as ItemKey,
    title: 'Plan consolidado (porcentaje)',
    help: [
      'Ej: Cons 10%',
      'Ej: Cons 15%',
      'Ej: Plan Consolidado 20%',
      'Dejar un campo para que el usuario indique el porcentaje'
    ]
  },
  {
    code: 'TAXCorDocAd',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Cor' as PlanKey,
    itemKey: 'DocAd' as ItemKey,
    title: 'Documentos Tributarios Adicionales',
    help: [
      'Ej: Documentos Adicionales 1.000 DTE',
      'Ej: Documentos Adicionales 10.000 DTE',
      'Ej: Documentos Adicionales 2.000 DTE',
      'Ej: Documentos Adicionales 5.000 DTE',
      'Que el usuario ingrese el número de documentos'
    ]
  },
  {
    code: 'TAXCorOff',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Cor' as PlanKey,
    itemKey: 'Off' as ItemKey,
    title: 'Servicio Semi Offline',
    help: [
      'Mantención mensual punto semioffline',
      'Servicio Semi Offline y servidor',
      'Servicio semi-offline EnterBOX',
      'Que el usuario escoja el servicio que mas se adecue o que indique cual requiere de forma manual'
    ]
  },
  {
    code: 'TAXCorRutAd',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Cor' as PlanKey,
    itemKey: 'RutAd' as ItemKey,
    title: 'RUT Adicional (multiempresa)',
    help: [
      'RUT empresa adicional',
      'Indicar la cantidad de RUT adicionales (multiempresa)'
    ]
  },
  {
    code: 'TAXCorUsrAd',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'Cor' as PlanKey,
    itemKey: 'UsrAd' as ItemKey,
    title: 'Usuario Adicional',
    help: [
      'Ej: Usuario adicional',
      'Indicar la cantidad de usuarios adicionales'
    ]
  },
  {
    code: 'TAXSUpBase',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'SUp' as PlanKey,
    itemKey: 'Base' as ItemKey,
    title: 'Plan base (documentos tributarios)',
    help: [
      'Ej: Plan Start Up 100 DTE y 1 usuario',
      'Que el usuario escoja el tipo de documento y la cantidad de documentos y si el plan viene con usuarios indicar cantidad'
    ]
  },
  {
    code: 'TAXSUpCLD',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'SUp' as PlanKey,
    itemKey: 'CLD' as ItemKey,
    title: 'Servicios/Hosting (Agente WS, ListaGet, Semi Offline, servidor)',
    help: [
      'Ej: Servicio Semi Offline y servidor',
      'Ej: Servicio ListaGet',
      'Ej: Servicio de arriendo del servicio hosting',
      'Ej: Servicio de Arriendo / Hosting Agente WS',
      'Que el usuario escoja el servicio que mas se adecue o que indique cual requiere de forma manual'
    ]
  },
  {
    code: 'TAXSUpDocAd',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'SUp' as PlanKey,
    itemKey: 'DocAd' as ItemKey,
    title: 'Documentos Tributarios Adicionales',
    help: [
      'Ej: Documentos Adicionales 1.000 DTE',
      'Ej: Documentos Adicionales 2.000 DTE',
      'Que el usuario ingrese el número de documentos'
    ]
  },
  {
    code: 'TAXSUpUsrAd',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'SUp' as PlanKey,
    itemKey: 'UsrAd' as ItemKey,
    title: 'Usuario Adicional',
    help: [
      'Ej: Usuario adicional',
      'Indicar la cantidad de usuarios adicionales'
    ]
  },
  {
    code: 'TAXSUpotro',
    prefix: 'TAX' as ProductoPrefix,
    planKey: 'SUp' as PlanKey,
    itemKey: 'otro' as ItemKey,
    title: 'Módulo contable / Registro contable',
    help: [
      'Modulo contable',
      'Registro contable',
      'Poder seleccionar la opción más adecuada para el usuario'
    ]
  }
]

const ALL_ADDON_KEYS: AddonKey[] = [
  'AdmAd',
  'Admin',
  'BOX',
  'BodAd',
  'CajAd',
  'CLD',
  'CesAd',
  'Cons',
  'DocAd',
  'LocalAd',
  'Off',
  'RutAd',
  'SopEx',
  'UsrAd',
  'otro'
]

const PRODUCTOS: Record<
  ProductoId,
  { prefix: ProductoPrefix; label: string; desc: string; plans: PlanKey[] }
> = {
  TAX: { prefix: 'TAX', label: 'Enterfact', desc: 'Facturación electrónica (TAX)', plans: ['Bus', 'Cor', 'SUp'] },
  POS: { prefix: 'POS', label: 'AndesPOS', desc: 'Punto de venta (POS)', plans: ['Cad', 'Cus', 'Fam', 'Neg'] },
  POS_BOX: {
    prefix: 'POS',
    label: 'AndesPOS EnterBOX',
    desc: 'POS + EnterBOX (semi-offline)',
    plans: ['Cad', 'Neg'] // ambos tienen BOX en el HTML
  },
  LCE: { prefix: 'LCE', label: 'Libros Contables', desc: 'Libros contables electrónicos (LCE)', plans: ['LCE'] }
}

const PLAN_LABEL: Record<PlanKey, { name: string; desc: string; popular?: boolean }> = {
  Bus: { name: 'Business', desc: 'Para pymes y operación estándar' },
  Cor: { name: 'Corporate', desc: 'Para operación corporativa / multiempresa', popular: true },
  SUp: { name: 'Start Up', desc: 'Para emprendimientos / inicio rápido' },
  Cad: { name: 'Cadena', desc: 'Para múltiples locales / cajas', popular: true },
  Cus: { name: 'Custom', desc: 'Plan a medida' },
  Fam: { name: 'Familiar', desc: 'Plan simple' },
  Neg: { name: 'Negocio', desc: 'Plan negocio' },
  LCE: { name: 'LCE', desc: 'Libros contables electrónicos' }
}

const FEATURES: Record<ProductoId, string[]> = {
  TAX: ['Emisión de documentos tributarios', 'Integración SII', 'Portal web', 'Soporte'],
  POS: ['POS ventas', 'Control de inventario', 'Locales y cajas', 'Reportes'],
  POS_BOX: ['POS ventas', 'EnterBOX semi-offline', 'Contingencia', 'Reportes'],
  LCE: ['Libros contables electrónicos', 'Configuración por cantidad de libros', 'Soporte']
}

const requiresQty = (k: AddonKey) =>
  (['AdmAd', 'BodAd', 'CajAd', 'DocAd', 'LocalAd', 'RutAd', 'UsrAd', 'CesAd'] as AddonKey[]).includes(k)

const optionModeFor = (k: AddonKey): 'single' | 'multi' | 'free' | 'none' => {
  if (k === 'BOX') return 'multi'
  if (k === 'CLD') return 'single'
  if (k === 'Off') return 'single'
  if (k === 'otro') return 'single'
  if (k === 'Cons') return 'free'
  return 'none'
}

const extractOptions = (help: string[]) =>
  help
    .map(l => l.replace(/^Ej:\s*/i, '').trim())
    .filter(l => {
      const badStarts = [
        'Temas',
        'Que el usuario',
        'Indicar',
        'Dejar',
        'Esto podria',
        'Poder seleccionar'
      ]
      if (badStarts.some(b => l.startsWith(b))) return false
      return l.length > 0
    })

const codeDefFor = (prefix: ProductoPrefix, planKey: PlanKey, itemKey: ItemKey) =>
  CODE_DEFS.find(d => d.prefix === prefix && d.planKey === planKey && d.itemKey === itemKey)

const addonsCompatibles = (prefix: ProductoPrefix, planKey: PlanKey) =>
  CODE_DEFS.filter(d => d.prefix === prefix && d.planKey === planKey && d.itemKey !== 'Base')

const legible = (producto: ProductoId, planKey: PlanKey, itemKey: ItemKey) => {
  const def = codeDefFor(PRODUCTOS[producto].prefix, planKey, itemKey)
  const planName = PLAN_LABEL[planKey]?.name ?? planKey
  return `${PRODUCTOS[producto].label} – ${planName} · ${itemKey}: ${def?.title ?? '—'}`
}

const blankAddonBools = () =>
  ALL_ADDON_KEYS.reduce((acc, k) => {
    acc[k] = false
    return acc
  }, {} as Record<AddonKey, boolean>)

const blankAddonQty = () =>
  ALL_ADDON_KEYS.reduce((acc, k) => {
    if (requiresQty(k)) acc[k] = 1
    return acc
  }, {} as Partial<Record<AddonKey, number>>)

// ==============
// Componente
// ==============
export const InformacionPlanStep: React.FC = () => {
  const { state, updateData } = useFormContext()

  // -------- Init safe (soporta persistencia si existe)
  const [info, setInfo] = useState<MultiInfo>(() => {
    const persisted = state.data.informacionPlan as any
    const isCompatible =
      persisted &&
      persisted.productos &&
      typeof persisted.productos === 'object' &&
      ('TAX' in persisted.productos || 'POS' in persisted.productos || 'LCE' in persisted.productos)

    if (!isCompatible) {
      return {
        productos: { TAX: false, POS: false, POS_BOX: false, LCE: false },
        selections: {},
        total: 0
      }
    }

    return {
      productos: {
        TAX: !!persisted.productos.TAX,
        POS: !!persisted.productos.POS,
        POS_BOX: !!persisted.productos.POS_BOX,
        LCE: !!persisted.productos.LCE
      },
      selections: persisted.selections ?? {},
      total: typeof persisted.total === 'number' ? persisted.total : 0
    }
  })

  // switches de add-ons por producto
  const [addonsSel, setAddonsSel] = useState<Record<ProductoId, Record<AddonKey, boolean>>>(() => {
    const persisted = state.data.informacionPlan as any
    const base = {
      TAX: blankAddonBools(),
      POS: blankAddonBools(),
      POS_BOX: blankAddonBools(),
      LCE: blankAddonBools()
    }
    // reconstrucción simple desde persisted.selections.addons
    if (persisted?.selections) {
      ;(Object.keys(persisted.selections) as ProductoId[]).forEach(p => {
        const s = persisted.selections[p]
        if (s?.addons?.length) {
          s.addons.forEach((a: any) => {
            if (a?.key) base[p][a.key as AddonKey] = true
          })
        }
      })
    }
    return base
  })

  // qty de add-ons (varios)
  const [addonQty, setAddonQty] = useState<Record<ProductoId, Partial<Record<AddonKey, number>>>>(() => {
    const persisted = state.data.informacionPlan as any
    const base = {
      TAX: blankAddonQty(),
      POS: blankAddonQty(),
      POS_BOX: blankAddonQty(),
      LCE: blankAddonQty()
    }
    if (persisted?.selections) {
      ;(Object.keys(persisted.selections) as ProductoId[]).forEach(p => {
        const s = persisted.selections[p]
        if (s?.addons?.length) {
          s.addons.forEach((a: any) => {
            if (a?.key && typeof a.qty === 'number') base[p][a.key as AddonKey] = a.qty
          })
        }
      })
    }
    return base
  })

  // detalle base (texto libre)
  const [baseDetail, setBaseDetail] = useState<Record<ProductoId, string>>(() => {
    const persisted = state.data.informacionPlan as any
    const base = { TAX: '', POS: '', POS_BOX: '', LCE: '' }
    if (persisted?.selections) {
      ;(Object.keys(persisted.selections) as ProductoId[]).forEach(p => {
        base[p] = persisted.selections[p]?.detalle_base ?? ''
      })
    }
    return base
  })

  // opciones seleccionadas (para CLD/OFF/BOX/otro, etc.)
  const [addonOptions, setAddonOptions] = useState<Record<ProductoId, Partial<Record<AddonKey, string[]>>>>(() => {
    const persisted = state.data.informacionPlan as any
    const base = { TAX: {}, POS: {}, POS_BOX: {}, LCE: {} } as Record<ProductoId, Partial<Record<AddonKey, string[]>>>
    if (persisted?.selections) {
      ;(Object.keys(persisted.selections) as ProductoId[]).forEach(p => {
        const s = persisted.selections[p]
        if (s?.addons?.length) {
          s.addons.forEach((a: any) => {
            if (a?.key && Array.isArray(a.options)) base[p][a.key as AddonKey] = a.options
          })
        }
      })
    }
    return base
  })

  // detalle / observación por addon
  const [addonDetail, setAddonDetail] = useState<Record<ProductoId, Partial<Record<AddonKey, string>>>>(() => {
    const persisted = state.data.informacionPlan as any
    const base = { TAX: {}, POS: {}, POS_BOX: {}, LCE: {} } as Record<ProductoId, Partial<Record<AddonKey, string>>>
    if (persisted?.selections) {
      ;(Object.keys(persisted.selections) as ProductoId[]).forEach(p => {
        const s = persisted.selections[p]
        if (s?.addons?.length) {
          s.addons.forEach((a: any) => {
            if (a?.key && typeof a.detalle === 'string') base[p][a.key as AddonKey] = a.detalle
          })
        }
      })
    }
    return base
  })

  // Toggle de producto ON/OFF
  const toggleProducto = (p: ProductoId) => {
    const enabled = !info.productos[p]
    const nextProductos: Record<ProductoId, boolean> = { ...info.productos, [p]: enabled }
    const nextSelections: Partial<Record<ProductoId, Selection>> = { ...info.selections }
    const nextAddonsSel: Record<ProductoId, Record<AddonKey, boolean>> = { ...addonsSel }

    // POS y POS_BOX son “variantes”: si prendes una, apagamos la otra para evitar duplicidad
    if (enabled && p === 'POS') {
      nextProductos.POS_BOX = false
      delete nextSelections.POS_BOX
      nextAddonsSel.POS_BOX = blankAddonBools()
      setAddonQty(prev => ({ ...prev, POS_BOX: blankAddonQty() }))
      setBaseDetail(prev => ({ ...prev, POS_BOX: '' }))
      setAddonOptions(prev => ({ ...prev, POS_BOX: {} }))
      setAddonDetail(prev => ({ ...prev, POS_BOX: {} }))
    }
    if (enabled && p === 'POS_BOX') {
      nextProductos.POS = false
      delete nextSelections.POS
      nextAddonsSel.POS = blankAddonBools()
      setAddonQty(prev => ({ ...prev, POS: blankAddonQty() }))
      setBaseDetail(prev => ({ ...prev, POS: '' }))
      setAddonOptions(prev => ({ ...prev, POS: {} }))
      setAddonDetail(prev => ({ ...prev, POS: {} }))
    }

    if (!enabled) {
      delete nextSelections[p]
      nextAddonsSel[p] = blankAddonBools()
      setAddonQty(prev => ({ ...prev, [p]: blankAddonQty() }))
      setBaseDetail(prev => ({ ...prev, [p]: '' }))
      setAddonOptions(prev => ({ ...prev, [p]: {} }))
      setAddonDetail(prev => ({ ...prev, [p]: {} }))
    }

    const next: MultiInfo = { ...info, productos: nextProductos, selections: nextSelections }
    setAddonsSel(nextAddonsSel)
    setInfo(next)
    updateData({ informacionPlan: next })
  }

  // Elegir plan base para un producto
  const choosePlan = (producto: ProductoId, planKey: PlanKey) => {
    const prefix = PRODUCTOS[producto].prefix
    const baseDef = codeDefFor(prefix, planKey, 'Base')
    const codBase = baseDef?.code ?? `${prefix}${planKey}Base`
    const legibleBase = legible(producto, planKey, 'Base')

    const sel: Selection = {
      plan_key: planKey,
      plan_nombre: PLAN_LABEL[planKey]?.name ?? planKey,
      cod_base: codBase,
      legible_base: legibleBase,
      detalle_base: baseDetail[producto] ?? '',
      addons: [],
      cod_addons: [],
      subtotal: 1
    }

    const nextSelections: Partial<Record<ProductoId, Selection>> = { ...info.selections, [producto]: sel }

    // reset add-ons / qty / options / detail del producto al cambiar plan
    setAddonsSel(prev => {
      const next = { ...prev, [producto]: blankAddonBools() }
      // Si es EnterBOX, forzamos BOX = true (y luego lo bloqueamos en UI)
      if (producto === 'POS_BOX') next[producto].BOX = true
      return next
    })
    setAddonQty(prev => ({ ...prev, [producto]: blankAddonQty() }))
    setAddonOptions(prev => ({ ...prev, [producto]: {} }))
    setAddonDetail(prev => ({ ...prev, [producto]: {} }))
    setBaseDetail(prev => ({ ...prev, [producto]: '' }))

    const next: MultiInfo = { ...info, selections: nextSelections }
    setInfo(next)
    updateData({ informacionPlan: next })
  }

  // Sincroniza selections + subtotal/total al cambiar add-ons o inputs
  useEffect(() => {
    const nextSelections: Partial<Record<ProductoId, Selection>> = { ...info.selections }

    ;(Object.keys(nextSelections) as ProductoId[]).forEach((producto: ProductoId) => {
      const sel = nextSelections[producto]
      if (!sel?.plan_key) return

      const prefix = PRODUCTOS[producto].prefix
      const planKey = sel.plan_key
      const compatDefs = addonsCompatibles(prefix, planKey)

      // Forzar BOX activo en POS_BOX (por si alguien lo intentó apagar vía estado)
      if (producto === 'POS_BOX' && addonsSel[producto]?.BOX === false) {
        setAddonsSel(prev => ({ ...prev, [producto]: { ...prev[producto], BOX: true } }))
      }

      const activos = compatDefs.filter(d => addonsSel[producto]?.[d.itemKey as AddonKey])

      const addonsData: AddonSelection[] = activos.map(d => {
        const key = d.itemKey as AddonKey
        const qty = requiresQty(key) ? Math.max(1, addonQty[producto]?.[key] ?? 1) : undefined
        const options = addonOptions[producto]?.[key] ?? []
        const detalle = addonDetail[producto]?.[key] ?? ''

        return {
          key,
          titulo: `${key} — ${d.title}`,
          cod: d.code,
          legible: legible(producto, planKey, d.itemKey),
          qty,
          options,
          detalle
        }
      })

      const codAddons = addonsData.map(a => a.cod)
      const subtotal = 1 + addonsData.length

      nextSelections[producto] = {
        ...sel,
        detalle_base: baseDetail[producto] ?? '',
        addons: addonsData,
        cod_addons: codAddons,
        subtotal
      }
    })

    const total = (Object.values(nextSelections) as Selection[]).reduce((acc, s) => acc + (s?.subtotal ?? 0), 0)
    const nextInfo: MultiInfo = { ...info, selections: nextSelections, total }
    setInfo(nextInfo)
    updateData({ informacionPlan: nextInfo })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addonsSel, addonQty, addonOptions, addonDetail, baseDetail])

  const selectedProducts = useMemo(
    () => (Object.keys(info.productos) as ProductoId[]).filter(p => info.productos[p]),
    [info.productos]
  )

  // =========================
  // Render
  // =========================
  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Información del Plan</h4>
        <p className="text-muted">
          Selecciona producto(s), luego plan, y después servicios adicionales. <strong>Sin precios</strong>: aquí guardamos
          el <strong>desglose por códigos</strong>.
        </p>
      </div>

      {/* 1) Selección de productos (multi) */}
      <div className="mb-5">
        <h5 className="font-primary fw-semibold mb-3">1. Seleccionar Producto(s)</h5>
        <div className="row g-3">
          {(Object.keys(PRODUCTOS) as ProductoId[]).map((p: ProductoId) => {
            const enabled = info.productos[p]
            return (
              <div key={p} className="col-md-6">
                <div
                  className={`card h-100 cursor-pointer transition-all ${
                    enabled ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                  }`}
                  onClick={() => toggleProducto(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body p-4">
                    <div className="text-center mb-3">
                      <Package size={40} className={`mb-2 ${enabled ? 'text-primary' : 'text-muted'}`} />
                      <h5 className="card-title font-primary fw-semibold">
                        {PRODUCTOS[p].label}{' '}
                        <span className="text-muted small">({PRODUCTOS[p].prefix})</span>
                      </h5>
                      <p className="card-text text-muted small mb-3">{PRODUCTOS[p].desc}</p>
                    </div>

                    <div className="border-top pt-3">
                      <h6 className="small fw-semibold mb-2">Características:</h6>
                      <ul className="small text-muted mb-0">
                        {FEATURES[p].slice(0, 4).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    {enabled && (
                      <div className="mt-3 text-center">
                        <span className="badge bg-primary">
                          <Check size={12} className="me-1" /> Seleccionado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nota anti-confusión */}
        {!!info.productos.POS && (
          <div className="alert alert-light small mt-3 mb-0">
            Tip: <strong>AndesPOS</strong> y <strong>AndesPOS EnterBOX</strong> son variantes. Si eliges una, la otra se
            apaga sola para evitar duplicidad.
          </div>
        )}
      </div>

      {/* 2) Plan + 3) Add-ons por cada producto seleccionado */}
      {selectedProducts.map((p: ProductoId) => {
        const sel = info.selections[p]
        const plans = PRODUCTOS[p].plans

        return (
          <div key={p} className="mb-5">
            <h5 className="font-primary fw-semibold mb-3">
              2. Seleccionar Plan – {PRODUCTOS[p].label}{' '}
              <span className="text-muted">({PRODUCTOS[p].prefix})</span>
            </h5>

            <div className="row g-3 mb-4">
              {plans.map(planKey => {
                const meta = PLAN_LABEL[planKey]
                const isSelected = sel?.plan_key === planKey
                return (
                  <div key={`${p}-${planKey}`} className="col-lg-4">
                    <div
                      className={`card h-100 cursor-pointer transition-all position-relative ${
                        isSelected ? 'border-success bg-success bg-opacity-10' : 'border-light'
                      }`}
                      onClick={() => choosePlan(p, planKey)}
                      style={{ cursor: 'pointer' }}
                    >
                      {meta?.popular && (
                        <div className="position-absolute top-0 start-50 translate-middle">
                          <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                            <Star size={12} /> Popular
                          </span>
                        </div>
                      )}

                      <div className="card-body p-4 text-center">
                        <h5 className="card-title font-primary fw-semibold mb-2">{meta?.name ?? planKey}</h5>
                        <p className="small text-muted mb-3">{meta?.desc ?? '—'}</p>

                        <div className="border-top pt-3">
                          <h6 className="small fw-semibold mb-2">Incluye (base):</h6>
                          <div className="small text-muted">
                            {(() => {
                              const def = codeDefFor(PRODUCTOS[p].prefix, planKey, 'Base')
                              return def ? (
                                <>
                                  <div className="fw-semibold">{def.title}</div>
                                  <div className="text-muted">COD base: {def.code}</div>
                                </>
                              ) : (
                                <>COD base: {PRODUCTOS[p].prefix + planKey + 'Base'}</>
                              )
                            })()}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-3">
                            <span className="badge bg-success">
                              <Check size={12} className="me-1" /> Plan Seleccionado
                            </span>
                            {sel?.cod_base && <div className="small text-muted mt-1">COD base: {sel.cod_base}</div>}
                            {sel?.legible_base && <div className="small text-muted">{sel.legible_base}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Base detail (texto libre) */}
            {sel?.plan_key ? (
              <div className="card border-light mb-4">
                <div className="card-body">
                  <div className="fw-semibold mb-2">Detalle del Plan Base (opcional)</div>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ej: “Plan Facturación Electrónica 100 DTE y 3 usuarios” / “3 locales y 9 cajas” / “LCE 2,3,4”…"
                    value={baseDetail[p] ?? ''}
                    onChange={e => setBaseDetail(prev => ({ ...prev, [p]: e.target.value }))}
                  />
                  {(() => {
                    const def = sel.plan_key ? codeDefFor(PRODUCTOS[p].prefix, sel.plan_key, 'Base') : undefined
                    if (!def?.help?.length) return null
                    return (
                      <div className="mt-2 small text-muted">
                        <div className="fw-semibold">Ayuda (según catálogo):</div>
                        <ul className="mb-0">
                          {def.help.slice(0, 6).map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })()}
                </div>
              </div>
            ) : null}

            {/* 3) Add-ons */}
            {sel?.plan_key ? (
              <>
                <h6 className="font-primary fw-semibold mb-3">
                  3. Agregar Servicios – {PRODUCTOS[p].label}{' '}
                  <span className="text-muted">({sel.plan_key})</span>
                </h6>

                {(() => {
                  const prefix = PRODUCTOS[p].prefix
                  const compat = addonsCompatibles(prefix, sel.plan_key as PlanKey)

                  if (!compat.length) {
                    return <div className="alert alert-light small">No hay add-ons compatibles para este plan.</div>
                  }

                  return (
                    <div className="row g-3">
                      {compat.map(def => {
                        const key = def.itemKey as AddonKey
                        const checked = addonsSel[p]?.[key] ?? false
                        const mode = optionModeFor(key)
                        const options = extractOptions(def.help ?? [])
                        const selectedOpts = addonOptions[p]?.[key] ?? []
                        const qty = addonQty[p]?.[key] ?? 1
                        const isForcedBox = p === 'POS_BOX' && key === 'BOX'

                        return (
                          <div key={`${p}-${def.code}`} className="col-md-6">
                            <div
                              className={`card h-100 ${
                                checked ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                              }`}
                            >
                              <div className="card-body">
                                <div className="d-flex align-items-start justify-content-between gap-3">
                                  <div className="flex-grow-1">
                                    <div className="fw-semibold">{key} — {def.title}</div>
                                    <div className="small text-muted">{legible(p, sel.plan_key as PlanKey, def.itemKey)}</div>
                                    <div className="small text-muted">COD: <span className="fw-semibold">{def.code}</span></div>
                                  </div>

                                  <div className="text-end">
                                    <div className="form-check form-switch mt-1">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={isForcedBox ? true : checked}
                                        disabled={isForcedBox}
                                        onChange={() => {
                                          if (isForcedBox) return
                                          setAddonsSel(prev => ({
                                            ...prev,
                                            [p]: { ...prev[p], [key]: !prev[p][key] }
                                          }))
                                        }}
                                      />
                                    </div>
                                    {isForcedBox && (
                                      <div className="badge bg-secondary small mt-1">Obligatorio (EnterBOX)</div>
                                    )}
                                  </div>
                                </div>

                                {/* Cantidad */}
                                {checked && requiresQty(key) && (
                                  <div className="mt-3 d-flex align-items-center gap-2">
                                    <label className="small text-muted mb-0">Cantidad:</label>
                                    <input
                                      type="number"
                                      min={1}
                                      step={1}
                                      value={qty}
                                      onChange={e => {
                                        const val = Math.max(1, Number(e.target.value) || 1)
                                        setAddonQty(prev => ({
                                          ...prev,
                                          [p]: { ...prev[p], [key]: val }
                                        }))
                                      }}
                                      className="form-control form-control-sm"
                                      style={{ width: 110 }}
                                    />
                                  </div>
                                )}

                                {/* Opciones seleccionables */}
                                {checked && mode !== 'none' && (
                                  <div className="mt-3">
                                    {mode === 'free' ? (
                                      <div className="d-flex align-items-center gap-2">
                                        <label className="small text-muted mb-0">Porcentaje:</label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          placeholder="Ej: 10% / 15% / 20%"
                                          value={addonDetail[p]?.[key] ?? ''}
                                          onChange={e =>
                                            setAddonDetail(prev => ({
                                              ...prev,
                                              [p]: { ...prev[p], [key]: e.target.value }
                                            }))
                                          }
                                          style={{ width: 160 }}
                                        />
                                      </div>
                                    ) : mode === 'single' ? (
                                      <div className="d-flex align-items-center gap-2">
                                        <label className="small text-muted mb-0">Opción:</label>
                                        <select
                                          className="form-select form-select-sm"
                                          value={selectedOpts[0] ?? ''}
                                          onChange={e => {
                                            const val = e.target.value
                                            setAddonOptions(prev => ({
                                              ...prev,
                                              [p]: { ...prev[p], [key]: val ? [val] : [] }
                                            }))
                                          }}
                                        >
                                          <option value="">— Seleccionar —</option>
                                          {options.map(opt => (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="small text-muted mb-2">Opciones (puedes elegir 1 o más):</div>
                                        <div className="d-flex flex-column gap-1">
                                          {options.map(opt => {
                                            const isOn = selectedOpts.includes(opt)
                                            return (
                                              <label key={opt} className="small d-flex align-items-center gap-2">
                                                <input
                                                  type="checkbox"
                                                  checked={isOn}
                                                  onChange={() => {
                                                    const next = isOn
                                                      ? selectedOpts.filter(x => x !== opt)
                                                      : [...selectedOpts, opt]
                                                    setAddonOptions(prev => ({
                                                      ...prev,
                                                      [p]: { ...prev[p], [key]: next }
                                                    }))
                                                  }}
                                                />
                                                {opt}
                                              </label>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Observación libre (opcional para cualquier addon) */}
                                {checked && optionModeFor(key) !== 'free' && (
                                  <div className="mt-3">
                                    <label className="small text-muted mb-1">Observación (opcional):</label>
                                    <textarea
                                      className="form-control form-control-sm"
                                      rows={2}
                                      placeholder="Ej: contexto, restricciones, notas internas…"
                                      value={addonDetail[p]?.[key] ?? ''}
                                      onChange={e =>
                                        setAddonDetail(prev => ({
                                          ...prev,
                                          [p]: { ...prev[p], [key]: e.target.value }
                                        }))
                                      }
                                    />
                                  </div>
                                )}

                                {/* Ayuda del catálogo */}
                                {!!def.help?.length && (
                                  <div className="mt-3 small text-muted">
                                    <div className="fw-semibold">Ayuda (según catálogo):</div>
                                    <ul className="mb-0">
                                      {def.help.slice(0, 6).map((h, i) => (
                                        <li key={i}>{h}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </>
            ) : (
              <div className="alert alert-light small">Selecciona un plan para ver los servicios adicionales.</div>
            )}
          </div>
        )
      })}

      {/* Resumen Consolidado */}
      {!!selectedProducts.length && (
        <div className="card bg-light">
          <div className="card-body">
            <h6 className="card-title font-primary fw-semibold mb-3">Resumen de Selección (por códigos)</h6>

            {selectedProducts.map((p: ProductoId) => {
              const sel = info.selections[p]
              return (
                <div key={`res-${p}`} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">
                      {PRODUCTOS[p].label} <span className="text-muted small">({PRODUCTOS[p].prefix})</span>
                    </div>
                    <div className="small text-muted">
                      {sel?.subtotal ? `${sel.subtotal} código(s)` : '—'}
                    </div>
                  </div>

                  {sel?.plan_key ? (
                    <div className="small mt-1">
                      <div>
                        <span className="text-muted">Plan:</span>{' '}
                        {PLAN_LABEL[sel.plan_key]?.name ?? sel.plan_key}{' '}
                        {sel.cod_base && <span className="text-muted">· {sel.cod_base}</span>}
                      </div>
                      {sel.legible_base && <div className="text-muted small">{sel.legible_base}</div>}
                      {sel.detalle_base && (
                        <div className="small">
                          <span className="text-muted">Detalle base:</span> {sel.detalle_base}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="small text-muted">Sin plan seleccionado</div>
                  )}

                  {!!sel?.addons?.length && (
                    <ul className="small mb-0 mt-2">
                      {sel.addons!.map(a => (
                        <li key={`${p}-${a.key}`}>
                          <div>
                            <span className="fw-semibold">{a.key}</span> · <span className="text-muted">{a.cod}</span>
                          </div>
                          <div className="text-muted">{a.titulo}</div>
                          {typeof a.qty === 'number' && (
                            <div className="text-muted">Cantidad: {a.qty}</div>
                          )}
                          {!!a.options?.length && (
                            <div className="text-muted">Opciones: {a.options.join(' · ')}</div>
                          )}
                          {!!a.detalle && (
                            <div className="text-muted">Obs: {a.detalle}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <hr className="my-2" />
                </div>
              )
            })}

            <div className="d-flex justify-content-end">
              <div>
                <div className="small text-muted text-end">Total de códigos seleccionados</div>
                <div className="fw-semibold text-success h5 mb-0">{info.total}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info importante */}
      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">Información Importante</h6>
        <ul className="mb-0 small">
          <li>Puedes seleccionar más de un producto (TAX / POS / LCE).</li>
          <li>Para cada producto: primero Plan Base (Base) y luego add-ons compatibles.</li>
          <li>Este step guarda <strong>códigos</strong>, <strong>cantidades</strong>, <strong>opciones</strong> y notas.</li>
          <li>En caso de no existir algún plan por favor contactar con Administrador.</li>
        </ul>
      </div>
    </div>
  )
}