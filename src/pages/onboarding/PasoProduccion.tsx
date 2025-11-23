import { useMemo, useState } from "react";

/** URL /exec del Web App de Apps Script */
const APPS_SCRIPT_URL =
  "https://script.google.com/a/macros/enternet.cl/s/AKfycbwIN3v9xTTRcGqoqG7clICpMwzpn5NEWKqjCQ_C2C3ZMrmePu5gP8b8ahIgIf2p9cJ1/exec";

/* ======================== Tipos ======================== */
type DocumentoDTE = { id: string; nombre: string; seleccionado: boolean };
type Empresa = {
  razonSocial: string;
  rut: string;
  tipoIntegracion: string;
  plataforma: "Enterfact" | "AndesPOS" | "—";
};
type SiiConfig = {
  declaracionCumplimiento: boolean;
  casillaIntercambio: boolean;
  senderEnternet: boolean;
  desafiliacionBoletaGratis: boolean;
  cambioModeloEmision: boolean;
  bajarFoliosSII: boolean;
  notas: string;
};
type ActividadesPAP = {
  subirFoliosEnterfact: boolean;
  subirFoliosBackoffice: boolean;
  capacitacion: boolean;
  dtePrueba: boolean;
};
type Representante = { rut: string; nombre: string };
type UsuarioAcceso = { nombre: string; rut: string };
type Contacto = { nombre: string; telefono: string; email: string };

/* ======================== Utils ======================== */
const dash = "—";
const esc = (v: string) =>
  (v ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function fmtDateTimeISOToEs(iso: string) {
  if (!iso) return dash;
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

/** POST en iframe oculto enviando TODO como JSON */
function postJsonToHiddenIframe(actionUrl: string, payload: Record<string, any>) {
  const iframe = document.createElement("iframe");
  iframe.name = "hiddenFrame_" + Date.now();
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.target = iframe.name;
  form.style.display = "none";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "json";
  input.value = JSON.stringify(payload);
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();

  setTimeout(() => {
    form.remove();
    iframe.remove();
  }, 5000);
}

/* ===================== Componente ====================== */
export default function PasoProduccion() {
  /* ==== Estado base ==== */
  const [fechaHora, setFechaHora] = useState<string>("");

  const [empresa] = useState<Empresa>({
    razonSocial: "—", // traer desde OB
    rut: "—", // traer desde OB
    tipoIntegracion: "—", // traer desde OB
    plataforma: "Enterfact",
  });

  const [ticketHS, setTicketHS] = useState<string>("");

  const [documentos] = useState<DocumentoDTE[]>([
    { id: "33", nombre: "Factura Afecta (33)", seleccionado: true },
    { id: "34", nombre: "Factura Exenta (34)", seleccionado: false },
    { id: "39", nombre: "Boleta Afecta (39)", seleccionado: true },
    { id: "41", nombre: "Boleta Exenta (41)", seleccionado: false },
    { id: "52", nombre: "Guía de Despacho (52)", seleccionado: false },
    { id: "56", nombre: "Nota de Débito (56)", seleccionado: false },
    { id: "61", nombre: "Nota de Crédito (61)", seleccionado: true },
    { id: "43", nombre: "Liquidación de Factura (43)", seleccionado: false },
  ]);

  const [siiConfig, setSiiConfig] = useState<SiiConfig>({
    declaracionCumplimiento: false,
    casillaIntercambio: false,
    senderEnternet: false,
    desafiliacionBoletaGratis: false,
    cambioModeloEmision: false,
    bajarFoliosSII: false,
    notas: "",
  });

  const [actividades, setActividades] = useState<ActividadesPAP>({
    subirFoliosEnterfact: false,
    subirFoliosBackoffice: false,
    capacitacion: false,
    dtePrueba: false,
  });

  const [checklistFile, setChecklistFile] = useState<File | null>(null);

  const [representantes] = useState<Representante[]>([
    { nombre: "—", rut: "—" },
  ]);

  const [usuarios, setUsuarios] = useState<UsuarioAcceso[]>([
    { nombre: "", rut: "" },
  ]);

  const [contactos, setContactos] = useState<Contacto[]>([
    { nombre: "", telefono: "", email: "" },
  ]);

  /* =================== Asuntos / cuerpos =================== */

  const emailSubject = useMemo(() => {
    const base = "PAP – Solicitud de acompañamiento SAC";
    return empresa.razonSocial && empresa.razonSocial !== "—"
      ? `${base} – ${empresa.razonSocial}`
      : base;
  }, [empresa.razonSocial]);

  // HTML que se envía por Apps Script
  const emailHtml = useMemo(() => {
    const f = fmtDateTimeISOToEs(fechaHora);
    const docsHtml = documentos
      .filter((d) => d.seleccionado)
      .map((d) => `<li>&#x2705; ${esc(d.nombre)}</li>`)
      .join("");

    const repsHtml = representantes
      .map(
        (r) =>
          `<li><span class="k">Nombre:</span> ${esc(
            r.nombre
          )} — <span class="k">RUT:</span> ${esc(r.rut)}</li>`
      )
      .join("");

    const usersHtml = usuarios
      .filter((u) => u.nombre || u.rut)
      .map(
        (u) =>
          `<li>${esc(u.nombre || "—")} — ${esc(u.rut || "—")}</li>`
      )
      .join("");

    const contactosHtml = contactos
      .filter((c) => c.nombre || c.telefono || c.email)
      .map(
        (c) =>
          `<li><span class="k">Persona de contacto:</span> ${esc(
            c.nombre || "—"
          )} &nbsp;|&nbsp; <span class="k">Teléfono:</span> ${esc(
            c.telefono || "—"
          )} &nbsp;|&nbsp; <span class="k">Email:</span> ${esc(
            c.email || "—"
          )}</li>`
      )
      .join("");

    const yesNo = (b: boolean) => (b ? "Sí" : "No");

    return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.45;color:#111;">
      <p>Hola Tomás &#x1F44B;,</p>
      <p>El motivo de mi correo es solicitar tu apoyo para coordinar el <b>paso a producción (PAP)</b> de nuestro cliente, asignando un ejecutivo de <b>SAC</b> para acompañar el proceso. &#x1F64C;</p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />

      <h3>&#x1F4C5; Horario solicitado por el cliente</h3>
      <p>${esc(f)}</p>

      <h3>&#x1F4D1; Datos de la empresa</h3>
      <ul>
        <li><span class="k">Razón Social:</span> ${esc(empresa.razonSocial)}</li>
        <li><span class="k">RUT:</span> ${esc(empresa.rut)}</li>
        <li><span class="k">Ticket:</span> ${
          ticketHS
            ? `<a href="${esc(ticketHS)}">Aquí iría el Link</a>`
            : dash
        }</li>
        <li><span class="k">Tipo de integración:</span> ${esc(
          empresa.tipoIntegracion
        )}</li>
        <li><span class="k">Plataforma:</span> ${esc(empresa.plataforma)}</li>
      </ul>

      <h3>&#x1F4C4; Documentos tributarios electrónicos a habilitar</h3>
      <ul>
        ${docsHtml || "<li>—</li>"}
      </ul>

      <h3>&#9881; Configuración a aplicar en el SII</h3>
      <ul>
        <li>Declaración de cumplimiento: <b>${yesNo(
          siiConfig.declaracionCumplimiento
        )}</b></li>
        <li>Casilla de intercambio: <b>${yesNo(
          siiConfig.casillaIntercambio
        )}</b></li>
        <li>Agregar sender Enternet: <b>${yesNo(
          siiConfig.senderEnternet
        )}</b></li>
        <li>Desafiliación Boleta Gratuita SII: <b>${yesNo(
          siiConfig.desafiliacionBoletaGratis
        )}</b></li>
        <li>Cambio Modelo de Emisión: <b>${yesNo(
          siiConfig.cambioModeloEmision
        )}</b></li>
        <li>Bajar folios en SII: <b>${yesNo(siiConfig.bajarFoliosSII)}</b></li>
      </ul>
      ${
        siiConfig.notas
          ? `<p><span class="k">Acotaciones:</span> ${esc(
              siiConfig.notas
            )}</p>`
          : ""
      }

      <h3>&#x1F4DD; Actividades a realizar en el PAP</h3>
      <ul>
        <li>Subir folios Enterfact: <b>${yesNo(
          actividades.subirFoliosEnterfact
        )}</b></li>
        <li>Subir folios BackOffice: <b>${yesNo(
          actividades.subirFoliosBackoffice
        )}</b></li>
        <li>Capacitación al cliente: <b>${yesNo(
          actividades.capacitacion
        )}</b></li>
        <li>Emisión de DTE de prueba: <b>${yesNo(
          actividades.dtePrueba
        )}</b></li>
      </ul>

      ${
        checklistFile
          ? `<p>&#x1F4CE; <i>Checklist adjunto:</i> ${esc(checklistFile.name)}</p>`
          : ""
      }

      <h3>&#x1F464; Representantes legales</h3>
      <ul>
        ${repsHtml || "<li>—</li>"}
      </ul>

      <h3>&#x1F465; Usuarios con acceso</h3>
      <ul>
        ${usersHtml || "<li>—</li>"}
      </ul>

      <h3>&#x1F4DE; Contactos del cliente</h3>
      <ul>
        ${contactosHtml || "<li>—</li>"}
      </ul>

      <p>Quedo atento a tu confirmación para asegurar la asignación y agendar este PAP de manera correcta. &#x1F680;</p>
      <p>¡Gracias por el apoyo de siempre! &#x1F64F;</p>
      <p>Saludos,</p>
    </div>`;
  }, [
    fechaHora,
    empresa,
    ticketHS,
    documentos,
    siiConfig,
    actividades,
    representantes,
    usuarios,
    contactos,
    checklistFile,
  ]);

  // Versión texto plano para "Redactar en Gmail"
  const emailPlain = useMemo(() => {
    const f = fmtDateTimeISOToEs(fechaHora);
    const yn = (b: boolean) => (b ? "Sí" : "No");

    const lines: string[] = [];

    lines.push("Hola Tomás 👋,");
    lines.push("");
    lines.push(
      "El motivo de mi correo es solicitar tu apoyo para coordinar el paso a producción (PAP) de nuestro cliente, asignando un ejecutivo de SAC para acompañar el proceso. 🙌"
    );
    lines.push("");
    lines.push("🗓️ Horario solicitado por el cliente");
    lines.push(f);
    lines.push("");
    lines.push("📑 Datos de la empresa");
    lines.push(`- Razón Social: ${empresa.razonSocial}`);
    lines.push(`- RUT: ${empresa.rut}`);
    lines.push(`- Ticket: ${ticketHS || "—"}`);
    lines.push(`- Tipo de integración: ${empresa.tipoIntegracion}`);
    lines.push(`- Plataforma: ${empresa.plataforma}`);
    lines.push("");
    lines.push("📄 Documentos tributarios electrónicos a habilitar");
    const docsSel = documentos.filter((d) => d.seleccionado);
    if (docsSel.length === 0) {
      lines.push("- —");
    } else {
      docsSel.forEach((d) => lines.push(`- ${d.nombre}`));
    }
    lines.push("");
    lines.push("⚙️ Configuración a aplicar en el SII");
    lines.push(`- Declaración de cumplimiento: ${yn(siiConfig.declaracionCumplimiento)}`);
    lines.push(`- Casilla de intercambio: ${yn(siiConfig.casillaIntercambio)}`);
    lines.push(`- Agregar sender Enternet: ${yn(siiConfig.senderEnternet)}`);
    lines.push(`- Desafiliación Boleta Gratuita SII: ${yn(siiConfig.desafiliacionBoletaGratis)}`);
    lines.push(`- Cambio Modelo de Emisión: ${yn(siiConfig.cambioModeloEmision)}`);
    lines.push(`- Bajar folios en SII: ${yn(siiConfig.bajarFoliosSII)}`);
    if (siiConfig.notas) {
      lines.push(`- Acotaciones: ${siiConfig.notas}`);
    }
    lines.push("");
    lines.push("📝 Actividades a realizar en el PAP");
    lines.push(`- Subir folios Enterfact: ${yn(actividades.subirFoliosEnterfact)}`);
    lines.push(`- Subir folios BackOffice: ${yn(actividades.subirFoliosBackoffice)}`);
    lines.push(`- Capacitación al cliente: ${yn(actividades.capacitacion)}`);
    lines.push(`- Emisión de DTE de prueba: ${yn(actividades.dtePrueba)}`);
    lines.push("");
    lines.push("👤 Representantes legales");
    representantes.forEach((r) => {
      lines.push(`- ${r.nombre} — RUT: ${r.rut}`);
    });
    lines.push("");
    lines.push("👥 Usuarios con acceso");
    if (usuarios.length === 0) {
      lines.push("- —");
    } else {
      usuarios.forEach((u) =>
        lines.push(`- ${u.nombre || "—"} — ${u.rut || "—"}`)
      );
    }
    lines.push("");
    lines.push("📞 Contactos del cliente");
    if (contactos.length === 0) {
      lines.push("- —");
    } else {
      contactos.forEach((c) =>
        lines.push(
          `- ${c.nombre || "—"} | Teléfono: ${c.telefono || "—"} | Email: ${
            c.email || "—"
          }`
        )
      );
    }
    lines.push("");
    lines.push(
      "Quedo atento a tu confirmación para asegurar la asignación y agendar este PAP de manera correcta. 🚀"
    );
    lines.push("¡Gracias por el apoyo de siempre! 🙏");
    lines.push("Saludos,");

    return lines.join("\n");
  }, [
    fechaHora,
    empresa,
    ticketHS,
    documentos,
    siiConfig,
    actividades,
    representantes,
    usuarios,
    contactos,
  ]);

  /* ================= Acciones correo ================= */

  function onEnviarAppScript() {
    postJsonToHiddenIframe(APPS_SCRIPT_URL, {
      action: "send",
      to: "camila.palma@enternet.cl",
      cc: "camila.palma@enternet.cl",
      subject: emailSubject,
      html: emailHtml,
      senderName: "Onboarding",
    });
    alert("Se envió la solicitud de correo. Revisa tu Gmail en unos segundos ✅");
  }

  function onAbrirGmailConBorrador() {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      tf: "1",
      to: "camila.palma@enternet.cl",
      cc: "camila.palma@enternet.cl",
      su: emailSubject,
      body: emailPlain,
    });

    const url = `https://mail.google.com/mail/u/0/?${params.toString()}`;
    window.open(url, "_blank");
  }

  /* ====================== Render ====================== */
  return (
    <div className="container py-4" style={{ maxWidth: 980 }}>
      <h4 className="mb-3">Paso a Producción</h4>

      {/* 1. Horario */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>1) Horario solicitado por el cliente</strong>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Fecha y hora</label>
              <input
                type="datetime-local"
                className="form-control"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
              />
              <div className="form-text">
                {fechaHora ? fmtDateTimeISOToEs(fechaHora) : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Datos Empresa */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>2) Datos de la empresa</strong>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Razón Social</label>
              <input
                className="form-control"
                value={empresa.razonSocial}
                readOnly
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">RUT</label>
              <input className="form-control" value={empresa.rut} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Ticket HS (URL)</label>
              <input
                className="form-control"
                placeholder="https://..."
                value={ticketHS}
                onChange={(e) => setTicketHS(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Tipo de integración</label>
              <input
                className="form-control"
                value={empresa.tipoIntegracion}
                readOnly
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Plataforma</label>
              <input
                className="form-control"
                value={empresa.plataforma}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Documentos */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>3) Documentos tributarios electrónicos a habilitar</strong>
        </div>
        <div className="card-body">
          <p className="text-muted">
            (Se traen desde la configuración de Onboarding; no se editan aquí)
          </p>
          <ul className="mb-0">
            {documentos
              .filter((d) => d.seleccionado)
              .map((d) => (
                <li key={d.id}>✅ {d.nombre}</li>
              ))}
            {!documentos.some((d) => d.seleccionado) && <li>{dash}</li>}
          </ul>
        </div>
      </div>

      {/* 4. Configuración SII */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>4) Configuración a aplicar en el SII</strong>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              {[
                [
                  "Declaración de cumplimiento de requisitos",
                  "declaracionCumplimiento",
                ],
                ["Agregar casilla de intercambio", "casillaIntercambio"],
                ["Agregar Sender Enternet", "senderEnternet"],
                [
                  "Desafiliación del Sistema de Boletas Electrónicas en el SII",
                  "desafiliacionBoletaGratis",
                ],
                ["Cambio de Modelo de Emisión", "cambioModeloEmision"],
                ["Bajar folios en el SII", "bajarFoliosSII"],
              ].map(([label, key]) => (
                <div className="form-check mb-2" key={key}>
                  <input
                    className="form-check-input"
                    id={`sii-${key}`}
                    type="checkbox"
                    checked={(siiConfig as any)[key]}
                    onChange={(e) =>
                      setSiiConfig(
                        (s) =>
                          ({ ...s, [key]: e.target.checked } as SiiConfig)
                      )
                    }
                  />
                  <label className="form-check-label" htmlFor={`sii-${key}`}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
            <div className="col-md-6">
              <label className="form-label">Acotaciones</label>
              <textarea
                className="form-control"
                rows={6}
                value={siiConfig.notas}
                onChange={(e) =>
                  setSiiConfig((s) => ({ ...s, notas: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Actividades PAP */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>5) Actividades a realizar en el PAP</strong>
        </div>
        <div className="card-body">
          {[
            ["Subir folios a Enterfact", "subirFoliosEnterfact"],
            ["Subir folios a BackOffice", "subirFoliosBackoffice"],
            ["Capacitación al cliente", "capacitacion"],
            ["Emisión de DTE de Prueba", "dtePrueba"],
          ].map(([label, key]) => (
            <div className="form-check mb-2" key={key}>
              <input
                className="form-check-input"
                id={`act-${key}`}
                type="checkbox"
                checked={(actividades as any)[key]}
                onChange={(e) =>
                  setActividades(
                    (s) =>
                      ({ ...s, [key]: e.target.checked } as ActividadesPAP)
                  )
                }
              />
              <label className="form-check-label" htmlFor={`act-${key}`}>
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Checklist */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>6) Check List</strong>
        </div>
        <div className="card-body">
          <input
            type="file"
            accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="form-control"
            onChange={(e) =>
              setChecklistFile(e.target.files?.[0] || null)
            }
          />
          {checklistFile && (
            <div className="form-text mt-1">
              Seleccionado: {checklistFile.name}
            </div>
          )}
          <div className="form-text">
            *Si deseas adjuntar el archivo en el envío automático, lo vemos con
            Apps Script.
          </div>
        </div>
      </div>

      {/* 7. Representantes */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>7) Representantes legales</strong>
        </div>
        <div className="card-body">
          {representantes.map((r, i) => (
            <div key={i} className="row g-3 align-items-end mb-2">
              <div className="col-md-4">
                <label className="form-label">Nombre</label>
                <input className="form-control" value={r.nombre} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label">RUT</label>
                <input className="form-control" value={r.rut} readOnly />
              </div>
            </div>
          ))}
          <div className="form-text">
            *Se traen desde el formulario de Comercial (solo lectura aquí).
          </div>
        </div>
      </div>

      {/* 8. Usuarios con acceso */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>8) Usuarios con Acceso a la Plataforma</strong>
        </div>
        <div className="card-body">
          {usuarios.map((u, i) => (
            <div key={i} className="row g-2 align-items-end mb-2">
              <div className="col-md-5">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={u.nombre}
                  onChange={(e) =>
                    setUsuarios((arr) => {
                      const copy = [...arr];
                      copy[i] = { ...copy[i], nombre: e.target.value };
                      return copy;
                    })
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">RUT</label>
                <input
                  className="form-control"
                  value={u.rut}
                  onChange={(e) =>
                    setUsuarios((arr) => {
                      const copy = [...arr];
                      copy[i] = { ...copy[i], rut: e.target.value };
                      return copy;
                    })
                  }
                />
              </div>
              <div className="col-md-3">
                <button
                  type="button"
                  className="btn btn-outline-danger w-100"
                  onClick={() =>
                    setUsuarios((arr) =>
                      arr.filter((_, idx) => idx !== i)
                    )
                  }
                  disabled={usuarios.length === 1}
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() =>
              setUsuarios((arr) => [...arr, { nombre: "", rut: "" }])
            }
          >
            + Agregar usuario
          </button>
        </div>
      </div>

      {/* 9. Contactos */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>9) Contacto del Cliente</strong>
        </div>
        <div className="card-body">
          {contactos.map((c, i) => (
            <div key={i} className="row g-2 align-items-end mb-2">
              <div className="col-md-4">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={c.nombre}
                  onChange={(e) =>
                    setContactos((arr) => {
                      const copy = [...arr];
                      copy[i] = { ...copy[i], nombre: e.target.value };
                      return copy;
                    })
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-control"
                  value={c.telefono}
                  onChange={(e) =>
                    setContactos((arr) => {
                      const copy = [...arr];
                      copy[i] = { ...copy[i], telefono: e.target.value };
                      return copy;
                    })
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  className="form-control"
                  value={c.email}
                  onChange={(e) =>
                    setContactos((arr) => {
                      const copy = [...arr];
                      copy[i] = { ...copy[i], email: e.target.value };
                      return copy;
                    })
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() =>
              setContactos((arr) => [
                ...arr,
                { nombre: "", telefono: "", email: "" },
              ])
            }
          >
            + Agregar contacto
          </button>
        </div>
      </div>

      {/* Vista previa y acciones */}
      <div className="card mb-3">
        <div className="card-header">
          <strong>Resumen / Vista previa del correo</strong>
        </div>
        <div className="card-body">
          <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
        </div>
      </div>

      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-primary"
          onClick={onAbrirGmailConBorrador}
        >
          Redactar en Gmail
        </button>
        <button className="btn btn-primary" onClick={onEnviarAppScript}>
          Enviar con Apps Script
        </button>
      </div>
    </div>
  );
}
