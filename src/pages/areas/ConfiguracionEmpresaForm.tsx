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

/** Productos internos (claves) */
type ProductoKey = "ENTERFAC" | "ANDESPOS" | "ANDESPOS_ENTERBOX" | "LCE";

/** Etiquetas visibles */
const PRODUCT_LABEL: Record<ProductoKey, string> = {
  ENTERFAC: "Enterfact",
  ANDESPOS: "AndesPOS",
  ANDESPOS_ENTERBOX: "AndesPOS Enterbox",
  LCE: "LCE",
};

/** DTEs (catálogo) */
type DteKey =
  | "33" | "34" | "46" | "52" | "56" | "61" | "39" | "41" | "43"
  | "110" | "111" | "112"
  | "Comanda" | "TNT";
type GrupoDte = "Nacionales" | "Exportación" | "No tributarios";

const DTE_CATALOGO: Record<GrupoDte, { id: DteKey; nombre: string }[]> = {
  Nacionales: [
    { id: "33", nombre: "Factura Afecta" },
    { id: "34", nombre: "Factura Exenta" },
    { id: "46", nombre: "Factura de Compra" },
    { id: "52", nombre: "Guía de Despacho" },
    { id: "56", nombre: "Nota de Débito" },
    { id: "61", nombre: "Nota de Crédito" },
    { id: "39", nombre: "Boleta Afecta" },
    { id: "41", nombre: "Boleta Exenta" },
    { id: "43", nombre: "Liquidación de Factura" },
  ],
  Exportación: [
    { id: "110", nombre: "Factura Electrónica de Exportación" },
    { id: "111", nombre: "Nota de Débito de Exportación" },
    { id: "112", nombre: "Nota de Crédito de Exportación" },
  ],
  "No tributarios": [
    { id: "Comanda", nombre: "Comanda" },
    { id: "TNT", nombre: "Ticket No Tributario" },
  ],
};

const LAYOUTS_ENTERFACT = [
  { key: "Layout 1", nombre: "Layout 1", url: "" },
  { key: "Layout 2", nombre: "Layout 2", url: "" },
  { key: "Layout 3", nombre: "Layout 3", url: "" },
] as const;

/** Modalidades emisión */
type ModalidadEnterfac = "Online" | "Online Web" | "Offline" | "Offline Web" | "Ciega";
type ModalidadAndes = "Offline Web" | "Ciega";

/** Integraciones */
type IntegracionTipo = "Transferencia de Archivo" | "Batch" | "Web Service" | "Web";
type WebServiceTipo = "REST" | "SOAP";

/* ============== Helpers UI ============== */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-primary mb-3" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
      {children}
    </h4>
  );
}
function PageHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-primary text-gradient mb-3" style={{ fontSize: "2rem", fontWeight: 700 }}>
      {children}
    </h2>
  );
}
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className={`form-label font-primary ${required ? "required" : ""}`} style={{ fontSize: ".875rem", fontWeight: 600 }}>
      {children}
    </label>
  );
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

/* ===== Tabs ===== */
type TabsContextType = {
  value: string;
  setValue: (v: string) => void;
  valuesRef: React.MutableRefObject<string[]>;
  idBase: string;
};
const TabsCtx = createContext<TabsContextType | null>(null);

function Tabs({ value, onValueChange, children }: { value?: string; onValueChange?: (v: string) => void; children: React.ReactNode }) {
  const [internal, setInternal] = useState(value ?? "productos");
  const idBase = useId();
  useEffect(() => { if (value !== undefined) setInternal(value); }, [value]);
  const setValue = useCallback((v: string) => { onValueChange ? onValueChange(v) : setInternal(v); }, [onValueChange]);
  const valuesRef = useRef<string[]>([]);
  const ctx = useMemo(() => ({ value: internal, setValue, valuesRef, idBase }), [internal, setValue, idBase]);
  return <TabsCtx.Provider value={ctx}>{children}</TabsCtx.Provider>;
}
function TabsList({ children }: { children: React.ReactNode }) {
  return <ul className="nav nav-tabs mb-3" role="tablist">{children}</ul>;
}
function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsCtx)!;
  if (!ctx.valuesRef.current.includes(value)) ctx.valuesRef.current.push(value);
  const active = ctx.value === value;
  return (
    <li className="nav-item" role="presentation">
      <button
        type="button" role="tab" aria-selected={active}
        aria-controls={`${ctx.idBase}-panel-${value}`} id={`${ctx.idBase}-tab-${value}`}
        className={"nav-link" + (active ? " active" : "")}
        onClick={() => ctx.setValue(value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const vals = ctx.valuesRef.current;
            const i = vals.indexOf(ctx.value);
            if (i >= 0 && vals.length > 1) {
              ctx.setValue(e.key === "ArrowRight" ? vals[(i + 1) % vals.length] : vals[(i - 1 + vals.length) % vals.length]);
            }
          }
        }}
      >
        {children}
      </button>
    </li>
  );
}
function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsCtx)!;
  const hidden = ctx.value !== value;
  return (
    <div role="tabpanel" id={`${ctx.idBase}-panel-${value}`} aria-labelledby={`${ctx.idBase}-tab-${value}`} hidden={hidden} className="card shadow-sm mb-4">
      {!hidden && <div className="card-body">{children}</div>}
    </div>
  );
}

/* ===== Validadores ===== */
const onlyDigits = (s: string) => s.replace(/\D+/g, "");
const onlyAlnum = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
const isPdf = (file: File) => !!file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
const isCsv = (file: File) => !!file && (file.type.includes("csv") || /\.csv$/i.test(file.name));
const isValidUrl = (u: string) => { try { new URL(u); return true; } catch { return false; } };
/* ================= Form principal ================= */
type Props = { empresa?: any; onSave: (data: any) => void };

export default function ConfiguracionEmpresaForm({ empresa, onSave }: Props) {
  useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();

  /* === Estados === */
  const empresaProducts: ProductoKey[] =
    (empresa?.productos && Array.isArray(empresa.productos) && empresa.productos.length)
      ? empresa.productos
      : empresa?.producto ? [empresa.producto] as ProductoKey[] : ["ENTERFAC"];

  const [productos, setProductos] = useState<ProductoKey[]>(empresaProducts);

  /** Enterfact */
  const [enterfac, setEnterfac] = useState<any>({
    empkey: "", replica_password: "", pass: "", casilla_intercambio: "",
    url_visto_bueno: null as File | null, url_membrete: "",
    layout: "ESTANDAR", layout_key: "", url_layout_selected: "", url_layout_custom: "",
    dte_habilitados: [] as DteKey[],
    // Integración (ahora por documento en Documentos&Layout)
    tipo_texto: "", parser: "",
    modalidad_firma: "CONTROLADA", admin_folios: "EN",
    version_emisor: "", version_winplugin: "", version_winbatch: "",
    version_win_emisor_ws: "",
    ...empresa?.onboarding?.configuracionEmpresa?.enterfac,
  });

  /** Integración por documento (Enterfact) */
  const [efIntegracionGeneral, setEfIntegracionGeneral] = useState<IntegracionTipo[]>([]);
  type EfIntegracionPorDoc = Partial<Record<DteKey, IntegracionTipo[]>>;
  const [efIntegracionPorDoc, setEfIntegracionPorDoc] = useState<EfIntegracionPorDoc>({});
  type EfWsTipoPorDoc = Partial<Record<DteKey, WebServiceTipo | "">>;
  const [efWsTipoPorDoc, setEfWsTipoPorDoc] = useState<EfWsTipoPorDoc>({});

  // Prellenar per-doc con "general" si no hay override
  useEffect(() => {
    const seleccionados = (enterfac.dte_habilitados || []) as DteKey[];
    setEfIntegracionPorDoc(prev => {
      const copy: EfIntegracionPorDoc = { ...prev };
      seleccionados.forEach(k => {
        if (!copy[k] || copy[k]!.length === 0) copy[k] = [...efIntegracionGeneral];
      });
      return copy;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [efIntegracionGeneral, enterfac.dte_habilitados]);

  // Batch por documento (CSV + codificación + preview)
  type Codificacion = "ANSI" | "UTF-8";
  type EfBatchCfg = { file: File | null; codificacion: Codificacion; preview: string[][] };
  const [efBatchPorDoc, setEfBatchPorDoc] = useState<Partial<Record<DteKey, EfBatchCfg>>>({});

  const handleCsvPerDoc = (doc: DteKey, file: File | null, cod: Codificacion) => {
    if (!file) {
      setEfBatchPorDoc(prev => ({ ...prev, [doc]: { file: null, codificacion: cod, preview: [] } }));
      return;
    }
    if (!isCsv(file)) {
      alert("Solo se permiten archivos .csv");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const rows = text.split(/\r?\n/).filter(Boolean).slice(0, 5).map(r => r.split(","));
      setEfBatchPorDoc(prev => ({ ...prev, [doc]: { file, codificacion: cod, preview: rows } }));
    };
    reader.readAsText(file, cod === "ANSI" ? "windows-1252" : "utf-8");
  };

  /** AndesPOS / Enterbox comparten estructura */
  const [andespos, setAndespos] = useState<any>({
    empkey: "", replica_password: "", pass: "", encargado_fa: "", terminal_id: "",
    layout_url: "", formato_impresion: "LASER", inventario: "",
    modalidad_firma: "CONTROLADA", admin_folios: "EN",
    version_emisor: "", tipo_texto: "", dte_habilitados: [] as DteKey[],
    ...empresa?.onboarding?.configuracionEmpresa?.andespos,
  });

  /** Modalidad por documento (Enterfact) */
  const [enterfacGeneral, setEnterfacGeneral] = useState<"" | ModalidadEnterfac>("");
  type EnterfacPorDoc = Partial<Record<DteKey, ModalidadEnterfac>>;
  const [enterfacPorDoc, setEnterfacPorDoc] = useState<EnterfacPorDoc>({});
  useEffect(() => {
    if (!enterfacGeneral) return;
    setEnterfacPorDoc(prev => {
      const copy: EnterfacPorDoc = { ...prev };
      const seleccionados = (enterfac.dte_habilitados || []) as DteKey[];
      seleccionados.forEach(k => { if (!copy[k]) copy[k] = enterfacGeneral as ModalidadEnterfac; });
      return copy;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterfacGeneral]);

  /** Modalidad por documento (Andes) */
  const [andesGeneral, setAndesGeneral] = useState<"" | ModalidadAndes>("");
  type AndesPorDoc = Partial<Record<DteKey, ModalidadAndes>>;
  const [andesPorDoc, setAndesPorDoc] = useState<AndesPorDoc>({});
  useEffect(() => {
    if (!andesGeneral) return;
    setAndesPorDoc(prev => {
      const copy: AndesPorDoc = { ...prev };
      const seleccionados = (andespos.dte_habilitados || []) as DteKey[];
      seleccionados.forEach(k => { if (!copy[k]) copy[k] = andesGeneral as ModalidadAndes; });
      return copy;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [andesGeneral]);

  /** Visto Bueno (solo PDF) */
  const [filePreview, setFilePreview] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");

  /** LCE — archivos CSV */
  const [lce, setLce] = useState<{
    libro_diario: File | null;
    plan_cuenta: File | null;
    tipos_dte: File | null;
    centro_responsabilidad: File | null;
  }>({ libro_diario: null, plan_cuenta: null, tipos_dte: null, centro_responsabilidad: null });

  /** Sucursales */
  const [boxes, setBoxes] = useState<any[]>(empresa?.onboarding?.configuracionEmpresa?.boxes || []);

  /* === Pasos (Step) === */
  const STEPS: StepKey[] = useMemo(() => {
    const arr: StepKey[] = ["productos", "identificacion", "documentos", "integracion"];
    // Ahora Sucursales si ANDESPOS o ANDESPOS_ENTERBOX
    if (productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) arr.push("sucursales");
    arr.push("resumen");
    return arr;
  }, [productos]);

  const [current, setCurrent] = useState<StepKey>(() => {
    const q = search.get("step") as StepKey | null;
    return (q && (["productos", "identificacion", "documentos", "integracion", "sucursales", "resumen"] as const).includes(q))
      ? q : "productos";
  });

  useEffect(() => {
    if (!STEPS.includes(current)) {
      const first: StepKey = STEPS[0];
      setCurrent(first);
      setSearch((sp) => { sp.set("step", first); return sp; }, { replace: true });
    }
  }, [STEPS]); // eslint-disable-line react-hooks/exhaustive-deps

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

  /** Validación por paso */
  const stepValid: Record<StepKey, boolean> = useMemo(() => {
    const needEF = productos.includes("ENTERFAC");
    const needAP = productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX");
    const needLCE = productos.includes("LCE");

    const okEF = !needEF || (!!enterfac.empkey && !!enterfac.replica_password && !!enterfac.pass);
    const okAP = !needAP || (!!andespos.empkey && !!andespos.replica_password && !!andespos.pass);

    const okLCE = !needLCE || (!!lce.libro_diario && !!lce.plan_cuenta); // obligatorios

    return {
      productos: productos.length > 0,
      identificacion: okEF && okAP && okLCE,
      documentos: true,
      integracion: true,
      sucursales: true,
      resumen: true,
    };
  }, [productos, enterfac, andespos, lce]);

  const progress = ((STEPS.indexOf(current) + 1) / STEPS.length) * 100;

  /* === Reglas de productos: exclusividad AndesPOS vs Enterbox === */
  const toggleProducto = (key: ProductoKey) => {
    setProductos((prev) => {
      const has = prev.includes(key);
      let next = has ? prev.filter((p) => p !== key) : [...prev, key];
      if (!has) {
        if (key === "ANDESPOS") next = next.filter((p) => p !== "ANDESPOS_ENTERBOX");
        if (key === "ANDESPOS_ENTERBOX") next = next.filter((p) => p !== "ANDESPOS");
      }
      return next;
    });
  };

  /* === Handlers === */
  const handleVistoBueno = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isPdf(file)) {
      setFileError("Solo se permite PDF.");
      setEnterfac((p: any) => ({ ...p, url_visto_bueno: null }));
      setFilePreview("");
      return;
    }
    setFileError("");
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    setEnterfac((p: any) => ({ ...p, url_visto_bueno: file }));
  };

  /* === Guardar === */
  const save = () => {
    // Validaciones layout EF
    if (productos.includes("ENTERFAC")) {
      if (enterfac.layout === "ESTANDAR") {
        if (!enterfac.layout_key) return alert("Debes seleccionar un layout estándar.");
        if (!enterfac.url_layout_selected || !isValidUrl(enterfac.url_layout_selected)) {
          return alert("La URL del layout seleccionado es obligatoria y válida.");
        }
      } else {
        if (!enterfac.url_layout_custom || !isValidUrl(enterfac.url_layout_custom)) {
          return alert("La URL del layout Custom es obligatoria y válida.");
        }
      }
    }

    const payload = {
      productos,
      enterfac: {
        ...enterfac,
        dte_habilitados: enterfac.dte_habilitados,
        layout: enterfac.layout,
        layout_key: enterfac.layout_key,
        url_layout_selected: enterfac.url_layout_selected,
        url_layout_custom: enterfac.url_layout_custom,
        modalidades: {
          general: enterfacGeneral || null,
          porDocumento: enterfacPorDoc,
        },
        integraciones: {
          general: efIntegracionGeneral,
          porDocumento: efIntegracionPorDoc,
          wsTipoPorDocumento: efWsTipoPorDoc,
          batchPorDocumento: Object.fromEntries(
            Object.entries(efBatchPorDoc).map(([k, v]) => [k, { codificacion: v?.codificacion ?? "ANSI", csvNombre: v?.file?.name ?? null }])
          ),
        },
        versiones: {
          // AppFull eliminado
          winPlugin: enterfac.version_winplugin,
          winEmisor: enterfac.version_emisor,
          winEmisorWS: enterfac.version_win_emisor_ws,
          winBatch: enterfac.version_winbatch,
        },
      },
      andespos: {
        ...andespos,
        modalidades: {
          general: andesGeneral || null,
          porDocumento: andesPorDoc,
        },
      },
      lce: {
        libro_diario: lce.libro_diario?.name ?? null,
        plan_cuenta: lce.plan_cuenta?.name ?? null,
        tipos_dte: lce.tipos_dte?.name ?? null,
        centro_responsabilidad: lce.centro_responsabilidad?.name ?? null,
      },
      boxes: (productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) ? boxes : [],
    };

    onSave?.(payload);
    if (empresa?.empkey) navigate(`/empresa/${empresa.empkey}`);
    else alert("Configuración guardada (ver payload en onSave).");
  };
  /* === Render Productos === */
  const renderProductos = () => (
    <div>
      <SectionTitle>Productos contratados</SectionTitle>
      <div className="d-flex gap-3 flex-wrap">
        {(["ENTERFAC", "ANDESPOS", "ANDESPOS_ENTERBOX", "LCE"] as ProductoKey[]).map(p => (
          <div className="form-check" key={p}>
            <input className="form-check-input" type="checkbox" id={`p-${p.toLowerCase()}`}
              checked={productos.includes(p)} onChange={() => toggleProducto(p)} />
            <label className="form-check-label" htmlFor={`p-${p.toLowerCase()}`}>{PRODUCT_LABEL[p]}</label>
          </div>
        ))}
      </div>
      <small className="text-muted d-block mt-2">Puedes marcar uno o varios productos.</small>
    </div>
  );

  /* === Render Identificación === */
  const renderIdentificacion = () => {
    const showTerminal = productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX");
    const titulo = (productos.length === 1 && productos.includes("ANDESPOS"))
      ? "ANDESPOS" : "ENTERFAC / ANDESPOS";
    return (
      <div>
        <SectionTitle>Identificación</SectionTitle>

        {(productos.includes("ENTERFAC") || productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) && (
          <div className="border rounded p-3 mb-3">
            <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>{titulo}</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <FieldLabel required>Empkey</FieldLabel>
                <input className="form-control" inputMode="numeric" pattern="\\d*"
                  value={(productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) ? andespos.empkey : enterfac.empkey}
                  onChange={e => {
                    if (productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX"))
                      setAndespos((p: any) => ({ ...p, empkey: onlyDigits(e.target.value) }));
                    else
                      setEnterfac((p: any) => ({ ...p, empkey: onlyDigits(e.target.value) }));
                  }} />
              </div>

              <div className="col-md-4">
                <FieldLabel required>ReplicaPass</FieldLabel>
                <input className="form-control"
                  value={(productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) ? andespos.replica_password : enterfac.replica_password}
                  onChange={e => {
                    if (productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX"))
                      setAndespos((p: any) => ({ ...p, replica_password: onlyAlnum(e.target.value) }));
                    else
                      setEnterfac((p: any) => ({ ...p, replica_password: onlyAlnum(e.target.value) }));
                  }} />
              </div>

              <div className="col-md-4">
                <FieldLabel required>Pass</FieldLabel>
                <input className="form-control"
                  value={(productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) ? andespos.pass : enterfac.pass}
                  onChange={e => {
                    if (productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX"))
                      setAndespos((p: any) => ({ ...p, pass: onlyAlnum(e.target.value) }));
                    else
                      setEnterfac((p: any) => ({ ...p, pass: onlyAlnum(e.target.value) }));
                  }} />
              </div>

              <div className="col-md-6">
                <FieldLabel>Casilla de intercambio (opcional)</FieldLabel>
                <input className="form-control"
                  value={(productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) ? (andespos.casilla_intercambio || "") : (enterfac.casilla_intercambio || "")}
                  onChange={e => {
                    if (productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX"))
                      setAndespos((p: any) => ({ ...p, casilla_intercambio: e.target.value }));
                    else
                      setEnterfac((p: any) => ({ ...p, casilla_intercambio: e.target.value }));
                  }} />
              </div>

              {showTerminal && (
                <div className="col-md-3">
                  <FieldLabel>Terminal ID</FieldLabel>
                  <input className="form-control" value={andespos.terminal_id}
                    onChange={e => setAndespos((p: any) => ({ ...p, terminal_id: e.target.value }))} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* LCE */}
        {productos.includes("LCE") && (
          <div className="border rounded p-3">
            <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>LCE</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <FieldLabel required>Libro Diario (.csv)</FieldLabel>
                <input type="file" accept=".csv,text/csv" className="form-control"
                  onChange={e => setLce(prev => ({ ...prev, libro_diario: e.target.files?.[0] ?? null }))} />
              </div>
              <div className="col-md-6">
                <FieldLabel required>Plan de Cuenta (.csv)</FieldLabel>
                <input type="file" accept=".csv,text/csv" className="form-control"
                  onChange={e => setLce(prev => ({ ...prev, plan_cuenta: e.target.files?.[0] ?? null }))} />
              </div>
              <div className="col-md-6">
                <FieldLabel>Tipos de DTE (.csv) — opcional</FieldLabel>
                <input type="file" accept=".csv,text/csv" className="form-control"
                  onChange={e => setLce(prev => ({ ...prev, tipos_dte: e.target.files?.[0] ?? null }))} />
              </div>
              <div className="col-md-6">
                <FieldLabel>Centro de responsabilidad (.csv) — opcional</FieldLabel>
                <input type="file" accept=".csv,text/csv" className="form-control"
                  onChange={e => setLce(prev => ({ ...prev, centro_responsabilidad: e.target.files?.[0] ?? null }))} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* === Render Documentos === */
  const renderDocumentos = () => {
    const labelDte = (d: { id: DteKey; nombre: string }) =>
      (d.id === "Comanda" || d.id === "TNT") ? d.nombre : `${d.nombre} (${d.id})`;

    const integraciones: IntegracionTipo[] = ["Transferencia de Archivo", "Batch", "Web Service", "Web"];

    return (
      <div>
        <SectionTitle>Documentos & Layout</SectionTitle>

        {/* ENTERFACT */}
        {productos.includes("ENTERFAC") && (
          <div className="border rounded p-3 mb-3">
            <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ENTERFACT</h6>
            <div className="row g-3">
              {/* Visto Bueno (solo PDF) */}
              <div className="col-md-6">
                <FieldLabel>Archivo Visto Bueno (solo PDF)</FieldLabel>
                <input type="file" accept="application/pdf,.pdf" className="form-control" onChange={handleVistoBueno} />
                {fileError && <div className="invalid-feedback d-block">{fileError}</div>}
                {filePreview && (
                  <div className="mt-3">
                    <iframe src={filePreview} width="100%" height="400px" title="Vista previa del PDF" />
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <FieldLabel>URL Membrete</FieldLabel>
                <input className="form-control" placeholder="https://..." type="url"
                  value={enterfac.url_membrete}
                  onChange={e => setEnterfac((p: any) => ({ ...p, url_membrete: e.target.value }))} />
              </div>

              {/* Layout Enterfact */}
              <div className="col-12 mt-2">
                <FieldLabel>Tipo de Layout</FieldLabel>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" id="ly-est"
                      checked={enterfac.layout === "ESTANDAR"}
                      onChange={() => setEnterfac((p: any) => ({ ...p, layout: "ESTANDAR", url_layout_custom: "" }))} />
                    <label className="form-check-label" htmlFor="ly-est">Estandar</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" id="ly-cus"
                      checked={enterfac.layout === "CUSTOM"}
                      onChange={() => setEnterfac((p: any) => ({ ...p, layout: "CUSTOM", layout_key: "", url_layout_selected: "" }))} />
                    <label className="form-check-label" htmlFor="ly-cus">Custom</label>
                  </div>
                </div>
              </div>

              {enterfac.layout === "ESTANDAR" && (
                <>
                  <div className="col-md-6">
                    <FieldLabel>Seleccionar Layout</FieldLabel>
                    <select className="form-select" value={enterfac.layout_key}
                      onChange={e => {
                        const key = e.target.value;
                        const found = LAYOUTS_ENTERFACT.find(l => l.key === key);
                        setEnterfac((p: any) => ({ ...p, layout_key: key, url_layout_selected: found?.url ?? "" }));
                      }}>
                      <option value="">Seleccione layout...</option>
                      {LAYOUTS_ENTERFACT.map(l => <option key={l.key} value={l.key}>{l.nombre}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <FieldLabel>URL del layout seleccionado</FieldLabel>
                    <input className="form-control" placeholder="https://..." type="url"
                      value={enterfac.url_layout_selected}
                      onChange={e => setEnterfac((p: any) => ({ ...p, url_layout_selected: e.target.value }))} />
                  </div>
                </>
              )}

              {enterfac.layout === "CUSTOM" && (
                <div className="col-md-12">
                  <FieldLabel>URL del Layout personalizado</FieldLabel>
                  <input className="form-control" placeholder="https://..." type="url"
                    value={enterfac.url_layout_custom}
                    onChange={e => setEnterfac((p: any) => ({ ...p, url_layout_custom: e.target.value }))} />
                </div>
              )}

              {/* DTE Habilitados – Nacionales */}
              <div className="col-12 mt-3">
                <FieldLabel>DTE Habilitados – Nacionales</FieldLabel>
                <div className="row gy-2">
                  {DTE_CATALOGO["Nacionales"].map(d => (
                    <div className="col-md-4 col-lg-3" key={d.id}>
                      <input type="checkbox" className="form-check-input me-2"
                        checked={enterfac.dte_habilitados?.includes(d.id) || false}
                        onChange={e => {
                          const curr = enterfac.dte_habilitados || [];
                          setEnterfac((p: any) => ({
                            ...p,
                            dte_habilitados: e.target.checked
                              ? [...curr, d.id]
                              : curr.filter((id: DteKey) => id !== d.id),
                          }));
                        }} />
                      {labelDte(d)}
                    </div>
                  ))}
                </div>
              </div>

              {/* DTE Habilitados – Exportación */}
              <div className="col-12 mt-3">
                <FieldLabel>DTE Habilitados – Exportación</FieldLabel>
                <div className="row gy-2">
                  {DTE_CATALOGO["Exportación"].map(d => (
                    <div className="col-md-4 col-lg-3" key={d.id}>
                      <input type="checkbox" className="form-check-input me-2"
                        checked={enterfac.dte_habilitados?.includes(d.id) || false}
                        onChange={e => {
                          const curr = enterfac.dte_habilitados || [];
                          setEnterfac((p: any) => ({
                            ...p,
                            dte_habilitados: e.target.checked
                              ? [...curr, d.id]
                              : curr.filter((id: DteKey) => id !== d.id),
                          }));
                        }} />
                      {labelDte(d)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modalidad de Emisión — ENTERFACT */}
              <div className="col-12 mt-4">
                <FieldLabel>Modalidad de Emisión — General (por documento)</FieldLabel>
                <select
                  className="form-select mb-3"
                  value={enterfacGeneral}
                  onChange={(e) => setEnterfacGeneral(e.target.value as "" | ModalidadEnterfac)}
                >
                  <option value="">(Sin general)</option>
                  <option value="Online">Online</option>
                  <option value="Online Web">Online Web</option>
                  <option value="Offline">Offline</option>
                  <option value="Offline Web">Offline Web</option>
                  <option value="Ciega">Ciega</option>
                </select>

                {((enterfac.dte_habilitados || []) as DteKey[]).map((id) => {
                  const meta = [...DTE_CATALOGO["Nacionales"], ...DTE_CATALOGO["Exportación"]].find(x => x.id === id);
                  if (!meta) return null;
                  const label = `${meta.nombre} (${meta.id})`;
                  return (
                    <div key={id} className="row g-2 align-items-center mb-2">
                      <div className="col-md-6">{label}</div>
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={enterfacPorDoc[id] || ""}
                          onChange={(e) => setEnterfacPorDoc((prev) => ({ ...prev, [id]: e.target.value as ModalidadEnterfac }))}
                        >
                          <option value="">{`(Usar General${enterfacGeneral ? `: ${enterfacGeneral}` : ""})`}</option>
                          <option value="Online">Online</option>
                          <option value="Online Web">Online Web</option>
                          <option value="Offline">Offline</option>
                          <option value="Offline Web">Offline Web</option>
                          <option value="Ciega">Ciega</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Integración por documento — ENTERFACT */}
              <div className="col-12 mt-4">
                <FieldLabel>Tipo de Integración — General (multi-selección)</FieldLabel>
                <div className="d-flex flex-wrap gap-3 mb-3">
                  {integraciones.map(int => {
                    const checked = efIntegracionGeneral.includes(int);
                    return (
                      <div className="form-check" key={int}>
                        <input
                          className="form-check-input" type="checkbox" id={`ef-int-gen-${int}`}
                          checked={checked}
                          onChange={(e) => {
                            setEfIntegracionGeneral(prev => e.target.checked ? [...prev, int] : prev.filter(x => x !== int));
                          }}
                        />
                        <label className="form-check-label" htmlFor={`ef-int-gen-${int}`}>{int}</label>
                      </div>
                    );
                  })}
                </div>

                {((enterfac.dte_habilitados || []) as DteKey[]).map((id) => {
                  const meta = [...DTE_CATALOGO["Nacionales"], ...DTE_CATALOGO["Exportación"]].find(x => x.id === id);
                  if (!meta) return null;
                  const eff = efIntegracionPorDoc[id] ?? efIntegracionGeneral;
                  const hasWS = (eff || []).includes("Web Service");
                  return (
                    <div key={id} className="border rounded p-2 mb-2">
                      <div className="mb-2"><strong>{meta.nombre} ({meta.id})</strong></div>
                      <div className="d-flex flex-wrap gap-3">
                        {integraciones.map(int => {
                          const checked = (efIntegracionPorDoc[id] ?? []).includes(int);
                          return (
                            <div className="form-check" key={`${id}-${int}`}>
                              <input
                                className="form-check-input" type="checkbox" id={`ef-int-${id}-${int}`}
                                checked={checked}
                                onChange={(e) => {
                                  setEfIntegracionPorDoc(prev => {
                                    const curr = prev[id] ?? [];
                                    const next = e.target.checked ? Array.from(new Set([...curr, int])) : curr.filter(x => x !== int);
                                    return { ...prev, [id]: next };
                                  });
                                }}
                              />
                              <label className="form-check-label" htmlFor={`ef-int-${id}-${int}`}>{int}</label>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tipo de WS cuando corresponda */}
                      {(hasWS || (efIntegracionPorDoc[id] || []).includes("Web Service")) && (
                        <div className="mt-2">
                          <FieldLabel>Tipo de Web Service</FieldLabel>
                          <select
                            className="form-select"
                            value={efWsTipoPorDoc[id] || ""}
                            onChange={(e) => setEfWsTipoPorDoc(prev => ({ ...prev, [id]: e.target.value as WebServiceTipo }))}
                          >
                            <option value="">Seleccione</option>
                            <option value="REST">API REST</option>
                            <option value="SOAP">SOAP</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Admin de Folios (a elección del ejecutivo) */}
              <div className="col-12 mt-3">
                <FieldLabel>Administrador de Folios</FieldLabel>
                <select className="form-select" value={enterfac.admin_folios}
                  onChange={e => setEnterfac((p: any) => ({ ...p, admin_folios: e.target.value }))}>
                  <option value="EN">Enternet</option>
                  <option value="CL">Cliente</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ANDESPOS / ENTERBOX */}
        {(productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) && (
          <div className="border rounded p-3">
            <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>
              {productos.includes("ANDESPOS_ENTERBOX") ? "ANDESPOS ENTERBOX" : "ANDESPOS"}
            </h6>
            <div className="row g-3">
              <div className="col-md-4">
                <FieldLabel>URL del Layout</FieldLabel>
                <input className="form-control" placeholder="https://..." type="url"
                  value={andespos.layout_url || ""}
                  onChange={e => setAndespos((p: any) => ({ ...p, layout_url: e.target.value }))} />
              </div>

              <div className="col-md-4">
                <FieldLabel>Modalidad de Impresión</FieldLabel>
                <select className="form-select" value={andespos.formato_impresion}
                  onChange={e => setAndespos((p: any) => ({ ...p, formato_impresion: e.target.value }))}>
                  <option value="TERMICA">Térmica</option>
                  <option value="LASER">Láser(Web)</option>
                  <option value="NOIMPRIME">No Imprime</option>
                </select>
              </div>

              {/* DTE: Nacionales */}
              <div className="col-12 mt-3">
                <FieldLabel>Documentos Nacionales</FieldLabel>
                <div className="row gy-2">
                  {DTE_CATALOGO["Nacionales"].map(d => (
                    <div className="col-md-4 col-lg-3" key={d.id}>
                      <input type="checkbox" className="form-check-input me-2"
                        checked={andespos.dte_habilitados?.includes(d.id) || false}
                        onChange={e => {
                          const curr = andespos.dte_habilitados || [];
                          setAndespos((p: any) => ({
                            ...p,
                            dte_habilitados: e.target.checked
                              ? [...curr, d.id]
                              : curr.filter((id: DteKey) => id !== d.id),
                          }));
                        }} />
                      {labelDte(d)}
                    </div>
                  ))}
                </div>
              </div>

              {/* DTE: No tributarios */}
              <div className="col-12 mt-3">
                <FieldLabel>Documentos No Tributarios</FieldLabel>
                <div className="row gy-2">
                  {DTE_CATALOGO["No tributarios"].map(d => (
                    <div className="col-md-4 col-lg-3" key={d.id}>
                      <input type="checkbox" className="form-check-input me-2"
                        checked={andespos.dte_habilitados?.includes(d.id) || false}
                        onChange={e => {
                          const curr = andespos.dte_habilitados || [];
                          setAndespos((p: any) => ({
                            ...p,
                            dte_habilitados: e.target.checked
                              ? [...curr, d.id]
                              : curr.filter((id: DteKey) => id !== d.id),
                          }));
                        }} />
                      {labelDte(d)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modalidad de Emisión — ANDES (General + overrides) */}
              <div className="col-12 mt-3">
                <FieldLabel>Modalidad de Emisión — General (por documento)</FieldLabel>
                <select
                  className="form-select mb-3"
                  value={andesGeneral}
                  onChange={(e) => setAndesGeneral(e.target.value as "" | "Offline Web" | "Ciega")}
                >
                  <option value="">(Sin general)</option>
                  <option value="Offline Web">Offline Web</option>
                  <option value="Ciega">Ciega</option>
                </select>

                {(andespos.dte_habilitados || []).map((id: DteKey) => {
                  const meta = [...DTE_CATALOGO["Nacionales"], ...DTE_CATALOGO["No tributarios"]].find(x => x.id === id);
                  if (!meta) return null;
                  return (
                    <div key={id} className="row g-2 align-items-center mb-2">
                      <div className="col-md-6">{labelDte({ id, nombre: meta.nombre })}</div>
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={andesPorDoc[id] || ""}
                          onChange={(e) => setAndesPorDoc((prev) => ({ ...prev, [id]: e.target.value as "Offline Web" | "Ciega" }))}
                        >
                          <option value="">{`(Usar General${andesGeneral ? `: ${andesGeneral}` : ""})`}</option>
                          <option value="Offline Web">Offline Web</option>
                          <option value="Ciega">Ciega</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  /* === Render Integración === */
  const renderIntegracion = () => (
    <div>
      <SectionTitle>Integración & Versionado</SectionTitle>

      {/* ENTERFACT */}
      {productos.includes("ENTERFAC") && (
        <div className="border rounded p-3 mb-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ENTERFACT</h6>
          <div className="row g-3">

            {/* Tipo de Mensaje */}
            <div className="col-md-3">
              <FieldLabel>Tipo de Mensaje</FieldLabel>
              <select
                className="form-select"
                value={enterfac.tipo_texto}
                onChange={(e) => {
                  const val = e.target.value;
                  let parser = "";
                  if (val === "XMLCUSTOM" || val === "TXTCUSTOM") parser = "SI";
                  if (val === "XMLV5" || val === "TXTV5") parser = "NO";
                  setEnterfac((p: any) => ({ ...p, tipo_texto: val, parser }));
                }}
              >
                <option value="">Seleccione</option>
                <option value="XMLV5">XML V5</option>
                <option value="TXTV5">TXT V5</option>
                <option value="XMLCUSTOM">XML CUSTOM</option>
                <option value="TXTCUSTOM">TXT CUSTOM</option>
              </select>
            </div>
            {enterfac.parser && (
              <div className="col-md-3">
                <FieldLabel>Parser</FieldLabel>
                <input className="form-control" readOnly value={enterfac.parser} />
              </div>
            )}

            {/* Firma */}
            <div className="col-md-3">
              <FieldLabel>Modalidad de Firma</FieldLabel>
              <select
                className="form-select"
                value={enterfac.modalidad_firma}
                onChange={(e) => setEnterfac((p: any) => ({ ...p, modalidad_firma: e.target.value }))}
              >
                <option value="NUBE">Nube</option>
                <option value="LOCAL">Local</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Tipo de Firma</FieldLabel>
              <select
                className="form-select"
                value={enterfac.tipo_firma || ""}
                onChange={(e) => setEnterfac((p: any) => ({ ...p, tipo_firma: e.target.value }))}
              >
                <option value="CONTROLADA">Controlada</option>
                <option value="AUTOMATICA">Automática</option>
              </select>
            </div>

            {/* Batch por documento (CAM + Codificación + preview) */}
            <div className="col-12">
              <SectionTitle>Configuración Batch por Documento</SectionTitle>
              {((enterfac.dte_habilitados || []) as DteKey[])
                .filter((id) => (efIntegracionPorDoc[id] ?? efIntegracionGeneral).includes("Batch"))
                .map((id) => {
                  const meta = [...DTE_CATALOGO["Nacionales"], ...DTE_CATALOGO["Exportación"]].find(x => x.id === id);
                  const cfg = efBatchPorDoc[id] ?? { file: null, codificacion: "ANSI", preview: [] };
                  return (
                    <div key={id} className="border rounded p-2 mb-3">
                      <div className="mb-2"><strong>{meta?.nombre} ({id})</strong></div>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <FieldLabel>CAM (.csv)</FieldLabel>
                          <input
                            type="file" className="form-control" accept=".csv,text/csv"
                            onChange={(e) => handleCsvPerDoc(id, e.target.files?.[0] ?? null, cfg.codificacion)}
                          />
                        </div>
                        <div className="col-md-3">
                          <FieldLabel>Codificación</FieldLabel>
                          <select
                            className="form-select"
                            value={cfg.codificacion}
                            onChange={(e) => {
                              const cod = e.target.value as "ANSI" | "UTF-8";
                              const f = cfg.file ?? null;
                              handleCsvPerDoc(id, f, cod);
                            }}
                          >
                            <option value="ANSI">ANSI</option>
                            <option value="UTF-8">UTF-8</option>
                          </select>
                        </div>
                        {!!cfg.preview.length && (
                          <div className="col-12">
                            <div className="table-responsive">
                              <table className="table table-sm table-bordered">
                                <tbody>
                                  {cfg.preview.map((row, i) => (
                                    <tr key={i}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Versionado Enterfact (sin AppFull) */}
            <div className="col-md-3">
              <FieldLabel>Versión WinPlugin</FieldLabel>
              <select
                className="form-select"
                value={enterfac.version_winplugin}
                onChange={(e) => setEnterfac((p: any) => ({ ...p, version_winplugin: e.target.value }))}
              >
                <option value="">Seleccione</option>
                {["20230401","20230809","20231103","20240227","20240820","20250321"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión WinEmisor</FieldLabel>
              <select
                className="form-select"
                value={enterfac.version_emisor}
                onChange={(e) => setEnterfac((p: any) => ({ ...p, version_emisor: e.target.value }))}
              >
                <option value="">Seleccione</option>
                {["20230615","20231003","20231109","20240930","20241004"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión WinEmisor WS</FieldLabel>
              <select
                className="form-select"
                value={enterfac.version_win_emisor_ws}
                onChange={(e) => setEnterfac((p: any) => ({ ...p, version_win_emisor_ws: e.target.value }))}
              >
                <option value="">Seleccione</option>
                {["20230101","20230518","20230821","20231003","20231106","20240124","20240927","20241004","20250121"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión WinBatch</FieldLabel>
              <select
                className="form-select"
                value={enterfac.version_winbatch}
                onChange={(e) => setEnterfac((p: any) => ({ ...p, version_winbatch: e.target.value }))}
              >
                <option value="">Seleccione</option>
                {["20230522","20230710","20230821","20231106","20240717","20240806"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ANDESPOS / ENTERBOX — sin “Modalidad de Emisión” aquí */}
      {(productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) && (
        <div className="border rounded p-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ANDESPOS / ENTERBOX</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <FieldLabel>Modalidad de Firma</FieldLabel>
              <select className="form-select" value={andespos.modalidad_firma}
                onChange={e => setAndespos((p: any) => ({ ...p, modalidad_firma: e.target.value }))}>
                <option value="NUBE">Nube</option>
                <option value="LOCAL">Local</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Tipo de Firma</FieldLabel>
              <select className="form-select" value={andespos.tipo_firma || ""}
                onChange={e => setAndespos((p: any) => ({ ...p, tipo_firma: e.target.value }))}>
                <option value="CONTROLADA">Controlada</option>
                <option value="AUTOMATICA">Automática</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Tipo de Mensaje</FieldLabel>
              <select className="form-select" value={andespos.tipo_texto || ""}
                onChange={e => setAndespos((p: any) => ({ ...p, tipo_texto: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="XMLV5">XML V5</option>
                <option value="TXTV5">TXT V5</option>
                <option value="XMLCUSTOM">XML Custom</option>
                <option value="TXTCUSTOM">TXT Custom</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>Administrador de Folios</FieldLabel>
              <select className="form-select" value={andespos.admin_folios}
                onChange={e => setAndespos((p: any) => ({ ...p, admin_folios: e.target.value }))}>
                <option value="EN">Enternet</option>
                <option value="CL">Cliente</option>
              </select>
            </div>
            <div className="col-md-3">
              <FieldLabel>WinEmisor POS — Versión</FieldLabel>
              <select
                className="form-select"
                value={andespos.version_emisor}
                onChange={(e) => setAndespos((p: any) => ({ ...p, version_emisor: e.target.value }))}
              >
                <option value="">Seleccione</option>
                {["2408","2503"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* === Render Sucursales === */
  const renderSucursales = () => {
    const isEnterbox = productos.includes("ANDESPOS_ENTERBOX");
    const isAndesPOS = productos.includes("ANDESPOS");

    return (
      <div>
        <SectionTitle>Sucursales</SectionTitle>

        {/* AndesPOS: módulo placeholder (obligatorio pero sin contenido) */}
        {isAndesPOS && !isEnterbox && (
          <div className="alert alert-info">
            Este módulo de sucursales para <strong>AndesPOS</strong> está creado pero <em>sin contenido</em> por ahora.
          </div>
        )}

        {/* AndesPOS Enterbox: nuevos campos por sucursal */}
        {isEnterbox && (
          <>
            <div className="mb-3">
              <FieldLabel>Cantidad de Sucursales</FieldLabel>
              <input
                type="number" className="form-control" min={1}
                value={boxes.length || 1}
                onChange={e => setBoxes(Array.from({ length: Math.max(1, Number(e.target.value || 1)) }, (_, i) => boxes[i] || {}))}
              />
            </div>
            {boxes.map((box, i) => (
              <div key={i} className="card p-3 mb-3">
                <h6>Sucursal #{i + 1}</h6>
                <div className="row g-3">
                  <div className="col-md-3"><FieldLabel>ID BOX</FieldLabel>
                    <input className="form-control" value={box.idBox || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], idBox: e.target.value }; return n; })} />
                  </div>
                  <div className="col-md-3"><FieldLabel>Punto de Acceso Key</FieldLabel>
                    <input className="form-control" value={box.puntoAccesoKey || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], puntoAccesoKey: e.target.value }; return n; })} />
                  </div>
                  <div className="col-md-3"><FieldLabel>Router</FieldLabel>
                    <input className="form-control" value={box.router || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], router: e.target.value }; return n; })} />
                  </div>
                  <div className="col-md-3"><FieldLabel>IP</FieldLabel>
                    <input className="form-control" value={box.ip || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], ip: e.target.value }; return n; })} />
                  </div>
                  <div className="col-md-3"><FieldLabel>MAC eth0</FieldLabel>
                    <input className="form-control" value={box.macEth0 || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], macEth0: e.target.value }; return n; })} />
                  </div>
                  <div className="col-md-3"><FieldLabel>MAC wlan0</FieldLabel>
                    <input className="form-control" value={box.macWlan0 || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], macWlan0: e.target.value }; return n; })} />
                  </div>
                  <div className="col-md-3"><FieldLabel>Tipo de Box</FieldLabel>
                    <select className="form-select" value={box.tipoBox || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], tipoBox: e.target.value }; return n; })}>
                      <option value="">Seleccione</option>
                      <option value="PI3">PI3</option>
                      <option value="PI4">PI4</option>
                    </select>
                  </div>
                  <div className="col-md-3"><FieldLabel>POS Box Versión</FieldLabel>
                    <input className="form-control" placeholder="Ej: 1.0.0" value={box.posBoxVersion || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], posBoxVersion: e.target.value }; return n; })} />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

/* === Render Resumen === */
function renderResumen() {
  const nombreDte = (id: DteKey) => {
    const n = [
      ...DTE_CATALOGO["Nacionales"],
      ...DTE_CATALOGO["Exportación"],
      ...DTE_CATALOGO["No tributarios"],
    ].find(d => d.id === id);
    if (!n) return id;
    return (id === "Comanda" || id === "TNT") ? n.nombre : `${n.nombre} (${id})`;
  };

  const efDtesSel = (enterfac.dte_habilitados || []) as DteKey[];
  const apDtesSel = (andespos.dte_habilitados || []) as DteKey[];

  return (
    <div>
      <SectionTitle>Resumen Final</SectionTitle>

      {/* Productos */}
      <div className="card mb-3">
        <div className="card-body">
          <strong>Productos seleccionados:</strong>{" "}
          {productos.length ? productos.map(p => <Chip key={p}>{PRODUCT_LABEL[p]}</Chip>) : dash}
        </div>
      </div>

      {/* ENTERFACT */}
      {productos.includes("ENTERFAC") && (
        <div className="card mb-3">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>ENTERFACT</div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-4"><strong>Empkey:</strong> {fmt(enterfac.empkey)}</div>
              <div className="col-md-4"><strong>ReplicaPass:</strong> {fmt(enterfac.replica_password)}</div>
              <div className="col-md-4"><strong>Pass:</strong> {fmt(enterfac.pass)}</div>
              <div className="col-md-6"><strong>Casilla de intercambio:</strong> {fmt(enterfac.casilla_intercambio)}</div>

              <div className="col-md-6"><strong>Archivo Visto Bueno:</strong> {enterfac.url_visto_bueno?.name ? enterfac.url_visto_bueno.name : dash}</div>
              <div className="col-md-6"><strong>URL Membrete:</strong> {fmt(enterfac.url_membrete)}</div>
              <div className="col-md-4"><strong>Layout:</strong> {fmt(enterfac.layout)}</div>
              {enterfac.layout === "ESTANDAR" && (
                <>
                  <div className="col-md-4"><strong>Layout Key:</strong> {fmt(enterfac.layout_key)}</div>
                  <div className="col-md-4"><strong>URL Layout:</strong> {fmt(enterfac.url_layout_selected)}</div>
                </>
              )}
              {enterfac.layout === "CUSTOM" && (
                <div className="col-md-8"><strong>URL Layout Custom:</strong> {fmt(enterfac.url_layout_custom)}</div>
              )}

              <div className="col-12 mt-2">
                <strong>DTE Habilitados:</strong>
                <div>{efDtesSel.length ? efDtesSel.map(id => <Chip key={id}>{id}</Chip>) : dash}</div>
              </div>

              {/* (Cuando añadamos modalidad por doc/integración en EF, se imprime aquí) */}
              <div className="col-12 mt-2">
                <strong>Modalidad de Emisión:</strong> <span className="ms-2 text-muted">—</span>
              </div>

              {/* Integraciones por documento (solo si ya las tienes en estado; si no, queda en —) */}
              <div className="col-12 mt-2">
                <strong>Integraciones por Documento:</strong> <span className="ms-2 text-muted">—</span>
              </div>

              <div className="col-md-3"><strong>Tipo de Mensaje:</strong> {fmt(enterfac.tipo_texto)}</div>
              <div className="col-md-3"><strong>Parser:</strong> {fmt(enterfac.parser)}</div>
              <div className="col-md-3"><strong>Modalidad de Firma:</strong> {fmt(enterfac.modalidad_firma)}</div>
              <div className="col-md-3"><strong>Administrador de Folios:</strong> {fmt(enterfac.admin_folios)}</div>

              <div className="col-md-3"><strong>WinPlugin:</strong> {fmt(enterfac.version_winplugin)}</div>
              <div className="col-md-3"><strong>WinEmisor:</strong> {fmt(enterfac.version_emisor)}</div>
              <div className="col-md-3"><strong>WinEmisor WS:</strong> {fmt(enterfac.version_win_emisor_ws)}</div>
              <div className="col-md-3"><strong>WinBatch:</strong> {fmt(enterfac.version_winbatch)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ANDESPOS / ENTERBOX */}
      {(productos.includes("ANDESPOS") || productos.includes("ANDESPOS_ENTERBOX")) && (
        <div className="card mb-3">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>
            {productos.includes("ANDESPOS_ENTERBOX") ? "ANDESPOS ENTERBOX" : "ANDESPOS"}
          </div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-4"><strong>Empkey:</strong> {fmt(andespos.empkey)}</div>
              <div className="col-md-4"><strong>ReplicaPass:</strong> {fmt(andespos.replica_password)}</div>
              <div className="col-md-4"><strong>Pass:</strong> {fmt(andespos.pass)}</div>
              <div className="col-md-4"><strong>Encargado FA:</strong> {fmt(andespos.encargado_fa)}</div>
              <div className="col-md-4"><strong>Terminal ID:</strong> {fmt(andespos.terminal_id)}</div>

              <div className="col-md-4"><strong>URL Layout:</strong> {fmt(andespos.layout_url)}</div>
              <div className="col-md-4"><strong>Modalidad Impresión:</strong> {fmt(andespos.formato_impresion)}</div>

              <div className="col-12 mt-2">
                <strong>DTE Habilitados:</strong>
                <div>{apDtesSel.length ? apDtesSel.map(id => <Chip key={id}>{id}</Chip>) : dash}</div>
              </div>

              {/* Modalidad de Emisión — General + overrides */}
              <div className="col-12 mt-2">
                <strong>Modalidad de Emisión:</strong>
                <div className="mt-1">
                  <div className="mb-1">
                    <Chip>General</Chip>
                    <Chip>{andesGeneral || "—"}</Chip>
                  </div>
                  {apDtesSel.length
                    ? apDtesSel.map((id: DteKey) => (
                        <div key={`ap-mode-${id}`} className="mb-1">
                          <Chip>{nombreDte(id)}</Chip>
                          <Chip>{andesPorDoc[id] || andesGeneral || "—"}</Chip>
                        </div>
                      ))
                    : <span>{dash}</span>}
                </div>
              </div>

              <div className="col-md-3"><strong>Modalidad de Firma:</strong> {fmt(andespos.modalidad_firma)}</div>
              <div className="col-md-3"><strong>Tipo de Firma:</strong> {fmt(andespos.tipo_firma)}</div>
              <div className="col-md-3"><strong>Tipo de Mensaje:</strong> {fmt(andespos.tipo_texto)}</div>
              <div className="col-md-3"><strong>Administrador de Folios:</strong> {fmt(andespos.admin_folios)}</div>
              <div className="col-md-3"><strong>WinEmisor POS:</strong> {fmt(andespos.version_emisor)}</div>
            </div>
          </div>
        </div>
      )}

      {/* LCE */}
      {productos.includes("LCE") && (
        <div className="card mb-3">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>LCE</div>
          <div className="card-body">
            <p>Este producto no requiere configuración adicional.</p>
          </div>
        </div>
      )}

      {/* Sucursales (Enterbox) */}
      {productos.includes("ANDESPOS_ENTERBOX") && boxes?.length > 0 && (
        <div className="card">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>Sucursales Configuradas</div>
          <div className="card-body">
            {boxes.map((b: any, i: number) => (
              <div key={i} className="border rounded p-3 mb-2">
                <strong>Sucursal #{i + 1}</strong>
                <div className="row g-2 mt-1">
                  <div className="col-md-3"><strong>ID Box:</strong> {fmt(b?.idBox)}</div>
                  <div className="col-md-3"><strong>Router:</strong> {fmt(b?.router)}</div>
                  <div className="col-md-3"><strong>IP:</strong> {fmt(b?.ip)}</div>
                  <div className="col-md-3"><strong>Versión Enterbox:</strong> {fmt(b?.enterbox)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
  /* === Render Principal === */
  return (
    <div style={{ maxWidth: 900, margin: "2rem auto" }}>
      <PageHeading>Onboarding – Configuración de Empresa</PageHeading>
      <div className="mb-2 small text-muted d-flex align-items-center gap-2">
        <div className="flex-grow-1 progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span style={{ minWidth: 70, textAlign: "right" }}>{Math.round(progress)}%</span>
      </div>

      <Tabs value={current} onValueChange={(v) => go(v as StepKey)}>
        <TabsList>{STEPS.map(s => <TabsTrigger key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</TabsTrigger>)}</TabsList>
        <TabsContent value="productos">{renderProductos()}</TabsContent>
        <TabsContent value="identificacion">{renderIdentificacion()}</TabsContent>
        <TabsContent value="documentos">{renderDocumentos()}</TabsContent>
        <TabsContent value="integracion">{renderIntegracion()}</TabsContent>
        {STEPS.includes("sucursales") && <TabsContent value="sucursales">{renderSucursales()}</TabsContent>}
        <TabsContent value="resumen">{renderResumen()}</TabsContent>
      </Tabs>

      <div className="sticky-bottom bg-white border-top py-3" style={{ position: "sticky", bottom: 0, zIndex: 5 }}>
        <div className="d-flex justify-content-between" style={{ maxWidth: 900, margin: "0 auto" }}>
          <button type="button" className="btn btn-outline-primary" onClick={prev} disabled={STEPS[0] === current}>Atrás</button>
          {current !== "resumen"
            ? <button type="button" className="btn btn-primary" onClick={next} disabled={!stepValid[current]}>Siguiente</button>
            : <button type="button" className="btn btn-gradient" onClick={save}>Guardar y Enviar</button>}
        </div>
      </div>
    </div>
  );
}
