import React, { useEffect, useMemo, useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Package, DollarSign, Check, Star } from 'lucide-react'
import type { InformacionPlan } from '@/types/empresa'

type ProductoId = 'ENTERFAC' | 'ANDESPOS'
type PlanKey = 'Bus' | 'Cor' | 'Sup'
type AddonKey = 'DocAd' | 'UsrAd' | 'RutAd' | 'Cld' | 'Admin'

type PlanDef = {
  codigo: string
  nombre: string
  precio: number
  descripcion: string
  caracteristicas: string[]
  popular?: boolean
  plan_key: PlanKey
}

type Addon = {
  key: AddonKey
  titulo: string
  precio: number
  aplicaA: { producto: ProductoId; planes: PlanKey[] }[]
}

type Selection = {
  // plan
  plan_codigo?: string
  plan_nombre?: string
  plan_key?: PlanKey
  precio_plan?: number
  // cod & legible
  cod_base?: string
  legible_base?: string
  // addons (con cantidad y total)
  addons?: { key: AddonKey; titulo: string; precio: number; qty: number; total: number; cod: string; legible: string }[]
  cod_addons?: string[]
  // subtotal por producto
  subtotal?: number
}

// Estado consolidado del paso (multi-producto)
type MultiInfo = {
  productos: Record<ProductoId, boolean>
  selections: Partial<Record<ProductoId, Selection>>
  total: number
} & Partial<InformacionPlan>

const currencyCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

// ===== Mapeos para construir COD / etiquetas legibles
const FAMILIA: Record<ProductoId, { tipo: 'Tax' | 'POS'; label: string; desc: string }> = {
  ENTERFAC: { tipo: 'Tax', label: 'Enterfac', desc: 'Facturación electrónica completa' },
  ANDESPOS: { tipo: 'POS', label: 'AndesPOS', desc: 'Sistema punto de venta' }
}
const PLAN_MAP: Record<PlanKey, string> = { Bus: 'Pyme', Cor: 'Corporativo', Sup: 'Superior' }
const ITEM_MAP: Record<'Base' | AddonKey, string> = {
  Base: 'Plan Base',
  DocAd: 'DTE Adicional',
  UsrAd: 'Usuario Adicional',
  RutAd: 'RUT Adicional',
  Cld: 'Servicio Cloud',
  Admin: 'Administración/Prorrateo'
}
const buildCode = (producto: ProductoId, planKey: PlanKey, itemKey: 'Base' | AddonKey) =>
  `${FAMILIA[producto].tipo}${planKey}${itemKey}` // p.ej: TaxCorBase
const legible = (producto: ProductoId, planKey: PlanKey, itemKey: 'Base' | AddonKey) =>
  `${FAMILIA[producto].label} – ${PLAN_MAP[planKey]} ${ITEM_MAP[itemKey]}`

// ===== Catálogo demo (ajusta a tu fuente real cuando quieras)
const FEATURES: Record<ProductoId, string[]> = {
  ENTERFAC: ['Emisión de documentos tributarios', 'Integración con SII', 'Portal web cliente', 'Reportes tributarios', 'Soporte técnico'],
  ANDESPOS: ['Terminal punto de venta', 'Control de inventario', 'Gestión de ventas', 'Reportes comerciales', 'Integración contable']
}
const PLANES: Record<ProductoId, PlanDef[]> = {
  ENTERFAC: [
    { codigo: 'EF-BASIC', nombre: 'Plan Básico', precio: 15000, descripcion: 'Ideal para empresas pequeñas', caracteristicas: ['Hasta 100 documentos/mes', 'Portal web básico', 'Soporte por email', '1 usuario incluido'], plan_key: 'Bus' },
    { codigo: 'EF-PRO', nombre: 'Plan Pro', precio: 25000, descripcion: 'Para empresas en crecimiento', popular: true, caracteristicas: ['Hasta 500 documentos/mes', 'Portal web avanzado', 'Soporte telefónico', '5 usuarios incluidos', 'API incluida'], plan_key: 'Cor' },
    { codigo: 'EF-ENTERPRISE', nombre: 'Plan Enterprise', precio: 45000, descripcion: 'Para grandes empresas', caracteristicas: ['Documentos ilimitados', 'Portal personalizado', 'Soporte prioritario', 'Usuarios ilimitados', 'Integraciones avanzadas'], plan_key: 'Sup' }
  ],
  ANDESPOS: [
    { codigo: 'AP-STARTER', nombre: 'Plan Starter', precio: 8000, descripcion: 'Para emprendedores', caracteristicas: ['1 terminal POS', 'Inventario básico', 'Reportes estándar', 'Soporte por email'], plan_key: 'Bus' },
    { codigo: 'AP-BUSINESS', nombre: 'Plan Business', precio: 15000, descripcion: 'Para comercios establecidos', popular: true, caracteristicas: ['Hasta 3 terminales', 'Inventario avanzado', 'Reportes detallados', 'Soporte telefónico', 'Backup automático'], plan_key: 'Cor' },
    { codigo: 'AP-PREMIUM', nombre: 'Plan Premium', precio: 25000, descripcion: 'Para múltiples sucursales', caracteristicas: ['Terminales ilimitadas', 'Multi-sucursal', 'Reportes ejecutivos', 'Soporte prioritario', 'Integraciones ERP'], plan_key: 'Sup' }
  ]
}
const ADDONS: Addon[] = [
  { key: 'DocAd', titulo: 'DTE Adicional', precio: 5000, aplicaA: [{ producto: 'ENTERFAC', planes: ['Bus', 'Cor', 'Sup'] }] },
  { key: 'UsrAd', titulo: 'Usuario Adicional', precio: 3000, aplicaA: [{ producto: 'ENTERFAC', planes: ['Bus', 'Cor', 'Sup'] }, { producto: 'ANDESPOS', planes: ['Bus', 'Cor'] }] },
  { key: 'RutAd', titulo: 'RUT Adicional (multiempresa)', precio: 7000, aplicaA: [{ producto: 'ENTERFAC', planes: ['Bus', 'Cor', 'Sup'] }] },
  { key: 'Cld', titulo: 'Servicio Cloud / Hosting', precio: 12000, aplicaA: [{ producto: 'ENTERFAC', planes: ['Bus', 'Cor', 'Sup'] }, { producto: 'ANDESPOS', planes: ['Bus', 'Cor'] }] },
  { key: 'Admin', titulo: 'Administración / Prorrateo', precio: 8000, aplicaA: [{ producto: 'ENTERFAC', planes: ['Bus', 'Cor', 'Sup'] }] }
]

// ===== Componente
export const InformacionPlanStep: React.FC = () => {
  const { state, updateData } = useFormContext()

  // Estado persistente con defaults seguros
  const [info, setInfo] = useState<MultiInfo>(() => {
    const persisted = (state.data.informacionPlan as MultiInfo) ?? null
    return (
      persisted ?? {
        productos: { ENTERFAC: false, ANDESPOS: false },
        selections: {},
        total: 0
      }
    )
  })

  // switches de add-ons por producto
  const [addonsSel, setAddonsSel] = useState<Record<ProductoId, Record<AddonKey, boolean>>>({
    ENTERFAC: { DocAd: false, UsrAd: false, RutAd: false, Cld: false, Admin: false },
    ANDESPOS: { DocAd: false, UsrAd: false, RutAd: false, Cld: false, Admin: false }
  })

  // cantidades de add-ons (por ahora sólo UsrAd con cantidad)
  const [addonQty, setAddonQty] = useState<Record<ProductoId, Partial<Record<AddonKey, number>>>>({
    ENTERFAC: { UsrAd: 1 },
    ANDESPOS: { UsrAd: 1 }
  })

  // Toggle de producto ON/OFF
  const toggleProducto = (p: ProductoId) => {
    const enabled = !info.productos[p]
    const nextProductos: Record<ProductoId, boolean> = { ...info.productos, [p]: enabled }
    const nextSelections: Partial<Record<ProductoId, Selection>> = { ...info.selections }
    const nextAddonsSel: Record<ProductoId, Record<AddonKey, boolean>> = { ...addonsSel }

    if (!enabled) {
      delete nextSelections[p]
      nextAddonsSel[p] = { DocAd: false, UsrAd: false, RutAd: false, Cld: false, Admin: false }
      setAddonQty(prev => ({ ...prev, [p]: { ...prev[p], UsrAd: 1 } }))
    }

    const next: MultiInfo = { ...info, productos: nextProductos, selections: nextSelections }
    setAddonsSel(nextAddonsSel)
    setInfo(next)
    updateData({ informacionPlan: next })
  }

  // Elegir plan base para un producto
  const choosePlan = (producto: ProductoId, plan: PlanDef) => {
    const codBase = buildCode(producto, plan.plan_key, 'Base')
    const legibleBase = legible(producto, plan.plan_key, 'Base')
    const sel: Selection = {
      plan_codigo: plan.codigo,
      plan_nombre: plan.nombre,
      plan_key: plan.plan_key,
      precio_plan: plan.precio,
      cod_base: codBase,
      legible_base: legibleBase,
      addons: [],
      cod_addons: [],
      subtotal: plan.precio
    }
    const nextSelections: Partial<Record<ProductoId, Selection>> = { ...info.selections, [producto]: sel }
    // reset add-ons y qty del producto al cambiar plan
    setAddonsSel(prev => ({ ...prev, [producto]: { DocAd: false, UsrAd: false, RutAd: false, Cld: false, Admin: false } }))
    setAddonQty(prev => ({ ...prev, [producto]: { ...prev[producto], UsrAd: 1 } }))
    const next: MultiInfo = { ...info, selections: nextSelections }
    setInfo(next)
    updateData({ informacionPlan: next })
  }

  // Add-ons compatibles por producto
  const addonsCompatibles = (producto: ProductoId): Addon[] => {
    const sel = info.selections[producto]
    if (!sel?.plan_key) return []
    return ADDONS.filter(a => a.aplicaA.some(r => r.producto === producto && r.planes.includes(sel.plan_key!)))
  }

  // Sincroniza subtotales + total al cambiar switches de add-ons o cantidades
  useEffect(() => {
    const nextSelections: Partial<Record<ProductoId, Selection>> = { ...info.selections }

    ;(Object.keys(nextSelections) as ProductoId[]).forEach((producto: ProductoId) => {
      const sel = nextSelections[producto]
      if (!sel?.plan_key) return
      const compat = addonsCompatibles(producto)
      const activos = compat.filter(a => addonsSel[producto]?.[a.key])

      const addonsData = activos.map(a => {
        const qty = a.key === 'UsrAd' ? (addonQty[producto]?.UsrAd ?? 1) : 1
        const unit = a.precio
        const total = unit * qty
        return {
          key: a.key,
          titulo: a.titulo,
          precio: unit,
          qty,
          total,
          cod: buildCode(producto, sel.plan_key as PlanKey, a.key),
          legible: legible(producto, sel.plan_key as PlanKey, a.key)
        }
      })

      const codAddons = addonsData.map(a => a.cod)
      const subtotal = (sel.precio_plan ?? 0) + addonsData.reduce((acc, a) => acc + a.total, 0)
      nextSelections[producto] = { ...sel, addons: addonsData, cod_addons: codAddons, subtotal }
    })

    const total = (Object.values(nextSelections) as Selection[])
      .reduce((acc, s) => acc + (s?.subtotal ?? 0), 0)

    const nextInfo: MultiInfo = { ...info, selections: nextSelections, total }
    setInfo(nextInfo)
    updateData({ informacionPlan: nextInfo })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addonsSel, addonQty])

  // helpers render
  const selectedProducts = useMemo(
    () => (Object.keys(info.productos) as ProductoId[]).filter(p => info.productos[p]),
    [info.productos]
  )

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Información del Plan</h4>
        <p className="text-muted">Seleccione uno o varios productos y configure el plan base + servicios para cada uno.</p>
      </div>

      {/* 1) Selección de productos (multi) */}
      <div className="mb-5">
        <h5 className="font-primary fw-semibold mb-3">1. Seleccionar Producto(s)</h5>
        <div className="row g-3">
          {(Object.keys(FAMILIA) as ProductoId[]).map((p: ProductoId) => {
            const enabled = info.productos[p]
            return (
              <div key={p} className="col-md-6">
                <div
                  className={`card h-100 cursor-pointer transition-all ${enabled ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                  onClick={() => toggleProducto(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body p-4">
                    <div className="text-center mb-3">
                      <Package size={40} className={`mb-2 ${enabled ? 'text-primary' : 'text-muted'}`} />
                      <h5 className="card-title font-primary fw-semibold">{FAMILIA[p].label}</h5>
                      <p className="card-text text-muted small mb-3">{FAMILIA[p].desc}</p>
                    </div>
                    <div className="border-top pt-3">
                      <h6 className="small fw-semibold mb-2">Características:</h6>
                      <ul className="small text-muted mb-0">
                        {FEATURES[p].slice(0,3).map((f,i)=>(<li key={i}>{f}</li>))}
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
      </div>

      {/* 2) Plan + 3) Add-ons por cada producto seleccionado */}
      {selectedProducts.map((p: ProductoId) => {
        const sel = info.selections[p]
        const planesProducto = PLANES[p]
        const compat = addonsCompatibles(p)

        return (
          <div key={p} className="mb-5">
            <h5 className="font-primary fw-semibold mb-3">2. Seleccionar Plan – {FAMILIA[p].label}</h5>
            <div className="row g-3 mb-4">
              {planesProducto.map((plan: PlanDef) => (
                <div key={plan.codigo} className="col-lg-4">
                  <div
                    className={`card h-100 cursor-pointer transition-all position-relative ${sel?.plan_codigo === plan.codigo ? 'border-success bg-success bg-opacity-10' : 'border-light'}`}
                    onClick={() => choosePlan(p, plan)}
                    style={{ cursor: 'pointer' }}
                  >
                    {plan.popular && (
                      <div className="position-absolute top-0 start-50 translate-middle">
                        <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                          <Star size={12} /> Popular
                        </span>
                      </div>
                    )}
                    <div className="card-body p-4 text-center">
                      <h5 className="card-title font-primary fw-semibold mb-2">{plan.nombre}</h5>
                      <p className="small text-muted mb-3">{plan.descripcion}</p>
                      <div className="mb-4">
                        <div className="h3 text-primary d-flex align-items-center justify-content-center gap-1">
                          <DollarSign size={20} /> {currencyCLP(plan.precio).replace('$','')}
                        </div>
                        <small className="text-muted">por mes</small>
                      </div>
                      <div className="border-top pt-3">
                        <h6 className="small fw-semibold mb-2">Incluye:</h6>
                        <ul className="small text-muted list-unstyled">
                          {plan.caracteristicas.map((c,i)=>(
                            <li key={i} className="mb-1 d-flex align-items-center gap-2">
                              <Check size={12} className="text-success flex-shrink-0" /> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {sel?.plan_codigo === plan.codigo && (
                        <div className="mt-3">
                          <span className="badge bg-success"><Check size={12} className="me-1" /> Plan Seleccionado</span>
                          {sel.cod_base && <div className="small text-muted mt-1">COD base: {sel.cod_base}</div>}
                          {sel.legible_base && <div className="small text-muted">{sel.legible_base}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 3) Add-ons */}
            {sel?.plan_key ? (
              <>
                <h6 className="font-primary fw-semibold mb-3">3. Agregar Servicios – {FAMILIA[p].label}</h6>
                {!compat.length ? (
                  <div className="alert alert-light small">No hay add-ons compatibles para este plan.</div>
                ) : (
                  <div className="row g-3">
                    {compat.map((a: Addon) => {
                      const checked = addonsSel[p][a.key]
                      const cod = sel ? buildCode(p, sel.plan_key as PlanKey, a.key) : ''
                      const label = sel ? legible(p, sel.plan_key as PlanKey, a.key) : ''
                      const qty = addonQty[p][a.key] ?? 1
                      const unit = a.precio
                      const total = checked ? unit * (a.key === 'UsrAd' ? qty : 1) : 0

                      return (
                        <div key={`${p}-${a.key}`} className="col-md-6">
                          <div className={`card h-100 ${checked ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}>
                            <div className="card-body d-flex align-items-center justify-content-between">
                              <div>
                                <div className="fw-semibold">{a.titulo}</div>
                                <div className="small text-muted">{label}</div>
                                <div className="small text-muted">COD: {cod}</div>

                                {/* Cantidad solo para Usuario Adicional */}
                                {a.key === 'UsrAd' && checked && (
                                  <div className="mt-2 d-flex align-items-center gap-2">
                                    <label className="small text-muted mb-0">Cantidad:</label>
                                    <input
                                      type="number"
                                      min={1}
                                      step={1}
                                      value={qty}
                                      onChange={(e) => {
                                        const val = Math.max(1, Number(e.target.value) || 1)
                                        setAddonQty(prev => ({
                                          ...prev,
                                          [p]: { ...prev[p], UsrAd: val }
                                        }))
                                      }}
                                      className="form-control form-control-sm"
                                      style={{ width: 90 }}
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="text-end">
                                <div className="fw-semibold">
                                  {checked && a.key === 'UsrAd' && qty > 1
                                    ? `${qty} × ${currencyCLP(unit)} = ${currencyCLP(total)}`
                                    : currencyCLP(unit)}
                                </div>
                                <div className="form-check form-switch mt-1">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      setAddonsSel(prev => ({
                                        ...prev,
                                        [p]: { ...prev[p], [a.key]: !prev[p][a.key] }
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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
            <h6 className="card-title font-primary fw-semibold mb-3">Resumen de Selección</h6>
            {selectedProducts.map((p: ProductoId) => {
              const sel = info.selections[p]
              return (
                <div key={`res-${p}`} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">{FAMILIA[p].label}</div>
                    <div className="small text-muted">{sel?.subtotal ? currencyCLP(sel.subtotal) : '—'}</div>
                  </div>
                  {sel?.plan_nombre ? (
                    <div className="small">
                      <div><span className="text-muted">Plan:</span> {sel.plan_nombre} {sel.cod_base && <span className="text-muted">· {sel.cod_base}</span>}</div>
                      {sel.legible_base && <div className="text-muted small">{sel.legible_base}</div>}
                    </div>
                  ) : <div className="small text-muted">Sin plan seleccionado</div>}
                  {!!sel?.addons?.length && (
                    <ul className="small mb-0 mt-1">
                      {sel.addons!.map(a => (
                        <li key={`${p}-${a.key}`}>
                          {a.legible} <span className="text-muted">· {a.cod}</span>
                          {a.key === 'UsrAd'
                            ? <> — {a.qty} × {currencyCLP(a.precio)} = <strong>{currencyCLP(a.total)}</strong></>
                            : <> — {currencyCLP(a.total)}</>
                          }
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
                <div className="small text-muted text-end">Total Estimado</div>
                <div className="fw-semibold text-success h5 mb-0">{currencyCLP(info.total)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info importante */}
      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">Información Importante</h6>
        <ul className="mb-0 small">
          <li>Puedes contratar más de un producto (Enterfac y/o AndesPOS).</li>
          <li>Para cada producto, primero selecciona el plan base y luego los servicios adicionales compatibles.</li>
          <li>Los precios son referenciales mensuales; se ajustan en el onboarding.</li>
        </ul>
      </div>
    </div>
  )
}
