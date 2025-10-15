import React, {
  createContext, useCallback, useContext, useEffect, useId,
  useMemo, useRef, useState
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

/* ================= Tipos ================= */
type StepKey =
  | "productos"
  | "identificacion"
  | "documentos"
  | "integracion"
  | "sucursales"
  | "resumen";

/* ============== Helpers UI ============== */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="font-primary mb-3" style={{ fontSize: "1.25rem", fontWeight: 600 }}>{children}</h4>;
}
function PageHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-primary text-gradient mb-3" style={{ fontSize: "2rem", fontWeight: 700 }}>{children}</h2>;
}
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <label className={`form-label font-primary ${required ? "required" : ""}`} style={{ fontSize: ".875rem", fontWeight: 600 }}>{children}</label>;
}
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 me-2 mb-2 d-inline-block"
      style={{ background: "var(--color-border-light)", border: "1px solid var(--color-border)", borderRadius: 999, fontSize: ".8rem", fontWeight: 600 }}>
      {children}
    </span>
  );
}
const dash = "—";
const fmt = (v: any) => (v === undefined || v === null || v === "" ? dash : String(v));

/* ===== Tabs headless estilo shadcn + Bootstrap ===== */
type TabsContextType = { value: string; setValue: (v: string) => void; valuesRef: React.MutableRefObject<string[]>; idBase: string; };
const TabsCtx = createContext<TabsContextType | null>(null);
function Tabs({ value, onValueChange, children }: { value?: string; onValueChange?: (v: string)=>void; children: React.ReactNode }) {
  const [internal, setInternal] = useState(value ?? "productos");
  const idBase = useId();
  useEffect(()=>{ if(value!==undefined) setInternal(value); },[value]);
  const setValue = useCallback((v:string)=>{ onValueChange ? onValueChange(v) : setInternal(v); },[onValueChange]);
  const valuesRef = useRef<string[]>([]);
  const ctx = useMemo(()=>({ value: internal, setValue, valuesRef, idBase }),[internal,setValue,idBase]);
  return <TabsCtx.Provider value={ctx}>{children}</TabsCtx.Provider>;
}
function TabsList({ children }: { children: React.ReactNode }) { return <ul className="nav nav-tabs mb-3" role="tablist">{children}</ul>; }
function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsCtx)!;
  if (!ctx.valuesRef.current.includes(value)) ctx.valuesRef.current.push(value);
  const active = ctx.value === value;
  return (
    <li className="nav-item" role="presentation">
      <button
        type="button"
        role="tab"
        aria-selected={active}
        aria-controls={`${ctx.idBase}-panel-${value}`}
        id={`${ctx.idBase}-tab-${value}`}
        className={"nav-link" + (active ? " active" : "")}
        onClick={()=>ctx.setValue(value)}
        onKeyDown={(e)=>{ if(e.key==="ArrowRight"||e.key==="ArrowLeft"){ e.preventDefault(); const vals=ctx.valuesRef.current; const i=vals.indexOf(ctx.value); if(i>=0&&vals.length>1){ ctx.setValue(e.key==="ArrowRight" ? vals[(i+1)%vals.length] : vals[(i-1+vals.length)%vals.length]); }}}}
      >{children}</button>
    </li>
  );
}
function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsCtx)!; const hidden = ctx.value !== value;
  return (
    <div role="tabpanel" id={`${ctx.idBase}-panel-${value}`} aria-labelledby={`${ctx.idBase}-tab-${value}`} hidden={hidden} className="card shadow-sm mb-4">
      {!hidden && <div className="card-body">{children}</div>}
    </div>
  );
}

/* ===== Validadores / normalizadores ===== */
const onlyDigits = (s: string) => s.replace(/\D+/g, "");
const onlyAlnum = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const macRegex = /^(?:[0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

/* ================= Form principal ================= */
type Props = { empresa?: any; onSave: (data: any) => void };

const DTEs = [
  { id: "33", nombre: "Factura Electrónica" },
  { id: "34", nombre: "Factura Exenta" },
  { id: "39", nombre: "Boleta Electrónica" },
  { id: "52", nombre: "Guía de Despacho" },
  { id: "56", nombre: "Nota de Débito" },
  { id: "61", nombre: "Nota de Crédito" },
];

export default function ConfiguracionEmpresaForm({ empresa, onSave }: Props) {
  useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();

  const empresaProducts: string[] =
    (empresa?.productos && Array.isArray(empresa.productos) && empresa.productos.length)
      ? empresa.productos
      : empresa?.producto ? [empresa.producto] : ["ENTERFAC"];

  // productos seleccionados (pueden ser ambos)
  const [productos, setProductos] = useState<string[]>(empresaProducts);

  // Estados por producto
  const [enterfac, setEnterfac] = useState<any>({
    empkey: "", replica_password: "", pass: "",
    casilla_intercambio: "",
    url_visto_bueno: "", url_membrete: "",
    layout: "ESTANDAR", dte_habilitados: [],
    integracion: "", tipo_ws: "", tipo_texto: "", parser: "",
    modalidad_firma: "CONTROLADA", modalidad_emision: "ONLINE", admin_folios: "EN",
    version_emisor: "", version_app_full: "", version_winplugin: "",
    ...empresa?.onboarding?.configuracionEmpresa?.enterfac,
  });

  const [andespos, setAndespos] = useState<any>({
    empkey: "", replica_password: "", pass: "",
    encargado_fa: "", terminal_id: "",
    layout: "ESTANDAR", formato_impresion: "LASER", inventario: "",
    modalidad_firma: "CONTROLADA", modalidad_emision: "ONLINE", admin_folios: "EN",
    version_emisor: "", version_app_full: "", version_winplugin: "",
    ...empresa?.onboarding?.configuracionEmpresa?.andespos,
  });

  // Sucursales (para modalidad SemiOffline)
  const [boxes, setBoxes] = useState<any[]>(empresa?.onboarding?.configuracionEmpresa?.boxes || []);

  // STEPS tipados
  const STEPS: StepKey[] = useMemo(() => {
    const arr: StepKey[] = ["productos", "identificacion", "documentos", "integracion"];
    // Si algún producto está en SemiOffline, agregamos sucursales
    if (
      (productos.includes("ENTERFAC") && enterfac.modalidad_emision === "SEMIOFFLINE") ||
      (productos.includes("ANDESPOS") && andespos.modalidad_emision === "SEMIOFFLINE")
    ) {
      arr.push("sucursales");
    }
    arr.push("resumen");
    return arr;
  }, [productos, enterfac.modalidad_emision, andespos.modalidad_emision]);

  // current tipado
  const [current, setCurrent] = useState<StepKey>(() => {
    const q = search.get("step") as StepKey | null;
    return (q && (["productos","identificacion","documentos","integracion","sucursales","resumen"] as const).includes(q))
      ? q
      : "productos";
  });

  useEffect(() => {
    if (!STEPS.includes(current)) {
      const first: StepKey = STEPS[0];
      setCurrent(first);
      setSearch((sp) => { sp.set("step", first); return sp; }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STEPS]);

  const go = useCallback((key: StepKey) => {
    setCurrent(key);
    setSearch((sp) => { sp.set("step", key); return sp; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setSearch]);

  const next = useCallback(() => {
    const i = STEPS.indexOf(current);
    if (i >= 0 && i < STEPS.length - 1) go(STEPS[i + 1]);
  }, [STEPS, current, go]);

  const prev = useCallback(() => {
    const i = STEPS.indexOf(current);
    if (i > 0) go(STEPS[i - 1]);
  }, [STEPS, current, go]);

  // Validación mínima por paso (tipado)
  const stepValid: Record<StepKey, boolean> = useMemo(() => {
    const identOk =
      (!productos.includes("ENTERFAC") ||
        (enterfac.empkey && enterfac.replica_password && enterfac.pass && enterfac.casilla_intercambio)) &&
      (!productos.includes("ANDESPOS") ||
        (andespos.empkey && andespos.replica_password && andespos.pass));

    return {
      productos: productos.length > 0,
      identificacion: !!identOk,
      documentos: true,   // no bloqueamos
      integracion: true,  // no bloqueamos
      sucursales: true,
      resumen: true,
    };
  }, [productos, enterfac, andespos]);

  const progress = ((STEPS.indexOf(current) + 1) / STEPS.length) * 100;

  const toggleProducto = (key: "ENTERFAC" | "ANDESPOS") => {
    setProductos((prev) => prev.includes(key) ? prev.filter(p=>p!==key) : [...prev, key]);
  };

  // Guardar
  const save = () => {
    const payload = { productos, enterfac, andespos, boxes };
    onSave?.(payload);
    if (empresa?.empkey) navigate(`/empresa/${empresa.empkey}`);
  };

  /* ============ Render por paso ============ */
  const renderProductos = () => (
    <div>
      <SectionTitle>Productos contratados</SectionTitle>
      <div className="d-flex gap-3 flex-wrap">
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="p-enterfac"
            checked={productos.includes("ENTERFAC")} onChange={()=>toggleProducto("ENTERFAC")} />
          <label className="form-check-label" htmlFor="p-enterfac">ENTERFAC</label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="p-andespos"
            checked={productos.includes("ANDESPOS")} onChange={()=>toggleProducto("ANDESPOS")} />
          <label className="form-check-label" htmlFor="p-andespos">ANDESPOS</label>
        </div>
      </div>
      <small className="text-muted d-block mt-2">Puedes marcar ambos si la empresa tiene los dos productos.</small>
    </div>
  );

  const renderIdentificacion = () => (
    <div>
      <SectionTitle>Identificación</SectionTitle>
      {productos.includes("ENTERFAC") && (
        <div className="border rounded p-3 mb-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ENTERFAC</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <FieldLabel required>Empkey</FieldLabel>
              <input className="form-control" inputMode="numeric" pattern="\\d*"
                value={enterfac.empkey} onChange={e=>setEnterfac((p:any)=>({ ...p, empkey: onlyDigits(e.target.value) }))} />
            </div>
            <div className="col-md-4">
              <FieldLabel required>ReplicaPass</FieldLabel>
              <input className="form-control"
                value={enterfac.replica_password} onChange={e=>setEnterfac((p:any)=>({ ...p, replica_password: onlyAlnum(e.target.value) }))} />
            </div>
            <div className="col-md-4">
              <FieldLabel required>Pass</FieldLabel>
              <input className="form-control"
                value={enterfac.pass} onChange={e=>setEnterfac((p:any)=>({ ...p, pass: onlyAlnum(e.target.value) }))} />
            </div>
            <div className="col-md-6">
              <FieldLabel required>Casilla de intercambio</FieldLabel>
              <input className="form-control"
                value={enterfac.casilla_intercambio} onChange={e=>setEnterfac((p:any)=>({ ...p, casilla_intercambio: e.target.value }))} />
            </div>
          </div>
        </div>
      )}

      {productos.includes("ANDESPOS") && (
        <div className="border rounded p-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ANDESPOS</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <FieldLabel required>Empkey</FieldLabel>
              <input className="form-control" inputMode="numeric" pattern="\\d*"
                value={andespos.empkey} onChange={e=>setAndespos((p:any)=>({ ...p, empkey: onlyDigits(e.target.value) }))} />
            </div>
            <div className="col-md-3">
              <FieldLabel required>ReplicaPass</FieldLabel>
              <input className="form-control"
                value={andespos.replica_password} onChange={e=>setAndespos((p:any)=>({ ...p, replica_password: onlyAlnum(e.target.value) }))} />
            </div>
            <div className="col-md-3">
              <FieldLabel required>Pass</FieldLabel>
              <input className="form-control"
                value={andespos.pass} onChange={e=>setAndespos((p:any)=>({ ...p, pass: onlyAlnum(e.target.value) }))} />
            </div>
            <div className="col-md-3">
              <FieldLabel>Encargado FA</FieldLabel>
              <input className="form-control" value={andespos.encargado_fa} onChange={e=>setAndespos((p:any)=>({ ...p, encargado_fa: e.target.value }))} />
            </div>
            <div className="col-md-3">
              <FieldLabel>Terminal ID</FieldLabel>
              <input className="form-control" value={andespos.terminal_id} onChange={e=>setAndespos((p:any)=>({ ...p, terminal_id: e.target.value }))} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDocumentos = () => (
    <div>
      <SectionTitle>Documentos & Layout</SectionTitle>

      {productos.includes("ENTERFAC") && (
        <div className="border rounded p-3 mb-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ENTERFAC</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <FieldLabel>URL Visto Bueno</FieldLabel>
              <input className="form-control" value={enterfac.url_visto_bueno} onChange={e=>setEnterfac((p:any)=>({ ...p, url_visto_bueno: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <FieldLabel>URL Membrete</FieldLabel>
              <input className="form-control" value={enterfac.url_membrete} onChange={e=>setEnterfac((p:any)=>({ ...p, url_membrete: e.target.value }))} />
            </div>
            <div className="col-md-4">
              <FieldLabel>Layout</FieldLabel>
              <select className="form-select" value={enterfac.layout} onChange={e=>setEnterfac((p:any)=>({ ...p, layout: e.target.value }))}>
                <option value="ESTANDAR">Estándar</option>
                <option value="CUSTOM">Customizado</option>
              </select>
            </div>

            {enterfac.layout === "ESTANDAR" && (
              <div className="col-12">
                <FieldLabel>DTE Habilitados</FieldLabel>
                <div className="row gy-2">
                  {DTEs.map(dte=>(
                    <div className="col-md-4 col-lg-2 d-flex align-items-center gap-2" key={dte.id}>
                      <input type="checkbox" id={`dte-${dte.id}`} className="form-check-input"
                        checked={enterfac.dte_habilitados?.includes(dte.id) || false}
                        onChange={e=>{
                          const curr = enterfac.dte_habilitados || [];
                          setEnterfac((p:any)=>({
                            ...p,
                            dte_habilitados: e.target.checked ? [...curr, dte.id] : curr.filter((id:string)=>id!==dte.id)
                          }));
                        }}
                      />
                      <label className="form-check-label" htmlFor={`dte-${dte.id}`}>{dte.nombre}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {productos.includes("ANDESPOS") && (
        <div className="border rounded p-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ANDESPOS</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <FieldLabel>Layout</FieldLabel>
              <select className="form-select" value={andespos.layout} onChange={e=>setAndespos((p:any)=>({ ...p, layout: e.target.value }))}>
                <option value="ESTANDAR">Estándar</option>
                <option value="CUSTOM">Customizado</option>
              </select>
            </div>
            {andespos.layout === "ESTANDAR" && (
              <div className="col-md-4">
                <FieldLabel>Inventario</FieldLabel>
                <select className="form-select" value={andespos.inventario} onChange={e=>setAndespos((p:any)=>({ ...p, inventario: e.target.value }))}>
                  <option value="">Seleccione</option>
                  <option value="SI">Sí</option>
                  <option value="NO">No</option>
                </select>
              </div>
            )}
            <div className="col-md-4">
              <FieldLabel>Modalidad de Impresión</FieldLabel>
              <select className="form-select" value={andespos.formato_impresion} onChange={e=>setAndespos((p:any)=>({ ...p, formato_impresion: e.target.value }))}>
                <option value="TERMICA">Térmica</option>
                <option value="LASER">Láser</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderIntegracion = () => (
    <div>
      <SectionTitle>Integración & Versionado</SectionTitle>

      {productos.includes("ENTERFAC") && (
        <div className="border rounded p-3 mb-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ENTERFAC</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <FieldLabel>Integración</FieldLabel>
              <select className="form-select" value={enterfac.integracion} onChange={e=>setEnterfac((p:any)=>({ ...p, integracion: e.target.value }))}>
                <option value="">Selecciona</option>
                <option value="SI">Sí</option>
                <option value="NO">No</option>
              </select>
            </div>

            {enterfac.integracion === "SI" && (
              <>
                <div className="col-md-3">
                  <FieldLabel>Tipo Integración</FieldLabel>
                  <select className="form-select" value={enterfac.tipo_ws} onChange={e=>setEnterfac((p:any)=>({ ...p, tipo_ws: e.target.value }))}>
                    <option value="SOAP">WebService SOAP</option>
                    <option value="REST">API REST</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <FieldLabel>Tipo de Texto</FieldLabel>
                  <select className="form-select" value={enterfac.tipo_texto} onChange={e=>setEnterfac((p:any)=>({ ...p, tipo_texto: e.target.value }))}>
                    <option value="">Seleccione</option>
                    <option value="XML V5">XML V5</option>
                    <option value="TXT V5">TXT V5</option>
                    <option value="XML Custom">XML Custom</option>
                    <option value="TXT Custom">TXT Custom</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <FieldLabel>Parser</FieldLabel>
                  <select className="form-select" value={enterfac.parser} onChange={e=>setEnterfac((p:any)=>({ ...p, parser: e.target.value }))}>
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </div>
              </>
            )}

            <div className="col-md-3">
              <FieldLabel>Modalidad Firma</FieldLabel>
              <select className="form-select" value={enterfac.modalidad_firma} onChange={e=>setEnterfac((p:any)=>({ ...p, modalidad_firma: e.target.value }))}>
                <option value="CONTROLADA">Controlada</option>
                <option value="AUTOMATICA">Automática</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Modalidad Emisión</FieldLabel>
              <select className="form-select" value={enterfac.modalidad_emision} onChange={e=>setEnterfac((p:any)=>({ ...p, modalidad_emision: e.target.value }))}>
                <option value="ONLINE">Online</option>
                <option value="SEMIOFFLINE">SemiOffline</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Administrador Folios</FieldLabel>
              <select className="form-select" value={enterfac.admin_folios} onChange={e=>setEnterfac((p:any)=>({ ...p, admin_folios: e.target.value }))}>
                <option value="EN">Enternet</option>
                <option value="CL">Cliente</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión Emisor</FieldLabel>
              <select className="form-select" value={enterfac.version_emisor} onChange={e=>setEnterfac((p:any)=>({ ...p, version_emisor: e.target.value }))}>
                <option value="">Seleccionar</option>
                <option value="1.0">1.0</option>
                <option value="1.1">1.1</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Versión AppFull</FieldLabel>
              <select className="form-select" value={enterfac.version_app_full} onChange={e=>setEnterfac((p:any)=>({ ...p, version_app_full: e.target.value }))}>
                <option value="">Seleccionar</option>
                <option value="2024.1">2024.1</option>
                <option value="2024.2">2024.2</option>
                <option value="2024.3">2024.3</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Versión WinPlugin</FieldLabel>
              <select className="form-select" value={enterfac.version_winplugin} onChange={e=>setEnterfac((p:any)=>({ ...p, version_winplugin: e.target.value }))}>
                <option value="">Seleccionar</option>
                <option value="3.1">3.1</option>
                <option value="3.2">3.2</option>
                <option value="3.3">3.3</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {productos.includes("ANDESPOS") && (
        <div className="border rounded p-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ANDESPOS</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <FieldLabel>Modalidad Firma</FieldLabel>
              <select className="form-select" value={andespos.modalidad_firma} onChange={e=>setAndespos((p:any)=>({ ...p, modalidad_firma: e.target.value }))}>
                <option value="CONTROLADA">Controlada</option>
                <option value="AUTOMATICA">Automática</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Modalidad Emisión</FieldLabel>
              <select className="form-select" value={andespos.modalidad_emision} onChange={e=>setAndespos((p:any)=>({ ...p, modalidad_emision: e.target.value }))}>
                <option value="ONLINE">Online</option>
                <option value="SEMIOFFLINE">SemiOffline</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Administrador Folios</FieldLabel>
              <select className="form-select" value={andespos.admin_folios} onChange={e=>setAndespos((p:any)=>({ ...p, admin_folios: e.target.value }))}>
                <option value="EN">Enternet</option>
                <option value="CL">Cliente</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión Emisor</FieldLabel>
              <select className="form-select" value={andespos.version_emisor} onChange={e=>setAndespos((p:any)=>({ ...p, version_emisor: e.target.value }))}>
                <option value="">Seleccionar</option>
                <option value="1.0">1.0</option>
                <option value="1.1">1.1</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Versión AppFull</FieldLabel>
              <select className="form-select" value={andespos.version_app_full} onChange={e=>setAndespos((p:any)=>({ ...p, version_app_full: e.target.value }))}>
                <option value="">Seleccionar</option>
                <option value="2024.1">2024.1</option>
                <option value="2024.2">2024.2</option>
                <option value="2024.3">2024.3</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Versión WinPlugin</FieldLabel>
              <select className="form-select" value={andespos.version_winplugin} onChange={e=>setAndespos((p:any)=>({ ...p, version_winplugin: e.target.value }))}>
                <option value="">Seleccionar</option>
                <option value="3.1">3.1</option>
                <option value="3.2">3.2</option>
                <option value="3.3">3.3</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSucursales = () => (
    <div>
      <SectionTitle>Sucursales (SemiOffline)</SectionTitle>
      <div className="mb-3">
        <FieldLabel>Cantidad de sucursales</FieldLabel>
        <input type="number" className="form-control" min={1} value={boxes.length || 1}
          onChange={(e)=>setBoxes(Array.from({length: Number(e.target.value)}, (_,i)=>boxes[i]||{}))} />
      </div>

      {boxes.map((box:any, idx:number)=>(
        <div key={idx} className="card mb-3 p-3">
          <h6 className="mb-2" style={{ fontWeight: 700 }}>Sucursal #{idx+1}</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <FieldLabel>ID BOX</FieldLabel>
              <input className="form-control" value={box.idBox||""}
                onChange={e=>setBoxes(b=>{ const n=[...b]; n[idx]={...n[idx], idBox:e.target.value}; return n; })} />
            </div>
            <div className="col-md-3">
              <FieldLabel>Punto de Acceso Key</FieldLabel>
              <input className="form-control" value={box.pak||""}
                onChange={e=>setBoxes(b=>{ const n=[...b]; n[idx]={...n[idx], pak: e.target.value.replace(/[^a-zA-Z0-9-]/g,"")}; return n; })} />
            </div>
            <div className="col-md-3">
              <FieldLabel>Punto de Acceso Nombre</FieldLabel>
              <input className="form-control" value={box.pan||""}
                onChange={e=>setBoxes(b=>{ const n=[...b]; n[idx]={...n[idx], pan:e.target.value}; return n; })} />
            </div>
            <div className="col-md-3">
              <FieldLabel>Router</FieldLabel>
              <input className="form-control" value={box.router||""}
                onChange={e=>setBoxes(b=>{ const n=[...b]; n[idx]={...n[idx], router:e.target.value}; return n; })} />
            </div>
            <div className="col-md-3">
              <FieldLabel>IP</FieldLabel>
              <input className={"form-control" + (box.ip && !ipRegex.test(box.ip) ? " is-invalid":"")}
                placeholder="192.168.1.100" value={box.ip||""}
                onChange={e=>setBoxes(b=>{ const n=[...b]; n[idx]={...n[idx], ip:e.target.value}; return n; })} />
            </div>
            <div className="col-md-3">
              <FieldLabel>MAC ETH0</FieldLabel>
              <input className={"form-control" + (box.mac_eth0 && !macRegex.test(box.mac_eth0) ? " is-invalid":"")}
                placeholder="00:1B:44:11:3A:B7" value={box.mac_eth0||""}
                onChange={e=>setBoxes(b=>{ const n=[...b]; n[idx]={...n[idx], mac_eth0:e.target.value}; return n; })} />
            </div>
            <div className="col-md-3">
              <FieldLabel>MAC WLAN0</FieldLabel>
              <input className={"form-control" + (box.mac_wlan0 && !macRegex.test(box.mac_wlan0) ? " is-invalid":"")}
                placeholder="00:1B:44:11:3A:B7" value={box.mac_wlan0||""}
                onChange={e=>setBoxes(b=>{ const n=[...b]; n[idx]={...n[idx], mac_wlan0:e.target.value}; return n; })} />
            </div>
            <div className="col-md-3">
              <FieldLabel>Versión Enterbox</FieldLabel>
              <select className="form-select" value={box.enterbox||""}
                onChange={e=>setBoxes(b=>{ const n=[...b]; n[idx]={...n[idx], enterbox:e.target.value}; return n; })}>
                <option value="">Seleccione</option>
                <option value="PI3">PI3</option>
                <option value="PI4">PI4</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderResumen = () => (
    <div>
      <SectionTitle>Resumen Final</SectionTitle>

      {/* Productos */}
      <div className="card mb-3">
        <div className="card-body">
          <strong>Productos:</strong>{" "}
          {productos.length ? productos.map(p => <Chip key={p}>{p}</Chip>) : dash}
        </div>
      </div>

      {/* ENTERFAC */}
      {productos.includes("ENTERFAC") && (
        <div className="card mb-3">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>ENTERFAC</div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-4"><strong>Empkey:</strong> {fmt(enterfac.empkey)}</div>
              <div className="col-md-4"><strong>ReplicaPass:</strong> {fmt(enterfac.replica_password)}</div>
              <div className="col-md-4"><strong>Pass:</strong> {fmt(enterfac.pass)}</div>
              <div className="col-md-6"><strong>Casilla:</strong> {fmt(enterfac.casilla_intercambio)}</div>
              <div className="col-md-6"><strong>Layout:</strong> {fmt(enterfac.layout)}</div>
              <div className="col-md-6"><strong>URL V.Bueno:</strong> {fmt(enterfac.url_visto_bueno)}</div>
              <div className="col-md-6"><strong>URL Membrete:</strong> {fmt(enterfac.url_membrete)}</div>
              <div className="col-12">
                <strong className="d-block mb-1">DTE Habilitados:</strong>
                {enterfac.dte_habilitados?.length
                  ? enterfac.dte_habilitados.map((id:string)=> {
                      const d = DTEs.find(x=>x.id===id);
                      return <Chip key={id}>{d ? `${d.id} - ${d.nombre}` : id}</Chip>;
                    })
                  : dash}
              </div>
              <div className="col-md-3"><strong>Integración:</strong> {fmt(enterfac.integracion)}</div>
              {enterfac.integracion==="SI" && (
                <>
                  <div className="col-md-3"><strong>Tipo WS:</strong> {fmt(enterfac.tipo_ws)}</div>
                  <div className="col-md-3"><strong>Tipo Texto:</strong> {fmt(enterfac.tipo_texto)}</div>
                  <div className="col-md-3"><strong>Parser:</strong> {fmt(enterfac.parser)}</div>
                </>
              )}
              <div className="col-md-3"><strong>Firma:</strong> {fmt(enterfac.modalidad_firma)}</div>
              <div className="col-md-3"><strong>Emisión:</strong> {fmt(enterfac.modalidad_emision)}</div>
              <div className="col-md-3"><strong>Folios:</strong> {fmt(enterfac.admin_folios)}</div>
              <div className="col-md-3"><strong>Emisor:</strong> {fmt(enterfac.version_emisor)}</div>
              <div className="col-md-3"><strong>AppFull:</strong> {fmt(enterfac.version_app_full)}</div>
              <div className="col-md-3"><strong>WinPlugin:</strong> {fmt(enterfac.version_winplugin)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ANDESPOS */}
      {productos.includes("ANDESPOS") && (
        <div className="card mb-3">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>ANDESPOS</div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-3"><strong>Empkey:</strong> {fmt(andespos.empkey)}</div>
              <div className="col-md-3"><strong>ReplicaPass:</strong> {fmt(andespos.replica_password)}</div>
              <div className="col-md-3"><strong>Pass:</strong> {fmt(andespos.pass)}</div>
              <div className="col-md-3"><strong>Encargado FA:</strong> {fmt(andespos.encargado_fa)}</div>
              <div className="col-md-3"><strong>Terminal ID:</strong> {fmt(andespos.terminal_id)}</div>
              <div className="col-md-3"><strong>Layout:</strong> {fmt(andespos.layout)}</div>
              {andespos.layout==="ESTANDAR" && (
                <div className="col-md-3"><strong>Inventario:</strong> {fmt(andespos.inventario)}</div>
              )}
              <div className="col-md-3"><strong>Impresión:</strong> {fmt(andespos.formato_impresion)}</div>
              <div className="col-md-3"><strong>Firma:</strong> {fmt(andespos.modalidad_firma)}</div>
              <div className="col-md-3"><strong>Emisión:</strong> {fmt(andespos.modalidad_emision)}</div>
              <div className="col-md-3"><strong>Folios:</strong> {fmt(andespos.admin_folios)}</div>
              <div className="col-md-3"><strong>Emisor:</strong> {fmt(andespos.version_emisor)}</div>
              <div className="col-md-3"><strong>AppFull:</strong> {fmt(andespos.version_app_full)}</div>
              <div className="col-md-3"><strong>WinPlugin:</strong> {fmt(andespos.version_winplugin)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Sucursales */}
      {((productos.includes("ENTERFAC") && enterfac.modalidad_emision==="SEMIOFFLINE") ||
        (productos.includes("ANDESPOS") && andespos.modalidad_emision==="SEMIOFFLINE")) && (
        <div className="card">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>Sucursales</div>
          <div className="card-body">
            {boxes.length ? boxes.map((b:any, i:number)=>(
              <div key={i} className="border rounded p-3 mb-2">
                <strong>Sucursal #{i+1}</strong>
                <div className="row g-2 mt-1">
                  <div className="col-md-3"><strong>ID BOX:</strong> {fmt(b?.idBox)}</div>
                  <div className="col-md-3"><strong>PA Key:</strong> {fmt(b?.pak)}</div>
                  <div className="col-md-3"><strong>PA Nombre:</strong> {fmt(b?.pan)}</div>
                  <div className="col-md-3"><strong>Router:</strong> {fmt(b?.router)}</div>
                  <div className="col-md-3"><strong>IP:</strong> {fmt(b?.ip)}</div>
                  <div className="col-md-3"><strong>MAC ETH0:</strong> {fmt(b?.mac_eth0)}</div>
                  <div className="col-md-3"><strong>MAC WLAN0:</strong> {fmt(b?.mac_wlan0)}</div>
                  <div className="col-md-3"><strong>Enterbox:</strong> {fmt(b?.enterbox)}</div>
                </div>
              </div>
            )) : dash}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto" }}>
      <PageHeading>Onboarding – Configuración de Empresa</PageHeading>

      {/* Progreso */}
      <div className="mb-2 small text-muted d-flex align-items-center gap-2">
        <div className="flex-grow-1 progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span style={{ minWidth: 70, textAlign: "right" }}>{Math.round(progress)}%</span>
      </div>

      <Tabs value={current} onValueChange={(v)=>go(v as StepKey)}>
        <TabsList>
          {STEPS.map(s => <TabsTrigger key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="productos">{renderProductos()}</TabsContent>
        <TabsContent value="identificacion">{renderIdentificacion()}</TabsContent>
        <TabsContent value="documentos">{renderDocumentos()}</TabsContent>
        <TabsContent value="integracion">{renderIntegracion()}</TabsContent>
        {STEPS.includes("sucursales") && <TabsContent value="sucursales">{renderSucursales()}</TabsContent>}
        <TabsContent value="resumen">{renderResumen()}</TabsContent>
      </Tabs>

      <div className="sticky-bottom bg-white border-top py-3" style={{ position: "sticky", bottom: 0, zIndex: 5 }}>
        <div className="d-flex justify-content-between" style={{ maxWidth: 900, margin: "0 auto" }}>
          <button type="button" className="btn btn-outline-primary" onClick={prev} disabled={STEPS[0]===current}>Atrás</button>
          {current !== "resumen" ? (
            <button type="button" className="btn btn-primary" onClick={next} disabled={!stepValid[current]}>Siguiente</button>
          ) : (
            <button type="button" className="btn btn-gradient" onClick={save}>Guardar y Enviar</button>
          )}
        </div>
      </div>
    </div>
  );
}
