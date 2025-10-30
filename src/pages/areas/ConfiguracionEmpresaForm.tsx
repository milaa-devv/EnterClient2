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
  return (
    <h4 className="font-primary mb-3"
      style={{ fontSize: "1.25rem", fontWeight: 600 }}>
      {children}
    </h4>
  );
}

function PageHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-primary text-gradient mb-3"
      style={{ fontSize: "2rem", fontWeight: 700 }}>
      {children}
    </h2>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label
      className={`form-label font-primary ${required ? "required" : ""}`}
      style={{ fontSize: ".875rem", fontWeight: 600 }}
    >
      {children}
    </label>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-2 py-1 me-2 mb-2 d-inline-block"
      style={{
        background: "var(--color-border-light)",
        border: "1px solid var(--color-border)",
        borderRadius: 999,
        fontSize: ".8rem",
        fontWeight: 600
      }}
    >
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
  const setValue = useCallback(
    (v: string) => { onValueChange ? onValueChange(v) : setInternal(v); },
    [onValueChange]
  );
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
        type="button"
        role="tab"
        aria-selected={active}
        aria-controls={`${ctx.idBase}-panel-${value}`}
        id={`${ctx.idBase}-tab-${value}`}
        className={"nav-link" + (active ? " active" : "")}
        onClick={() => ctx.setValue(value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const vals = ctx.valuesRef.current;
            const i = vals.indexOf(ctx.value);
            if (i >= 0 && vals.length > 1) {
              ctx.setValue(e.key === "ArrowRight"
                ? vals[(i + 1) % vals.length]
                : vals[(i - 1 + vals.length) % vals.length]);
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
    <div
      role="tabpanel"
      id={`${ctx.idBase}-panel-${value}`}
      aria-labelledby={`${ctx.idBase}-tab-${value}`}
      hidden={hidden}
      className="card shadow-sm mb-4"
    >
      {!hidden && <div className="card-body">{children}</div>}
    </div>
  );
}

/* ===== Validadores ===== */
const onlyDigits = (s: string) => s.replace(/\D+/g, "");
const onlyAlnum = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");

/* ================= Form principal ================= */
type Props = { empresa?: any; onSave: (data: any) => void };

export default function ConfiguracionEmpresaForm({ empresa, onSave }: Props) {
  useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();

  /* === Estados === */
  const empresaProducts: string[] =
    (empresa?.productos && Array.isArray(empresa.productos) && empresa.productos.length)
      ? empresa.productos
      : empresa?.producto ? [empresa.producto] : ["ENTERFAC"];

  const [productos, setProductos] = useState<string[]>(empresaProducts);

  const [enterfac, setEnterfac] = useState<any>({
    empkey: "", replica_password: "", pass: "", casilla_intercambio: "",
    url_visto_bueno: "", url_membrete: "", layout: "ESTANDAR", dte_habilitados: [],
    integracion: "", tipo_ws: "", tipo_texto: "", parser: "",
    modalidad_firma: "CONTROLADA", modalidad_emision: "ONLINE", admin_folios: "EN",
    version_emisor: "", version_app_full: "", version_winplugin: "", version_winbatch: "",
    ...empresa?.onboarding?.configuracionEmpresa?.enterfac,
  });

  const [andespos, setAndespos] = useState<any>({
    empkey: "", replica_password: "", pass: "", encargado_fa: "", terminal_id: "",
    layout: "ESTANDAR", formato_impresion: "LASER", inventario: "",
    modalidad_firma: "CONTROLADA", modalidad_emision: "ONLINE", admin_folios: "EN",
    version_emisor: "", version_app_full: "", version_winplugin: "", version_winbatch: "",
    ...empresa?.onboarding?.configuracionEmpresa?.andespos,
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const [boxes, setBoxes] = useState<any[]>(empresa?.onboarding?.configuracionEmpresa?.boxes || []);

  const STEPS: StepKey[] = useMemo(() => {
    const arr: StepKey[] = ["productos", "identificacion", "documentos", "integracion"];
    if (
      (productos.includes("ENTERFAC") && ["OFFLINE", "OFFLINEWEB"].includes(enterfac.modalidad_emision)) ||
      (productos.includes("ANDESPOS") && ["OFFLINE", "OFFLINEWEB"].includes(andespos.modalidad_emision))
    ) {
      arr.push("sucursales");
    }
    arr.push("resumen");
    return arr;
  }, [productos, enterfac.modalidad_emision, andespos.modalidad_emision]);

  const [current, setCurrent] = useState<StepKey>(() => {
    const q = search.get("step") as StepKey | null;
    return (q && (["productos", "identificacion", "documentos", "integracion", "sucursales", "resumen"] as const).includes(q))
      ? q
      : "productos";
  });

  useEffect(() => {
    if (!STEPS.includes(current)) {
      const first: StepKey = STEPS[0];
      setCurrent(first);
      setSearch((sp) => { sp.set("step", first); return sp; }, { replace: true });
    }
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

  const stepValid: Record<StepKey, boolean> = useMemo(() => ({
    productos: productos.length > 0,
    identificacion: (!!enterfac.empkey && !!enterfac.replica_password && !!enterfac.pass),
    documentos: true,
    integracion: true,
    sucursales: true,
    resumen: true,
  }), [productos, enterfac]);

  const progress = ((STEPS.indexOf(current) + 1) / STEPS.length) * 100;

  const toggleProducto = (key: "ENTERFAC" | "ANDESPOS" | "LCE") => {
    setProductos((prev) =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const save = () => {
    const payload = { productos, enterfac, andespos, boxes };
    onSave?.(payload);
    if (empresa?.empkey) navigate(`/empresa/${empresa.empkey}`);
  };
  /* === Render Productos === */
  const renderProductos = () => (
    <div>
      <SectionTitle>Productos contratados</SectionTitle>
      <div className="d-flex gap-3 flex-wrap">
        {["ENTERFAC", "ANDESPOS", "LCE"].map(p => (
          <div className="form-check" key={p}>
            <input className="form-check-input" type="checkbox" id={`p-${p.toLowerCase()}`}
              checked={productos.includes(p)} onChange={() => toggleProducto(p as any)} />
            <label className="form-check-label" htmlFor={`p-${p.toLowerCase()}`}>{p}</label>
          </div>
        ))}
      </div>
      <small className="text-muted d-block mt-2">Puedes marcar uno o varios productos contratados.</small>
    </div>
  );

  /* === Render Identificación === */
   const renderIdentificacion = () => (
    <div>
      <SectionTitle>Identificación</SectionTitle>

      {(productos.includes("ENTERFAC") || productos.includes("ANDESPOS")) && (
        <div className="border rounded p-3 mb-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>
            {productos.length === 1 && productos.includes("ANDESPOS") ? "ANDESPOS" : "ENTERFAC / ANDESPOS"}
          </h6>
          <div className="row g-3">

            {/* === Campos comunes (Empkey, ReplicaPass, Pass, Casilla) === */}
            <div className="col-md-4">
              <FieldLabel required>Empkey</FieldLabel>
              <input className="form-control" inputMode="numeric" pattern="\\d*"
                value={productos.includes("ANDESPOS") ? andespos.empkey : enterfac.empkey}
                onChange={e => {
                  if (productos.includes("ANDESPOS") && !productos.includes("ENTERFAC"))
                    setAndespos((p: any) => ({ ...p, empkey: onlyDigits(e.target.value) }));
                  else
                    setEnterfac((p: any) => ({ ...p, empkey: onlyDigits(e.target.value) }));
                }} />
            </div>

            <div className="col-md-4">
              <FieldLabel required>ReplicaPass</FieldLabel>
              <input className="form-control"
                value={productos.includes("ANDESPOS") ? andespos.replica_password : enterfac.replica_password}
                onChange={e => {
                  if (productos.includes("ANDESPOS") && !productos.includes("ENTERFAC"))
                    setAndespos((p: any) => ({ ...p, replica_password: onlyAlnum(e.target.value) }));
                  else
                    setEnterfac((p: any) => ({ ...p, replica_password: onlyAlnum(e.target.value) }));
                }} />
            </div>

            <div className="col-md-4">
              <FieldLabel required>Pass</FieldLabel>
              <input className="form-control"
                value={productos.includes("ANDESPOS") ? andespos.pass : enterfac.pass}
                onChange={e => {
                  if (productos.includes("ANDESPOS") && !productos.includes("ENTERFAC"))
                    setAndespos((p: any) => ({ ...p, pass: onlyAlnum(e.target.value) }));
                  else
                    setEnterfac((p: any) => ({ ...p, pass: onlyAlnum(e.target.value) }));
                }} />
            </div>

            <div className="col-md-6">
              <FieldLabel>Casilla de intercambio (opcional)</FieldLabel>
              <input className="form-control"
                value={productos.includes("ANDESPOS") ? andespos.casilla_intercambio || "" : enterfac.casilla_intercambio || ""}
                onChange={e => {
                  if (productos.includes("ANDESPOS") && !productos.includes("ENTERFAC"))
                    setAndespos((p: any) => ({ ...p, casilla_intercambio: e.target.value }));
                  else
                    setEnterfac((p: any) => ({ ...p, casilla_intercambio: e.target.value }));
                }} />
            </div>

            {/* === Campos exclusivos de AndesPOS === */}
            {(productos.includes("ANDESPOS")) && (
              <>
                <div className="col-md-3">
                  <FieldLabel>Encargado FA</FieldLabel>
                  <input className="form-control" value={andespos.encargado_fa}
                    onChange={e => setAndespos((p: any) => ({ ...p, encargado_fa: e.target.value }))} />
                </div>

                <div className="col-md-3">
                  <FieldLabel>Terminal ID</FieldLabel>
                  <input className="form-control" value={andespos.terminal_id}
                    onChange={e => setAndespos((p: any) => ({ ...p, terminal_id: e.target.value }))} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );


  /* === Render Documentos === */
  const renderDocumentos = () => {
    const DTEsNacionales = [
      { id: "33", nombre: "Factura Afecta" },
      { id: "34", nombre: "Factura Exenta" },
      { id: "39", nombre: "Boleta Afecta" },
      { id: "41", nombre: "Boleta Exenta" },
      { id: "52", nombre: "Guía de Despacho" },
      { id: "61", nombre: "Nota de Crédito" },
      { id: "56", nombre: "Nota de Débito" },
    ];
    const DTEsExportacion = [
      { id: "110", nombre: "Factura de Exportación" },
      { id: "111", nombre: "Nota de Débito de Exportación" },
      { id: "112", nombre: "Nota de Crédito de Exportación" },
    ];
    const DTEsNoTributarios = [
      { id: "Comanda", nombre: "Comanda" },
      { id: "TNT", nombre: "Ticket No Tributario" },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        const fileURL = URL.createObjectURL(file);
        setFilePreview(fileURL);
        setEnterfac((p: any) => ({ ...p, url_visto_bueno: file }));
      }
    };

    return (
      <div>
        <SectionTitle>Documentos & Layout</SectionTitle>

        {productos.includes("ENTERFAC") && (
          <div className="border rounded p-3 mb-3">
            <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ENTERFAC</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <FieldLabel>Archivo Visto Bueno (PDF o Word)</FieldLabel>
                <input type="file" accept=".pdf,.doc,.docx" className="form-control" onChange={handleFileChange} />
                {filePreview && (
                  <div className="mt-3">
                    {fileName.endsWith(".pdf") ? (
                      <iframe src={filePreview} width="100%" height="400px" title="Vista previa del PDF" />
                    ) : (
                      <p className="text-muted">
                        <i className="bi bi-file-earmark-word me-2"></i>
                        Archivo cargado: {fileName}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <FieldLabel>URL Membrete</FieldLabel>
                <input className="form-control" placeholder="https://..." type="url"
                  value={enterfac.url_membrete} onChange={e => setEnterfac((p: any) => ({ ...p, url_membrete: e.target.value }))} />
              </div>

              <div className="col-md-4">
                <FieldLabel>Layout</FieldLabel>
                <select className="form-select" value={enterfac.layout}
                  onChange={e => setEnterfac((p: any) => ({ ...p, layout: e.target.value }))}>
                  <option value="ESTANDAR">Estándar</option>
                  <option value="CUSTOM">Customizado</option>
                </select>
              </div>

              {enterfac.layout === "CUSTOM" && (
                <div className="col-md-8">
                  <FieldLabel>URL del Layout</FieldLabel>
                  <input className="form-control" placeholder="https://..." type="url"
                    value={enterfac.url_layout_custom || ""}
                    onChange={e => setEnterfac((p: any) => ({ ...p, url_layout_custom: e.target.value }))} />
                </div>
              )}

              <div className="col-12 mt-3">
                <FieldLabel>DTE Habilitados – Nacionales</FieldLabel>
                <div className="row gy-2">
                  {DTEsNacionales.map(dte => (
                    <div className="col-md-4 col-lg-3" key={dte.id}>
                      <input type="checkbox" className="form-check-input me-2"
                        checked={enterfac.dte_habilitados?.includes(dte.id) || false}
                        onChange={e => {
                          const curr = enterfac.dte_habilitados || [];
                          setEnterfac((p: any) => ({
                            ...p,
                            dte_habilitados: e.target.checked
                              ? [...curr, dte.id]
                              : curr.filter((id: string) => id !== dte.id),
                          }));
                        }} />
                      {dte.nombre}
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12 mt-3">
                <FieldLabel>DTE Habilitados – Exportación</FieldLabel>
                <div className="row gy-2">
                  {DTEsExportacion.map(dte => (
                    <div className="col-md-4 col-lg-3" key={dte.id}>
                      <input type="checkbox" className="form-check-input me-2"
                        checked={enterfac.dte_habilitados?.includes(dte.id) || false}
                        onChange={e => {
                          const curr = enterfac.dte_habilitados || [];
                          setEnterfac((p: any) => ({
                            ...p,
                            dte_habilitados: e.target.checked
                              ? [...curr, dte.id]
                              : curr.filter((id: string) => id !== dte.id),
                          }));
                        }} />
                      {dte.nombre}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {productos.includes("ANDESPOS") && (
          <div className="border rounded p-3">
            <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ANDESPOS</h6>
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
                  <option value="LASER">Láser</option>
                  <option value="NOIMPRIME">No Imprime</option>
                </select>
              </div>

              <div className="col-12 mt-3">
                <FieldLabel>Documentos Nacionales</FieldLabel>
                <div className="row gy-2">
                  {DTEsNacionales.map(dte => (
                    <div className="col-md-4 col-lg-3" key={dte.id}>
                      <input type="checkbox" className="form-check-input me-2"
                        checked={andespos.dte_habilitados?.includes(dte.id) || false}
                        onChange={e => {
                          const curr = andespos.dte_habilitados || [];
                          setAndespos((p: any) => ({
                            ...p,
                            dte_habilitados: e.target.checked
                              ? [...curr, dte.id]
                              : curr.filter((id: string) => id !== dte.id),
                          }));
                        }} />
                      {dte.nombre}
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12 mt-3">
                <FieldLabel>Documentos No Tributarios</FieldLabel>
                <div className="row gy-2">
                  {DTEsNoTributarios.map(dte => (
                    <div className="col-md-4 col-lg-3" key={dte.id}>
                      <input type="checkbox" className="form-check-input me-2"
                        checked={andespos.dte_habilitados?.includes(dte.id) || false}
                        onChange={e => {
                          const curr = andespos.dte_habilitados || [];
                          setAndespos((p: any) => ({
                            ...p,
                            dte_habilitados: e.target.checked
                              ? [...curr, dte.id]
                              : curr.filter((id: string) => id !== dte.id),
                          }));
                        }} />
                      {dte.nombre}
                    </div>
                  ))}
                </div>
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

      {productos.includes("ENTERFAC") && (
        <div className="border rounded p-3 mb-3">
          <h6 className="font-primary mb-3" style={{ fontWeight: 700 }}>ENTERFAC</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <FieldLabel>Tipo de Integración</FieldLabel>
              <select className="form-select" value={enterfac.tipo_ws}
                onChange={e => setEnterfac((p: any) => ({ ...p, tipo_ws: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="WEB">Web</option>
                <option value="TRANSFERENCIA">Transferencia de Archivos</option>
                <option value="WEBSERVICE">Web Service</option>
                <option value="BATCH">Batch</option>
              </select>
            </div>

            {enterfac.tipo_ws === "WEBSERVICE" && (
              <div className="col-md-3">
                <FieldLabel>Tipo WebService</FieldLabel>
                <select className="form-select" value={enterfac.integracion}
                  onChange={e => setEnterfac((p: any) => ({ ...p, integracion: e.target.value }))}>
                  <option value="">Seleccione</option>
                  <option value="REST">API Rest</option>
                  <option value="SOAP">SOAP</option>
                </select>
              </div>
            )}

            <div className="col-md-3">
              <FieldLabel>Tipo de Mensaje</FieldLabel>
              <select className="form-select" value={enterfac.tipo_texto}
                onChange={e => {
                  const val = e.target.value;
                  let parser = "";
                  if (val === "XMLCUSTOM" || val === "TXTCUSTOM") parser = "SI";
                  if (val === "XMLV5" || val === "TXTV5") parser = "NO";
                  setEnterfac((p: any) => ({ ...p, tipo_texto: val, parser }));
                }}>
                <option value="">Seleccione</option>
                <option value="XMLV5">XML V5</option>
                <option value="TXTV5">TXT V5</option>
                <option value="XMLCUSTOM">XML Custom</option>
                <option value="TXTCUSTOM">TXT Custom</option>
              </select>
            </div>

            {enterfac.parser && (
              <div className="col-md-3">
                <FieldLabel>Parser</FieldLabel>
                <input className="form-control" readOnly value={enterfac.parser} />
              </div>
            )}

            <div className="col-md-3">
              <FieldLabel>Modalidad de Firma</FieldLabel>
              <select className="form-select" value={enterfac.modalidad_firma}
                onChange={e => setEnterfac((p: any) => ({ ...p, modalidad_firma: e.target.value }))}>
                <option value="NUBE">Nube</option>
                <option value="LOCAL">Local</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Tipo de Firma</FieldLabel>
              <select className="form-select" value={enterfac.tipo_firma || ""}
                onChange={e => setEnterfac((p: any) => ({ ...p, tipo_firma: e.target.value }))}>
                <option value="CONTROLADA">Controlada</option>
                <option value="AUTOMATICA">Automática</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Modalidad de Emisión</FieldLabel>
              <select className="form-select" value={enterfac.modalidad_emision}
                onChange={e => setEnterfac((p: any) => ({ ...p, modalidad_emision: e.target.value }))}>
                <option value="ONLINE">Online</option>
                <option value="ONLINEWEB">Online Web</option>
                <option value="OFFLINE">Offline</option>
                <option value="OFFLINEWEB">Offline Web</option>
                <option value="CIEGA">Ciega</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Administrador de Folios</FieldLabel>
              <select className="form-select" value={enterfac.admin_folios}
                onChange={e => setEnterfac((p: any) => ({ ...p, admin_folios: e.target.value }))}>
                <option value="EN">Enternet</option>
                <option value="CL">Cliente</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión AppFull</FieldLabel>
              <select className="form-select" value={enterfac.version_app_full}
                onChange={e => setEnterfac((p: any) => ({ ...p, version_app_full: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="2024.1">2024.1</option>
                <option value="2024.2">2024.2</option>
                <option value="2024.3">2024.3</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión WinPlugin</FieldLabel>
              <select className="form-select" value={enterfac.version_winplugin}
                onChange={e => setEnterfac((p: any) => ({ ...p, version_winplugin: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="3.1">3.1</option>
                <option value="3.2">3.2</option>
                <option value="3.3">3.3</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión WinEmisor</FieldLabel>
              <select className="form-select" value={enterfac.version_emisor}
                onChange={e => setEnterfac((p: any) => ({ ...p, version_emisor: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="1.0">1.0</option>
                <option value="1.1">1.1</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión WinBatch</FieldLabel>
              <select className="form-select" value={enterfac.version_winbatch}
                onChange={e => setEnterfac((p: any) => ({ ...p, version_winbatch: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="2.1">2.1</option>
                <option value="2.2">2.2</option>
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
              <FieldLabel>Modalidad de Emisión</FieldLabel>
              <select className="form-select" value={andespos.modalidad_emision}
                onChange={e => setAndespos((p: any) => ({ ...p, modalidad_emision: e.target.value }))}>
                <option value="ONLINE">Online</option>
                <option value="ONLINEWEB">Online Web</option>
                <option value="OFFLINE">Offline</option>
                <option value="OFFLINEWEB">Offline Web</option>
                <option value="CIEGA">Ciega</option>
              </select>
            </div>

            {["OFFLINE", "OFFLINEWEB"].includes(andespos.modalidad_emision) && (
              <div className="col-12">
                <div className="alert alert-warning small mb-0">
                  Esta modalidad requiere configurar sucursales (ver siguiente paso).
                </div>
              </div>
            )}

            <div className="col-md-3">
              <FieldLabel>Administrador Folios</FieldLabel>
              <select className="form-select" value={andespos.admin_folios}
                onChange={e => setAndespos((p: any) => ({ ...p, admin_folios: e.target.value }))}>
                <option value="EN">Enternet</option>
                <option value="CL">Cliente</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión AppFull</FieldLabel>
              <select className="form-select" value={andespos.version_app_full}
                onChange={e => setAndespos((p: any) => ({ ...p, version_app_full: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="2024.1">2024.1</option>
                <option value="2024.2">2024.2</option>
                <option value="2024.3">2024.3</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión WinPlugin</FieldLabel>
              <select className="form-select" value={andespos.version_winplugin}
                onChange={e => setAndespos((p: any) => ({ ...p, version_winplugin: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="3.1">3.1</option>
                <option value="3.2">3.2</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión WinEmisor</FieldLabel>
              <select className="form-select" value={andespos.version_emisor}
                onChange={e => setAndespos((p: any) => ({ ...p, version_emisor: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="1.0">1.0</option>
                <option value="1.1">1.1</option>
              </select>
            </div>

            <div className="col-md-3">
              <FieldLabel>Versión WinBatch</FieldLabel>
              <select className="form-select" value={andespos.version_winbatch}
                onChange={e => setAndespos((p: any) => ({ ...p, version_winbatch: e.target.value }))}>
                <option value="">Seleccione</option>
                <option value="2.1">2.1</option>
                <option value="2.2">2.2</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* === Render Resumen COMPLETO === */
  const renderResumen = () => (
    <div>
      <SectionTitle>Resumen Final</SectionTitle>

      {/* === Productos === */}
      <div className="card mb-3">
        <div className="card-body">
          <strong>Productos seleccionados:</strong>{" "}
          {productos.length ? productos.map(p => <Chip key={p}>{p}</Chip>) : dash}
        </div>
      </div>

      {/* === ENTERFAC === */}
      {productos.includes("ENTERFAC") && (
        <div className="card mb-3">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>ENTERFAC</div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-4"><strong>Empkey:</strong> {fmt(enterfac.empkey)}</div>
              <div className="col-md-4"><strong>ReplicaPass:</strong> {fmt(enterfac.replica_password)}</div>
              <div className="col-md-4"><strong>Pass:</strong> {fmt(enterfac.pass)}</div>
              <div className="col-md-6"><strong>Casilla de intercambio:</strong> {fmt(enterfac.casilla_intercambio)}</div>
              
              {/* === Archivos y Layout === */}
              <div className="col-md-6"><strong>Archivo Visto Bueno:</strong> {enterfac.url_visto_bueno?.name ? enterfac.url_visto_bueno.name : dash}</div>
              <div className="col-md-6"><strong>URL Membrete:</strong> {fmt(enterfac.url_membrete)}</div>
              <div className="col-md-4"><strong>Layout:</strong> {fmt(enterfac.layout)}</div>
              {enterfac.layout === "CUSTOM" && (
                <div className="col-md-8"><strong>URL Layout Custom:</strong> {fmt(enterfac.url_layout_custom)}</div>
              )}

              {/* === DTEs === */}
              <div className="col-12 mt-2">
                <strong>DTE Habilitados:</strong>
                <div>
                  {enterfac.dte_habilitados?.length
                    ? enterfac.dte_habilitados.map((id: string) => <Chip key={id}>{id}</Chip>)
                    : dash}
                </div>
              </div>

              {/* === Integración === */}
              <div className="col-md-3"><strong>Tipo de Integración:</strong> {fmt(enterfac.tipo_ws)}</div>
              {enterfac.tipo_ws === "WEBSERVICE" && (
                <div className="col-md-3"><strong>Tipo WebService:</strong> {fmt(enterfac.integracion)}</div>
              )}
              <div className="col-md-3"><strong>Tipo de Mensaje:</strong> {fmt(enterfac.tipo_texto)}</div>
              <div className="col-md-3"><strong>Parser:</strong> {fmt(enterfac.parser)}</div>

              {/* === Firma / Emisión === */}
              <div className="col-md-3"><strong>Modalidad de Firma:</strong> {fmt(enterfac.modalidad_firma)}</div>
              <div className="col-md-3"><strong>Tipo de Firma:</strong> {fmt(enterfac.tipo_firma)}</div>
              <div className="col-md-3"><strong>Modalidad de Emisión:</strong> {fmt(enterfac.modalidad_emision)}</div>
              <div className="col-md-3"><strong>Administrador de Folios:</strong> {fmt(enterfac.admin_folios)}</div>

              {/* === Versionado === */}
              <div className="col-md-3"><strong>Versión AppFull:</strong> {fmt(enterfac.version_app_full)}</div>
              <div className="col-md-3"><strong>Versión WinPlugin:</strong> {fmt(enterfac.version_winplugin)}</div>
              <div className="col-md-3"><strong>Versión WinEmisor:</strong> {fmt(enterfac.version_emisor)}</div>
              <div className="col-md-3"><strong>Versión WinBatch:</strong> {fmt(enterfac.version_winbatch)}</div>
            </div>
          </div>
        </div>
      )}

      {/* === ANDESPOS === */}
      {productos.includes("ANDESPOS") && (
        <div className="card mb-3">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>ANDESPOS</div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-4"><strong>Empkey:</strong> {fmt(andespos.empkey)}</div>
              <div className="col-md-4"><strong>ReplicaPass:</strong> {fmt(andespos.replica_password)}</div>
              <div className="col-md-4"><strong>Pass:</strong> {fmt(andespos.pass)}</div>
              <div className="col-md-4"><strong>Encargado FA:</strong> {fmt(andespos.encargado_fa)}</div>
              <div className="col-md-4"><strong>Terminal ID:</strong> {fmt(andespos.terminal_id)}</div>

              {/* === Layout / Documentos === */}
              <div className="col-md-4"><strong>URL Layout:</strong> {fmt(andespos.layout_url)}</div>
              <div className="col-md-4"><strong>Modalidad Impresión:</strong> {fmt(andespos.formato_impresion)}</div>
              <div className="col-12 mt-2">
                <strong>DTE Habilitados:</strong>
                <div>
                  {andespos.dte_habilitados?.length
                    ? andespos.dte_habilitados.map((id: string) => <Chip key={id}>{id}</Chip>)
                    : dash}
                </div>
              </div>

              {/* === Firma / Emisión === */}
              <div className="col-md-3"><strong>Modalidad de Firma:</strong> {fmt(andespos.modalidad_firma)}</div>
              <div className="col-md-3"><strong>Tipo de Firma:</strong> {fmt(andespos.tipo_firma)}</div>
              <div className="col-md-3"><strong>Modalidad de Emisión:</strong> {fmt(andespos.modalidad_emision)}</div>
              <div className="col-md-3"><strong>Administrador de Folios:</strong> {fmt(andespos.admin_folios)}</div>

              {/* === Versionado === */}
              <div className="col-md-3"><strong>Versión AppFull:</strong> {fmt(andespos.version_app_full)}</div>
              <div className="col-md-3"><strong>Versión WinPlugin:</strong> {fmt(andespos.version_winplugin)}</div>
              <div className="col-md-3"><strong>Versión WinEmisor:</strong> {fmt(andespos.version_emisor)}</div>
              <div className="col-md-3"><strong>Versión WinBatch:</strong> {fmt(andespos.version_winbatch)}</div>
            </div>
          </div>
        </div>
      )}

      {/* === LCE === */}
      {productos.includes("LCE") && (
        <div className="card mb-3">
          <div className="card-header font-primary" style={{ fontWeight: 700 }}>LCE</div>
          <div className="card-body">
            <p>Este producto no requiere configuración adicional.</p>
          </div>
        </div>
      )}

      {/* === Sucursales (si aplica) === */}
      {boxes?.length > 0 && (
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


  /* === Render Sucursales (si aplica) === */
  const renderSucursales = () => (
    <div>
      <SectionTitle>Sucursales</SectionTitle>
      <div className="mb-3">
        <FieldLabel>Cantidad de Sucursales</FieldLabel>
        <input type="number" className="form-control" min={1}
          value={boxes.length || 1}
          onChange={e => setBoxes(Array.from({ length: Number(e.target.value) }, (_, i) => boxes[i] || {}))} />
      </div>
      {boxes.map((box, i) => (
        <div key={i} className="card p-3 mb-3">
          <h6>Sucursal #{i + 1}</h6>
          <div className="row g-3">
            <div className="col-md-3"><FieldLabel>ID Box</FieldLabel><input className="form-control" value={box.idBox || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], idBox: e.target.value }; return n; })} /></div>
            <div className="col-md-3"><FieldLabel>Router</FieldLabel><input className="form-control" value={box.router || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], router: e.target.value }; return n; })} /></div>
            <div className="col-md-3"><FieldLabel>IP</FieldLabel><input className="form-control" value={box.ip || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], ip: e.target.value }; return n; })} /></div>
            <div className="col-md-3"><FieldLabel>Versión Enterbox</FieldLabel><select className="form-select" value={box.enterbox || ""} onChange={e => setBoxes(b => { const n = [...b]; n[i] = { ...n[i], enterbox: e.target.value }; return n; })}><option value="">Seleccione</option><option value="PI3">PI3</option><option value="PI4">PI4</option></select></div>
          </div>
        </div>
      ))}
    </div>
  );

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
