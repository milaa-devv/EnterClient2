import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Send, Save, CheckCircle2, AlertTriangle } from "lucide-react";

/** URL /exec del Web App de Apps Script */
const APPS_SCRIPT_URL =
  "https://script.google.com/a/macros/enternet.cl/s/AKfycbwIN3v9xTTRcGqoqG7clICpMwzpn5NEWKqjCQ_C2C3ZMrmePu5gP8b8ahIgIf2p9cJ1/exec";

/* ======================== Tipos ======================== */
type DocumentoDTE = { id: string; nombre: string; seleccionado: boolean };
type Empresa = {
  razonSocial: string;
  rut: string;
  tipoIntegracion: string;
  plataforma: "Enternet" | "AndesPOS" | "—";  // ✅ Cambiado de "Enterfact" a "Enternet"
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

/* ---- Catálogo de DTEs ---- */
const ALL_DTES: { id: string; nombre: string }[] = [
  { id: "33", nombre: "Factura Afecta (33)" },
  { id: "34", nombre: "Factura Exenta (34)" },
  { id: "39", nombre: "Boleta Afecta (39)" },
  { id: "41", nombre: "Boleta Exenta (41)" },
  { id: "46", nombre: "Factura de Compra (46)" },
  { id: "52", nombre: "Guía de Despacho (52)" },
  { id: "56", nombre: "Nota de Débito (56)" },
  { id: "61", nombre: "Nota de Crédito (61)" },
  { id: "43", nombre: "Liquidación de Factura (43)" },
];

function productoLabel(p?: string | null): "Enternet" | "AndesPOS" | "—" {
  if (p === "ENTERFAC") return "Enternet";  // ✅ Cambiado de "Enterfact" a "Enternet"
  if (p === "ANDESPOS") return "AndesPOS";
  return "—";
}

/* ===================== Componente ====================== */
export default function PasoProduccion() {
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();

  const empkeyParam = searchParams.get("empkey");
  const empkey = Number(empkeyParam);

  /* ==== Estado de carga ==== */
  const [loadingDB, setLoadingDB] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [yaEnviadoASac, setYaEnviadoASac] = useState(false);
  const [papSolicitudId, setPapSolicitudId] = useState<number | null>(null);
  const [configuracionOriginal, setConfiguracionOriginal] = useState<any>(null);  // ✅ NUEVO: Guardar config completa

  /* ==== Estado base ==== */
  const [fechaHora, setFechaHora] = useState<string>("");
  const [empkeyConfigurado, setEmpkeyConfigurado] = useState<string>("");  // Empkey del formulario

  const [empresa, setEmpresa] = useState<Empresa>({
    razonSocial: "—",
    rut: "—",
    tipoIntegracion: "—",
    plataforma: "—",
  });

  const [ticketHS, setTicketHS] = useState<string>("");
  const [tipoCertificacion, setTipoCertificacion] = useState<string>("");
  const [casillaIntercambio, setCasillaIntercambio] = useState<string>("");

  const [documentos, setDocumentos] = useState<DocumentoDTE[]>(
    ALL_DTES.map((d) => ({ ...d, seleccionado: false }))
  );

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

  const [representantes, setRepresentantes] = useState<Representante[]>([
    { nombre: "—", rut: "—" },
  ]);

  const [usuarios, setUsuarios] = useState<UsuarioAcceso[]>([
    { nombre: "", rut: "" },
  ]);

  const [contactos, setContactos] = useState<Contacto[]>([
    { nombre: "", telefono: "", email: "" },
  ]);

  /* ======== Carga inicial desde BD ======== */
  useEffect(() => {
    if (!empkeyParam || Number.isNaN(empkey)) {
      setLoadingDB(false);
      setError("No se recibió empkey válido en la URL.");
      return;
    }

    const load = async () => {
      setLoadingDB(true);
      setError(null);
      try {
        // 1. Empresa base
        const { data: emp, error: empErr } = await supabase
          .from("empresa")
          .select("empkey, rut, nombre, nombre_fantasia, producto")
          .eq("empkey", empkey)
          .single();

        if (empErr) throw empErr;

        setEmpresa({
          razonSocial: emp.nombre ?? emp.nombre_fantasia ?? "—",
          rut: emp.rut ?? "—",
          tipoIntegracion: "—", // se sobreescribe desde OB
          plataforma: productoLabel(emp.producto),
        });

        // 2. Empresa onboarding (puede no existir)
        const { data: obRaw } = await supabase
          .from("empresa_onboarding")
          .select("*")
          .eq("empkey", empkey)
          .maybeSingle();

        const ob = obRaw as any;

        if (ob) {
          // Convertir pap_fecha_hora de ISO a datetime-local
          if (ob.pap_fecha_hora) {
            // La BD guarda en UTC, pero datetime-local espera hora local SIN timezone
            // Simplemente tomamos los primeros 16 caracteres del ISO string
            const isoString = ob.pap_fecha_hora;
            // Si viene como "2026-02-19T15:00:00.000Z", tomamos "2026-02-19T15:00"
            const localISO = isoString.slice(0, 16);
            setFechaHora(localISO);
          }
          if (ob.ticket_hs) setTicketHS(ob.ticket_hs);
          
          // Configuración guardada en jsonb
          const cfg = ob.configuracion ?? {};
          
          // ✅ NUEVO: Guardar la configuración original completa para fusionarla al guardar
          setConfiguracionOriginal(cfg);
          
          // === EMPKEY CONFIGURADO ===
          const empkeyConfig = cfg.enterfac?.empkey || cfg.andespos?.empkey;
          if (empkeyConfig) {
            setEmpkeyConfigurado(empkeyConfig);
          }
          
          // === DATOS DESDE CONFIGURACIÓN DE ONBOARDING ===
          
          // 1. Tipo de Integración - desde cfg.enterfac.integraciones.general o cfg.andespos.integraciones.general
          const integracionesGeneral = cfg.enterfac?.integraciones?.general || cfg.andespos?.integraciones?.general || [];
          if (Array.isArray(integracionesGeneral) && integracionesGeneral.length > 0) {
            setEmpresa((e) => ({ ...e, tipoIntegracion: integracionesGeneral.join(', ') }));
          } else if (ob.tipo_integracion) {
            setEmpresa((e) => ({ ...e, tipoIntegracion: String(ob.tipo_integracion) }));
          }
          
          // 2. Tipo de Certificación - desde cfg.enterfac.modalidades.general (o modalidad_firma)
          const modalidadFirma = cfg.enterfac?.modalidad_firma || cfg.enterfac?.modalidades?.general || cfg.andespos?.modalidad_firma;
          if (modalidadFirma) {
            setTipoCertificacion(modalidadFirma);
          } else if (ob.tipo_certificacion) {
            setTipoCertificacion(ob.tipo_certificacion);
          }
          
          // 3. Plataforma - desde cfg.productos
          if (Array.isArray(cfg.productos) && cfg.productos.length > 0) {
            const producto = cfg.productos[0]; // Primer producto
            if (producto === 'ENTERFAC') {
              setEmpresa((e) => ({ ...e, plataforma: 'Enternet' }));  // ✅ Cambiado de 'Enterfact' a 'Enternet'
            } else if (producto === 'ANDESPOS' || producto === 'ANDESPOS_ENTERBOX') {
              setEmpresa((e) => ({ ...e, plataforma: 'AndesPOS' }));
            }
          }
          
          // 4. Documentos DTE - desde cfg.enterfac.dte_habilitados o cfg.andespos.dte_habilitados
          const dteHabilitados = cfg.enterfac?.dte_habilitados || cfg.andespos?.dte_habilitados || ob.documentos_dte || [];
          if (Array.isArray(dteHabilitados) && dteHabilitados.length > 0) {
            setDocumentos(
              ALL_DTES.map((d) => ({
                ...d,
                seleccionado: dteHabilitados.includes(d.id) || dteHabilitados.includes(Number(d.id)),
              }))
            );
          }
          
          // 5. Casilla de Intercambio - desde cfg.enterfac.casilla_intercambio
          const casillaIntercambio = cfg.enterfac?.casilla_intercambio || cfg.andespos?.casilla_intercambio || ob.casilla_intercambio;
          if (casillaIntercambio) {
            setCasillaIntercambio(casillaIntercambio);
          }
          
          // Resto de configuración guardada
          if (cfg.siiConfig) setSiiConfig(cfg.siiConfig);
          if (cfg.actividades) setActividades(cfg.actividades);
          
          // Usuarios y contactos desde configuración (precarga desde formulario de Comercial)
          console.log('📊 Configuración completa:', cfg);
          console.log('📊 Representantes en config:', cfg.representantes);
          console.log('📊 Usuarios en config:', cfg.usuarios);
          console.log('📊 Contactos en config:', cfg.contactos);
          
          if (cfg.usuarios && Array.isArray(cfg.usuarios) && cfg.usuarios.length > 0) {
            console.log('✅ Cargando usuarios:', cfg.usuarios);
            setUsuarios(cfg.usuarios);
          }
          
          // Contactos desde configuración
          let contactosCargados = false;
          
          if (cfg.contactos && Array.isArray(cfg.contactos) && cfg.contactos.length > 0) {
            console.log('📋 Analizando contactos:', cfg.contactos);
            
            // Transformar contactos al formato esperado
            const contactosTransformados = cfg.contactos
              .filter((c: any) => c.correo || c.email) // Solo contactos con email
              .map((c: any) => ({
                nombre: c.nombre || c.descripcion || "",
                telefono: c.telefono || "",
                email: c.correo || c.email || "",
              }))
              .filter((c: any) => c.nombre && c.telefono && c.email); // ✅ NUEVO: Solo contactos COMPLETOS
            
            if (contactosTransformados.length > 0) {
              console.log('✅ Cargando contactos transformados (completos):', contactosTransformados);
              setContactos(contactosTransformados);
              contactosCargados = true;
            } else {
              console.log('⚠️ Contactos transformados no tienen nombre/telefono completos');
            }
          }
          
          // Si no hay contactos válidos, usar el primer representante como contacto principal
          if (!contactosCargados && cfg.representantes && Array.isArray(cfg.representantes) && cfg.representantes.length > 0) {
            const primerRep = cfg.representantes[0];
            console.log('⚠️ No hay contactos completos, usando primer representante como contacto:', primerRep);
            if (primerRep) {
              const nuevoContacto = {
                nombre: primerRep.nombre || "",
                telefono: primerRep.telefono || "",
                email: primerRep.correo || primerRep.email || "",
              };
              console.log('✅ Creando contacto desde representante:', nuevoContacto);
              setContactos([nuevoContacto]);
            }
          } else if (!contactosCargados) {
            console.log('❌ No hay contactos ni representantes');
          }
          
          // Representantes desde configuración (si existen)
          console.log('🔍 DEBUG Representantes:');
          console.log('  - cfg.representantes existe?', !!cfg.representantes);
          console.log('  - cfg.representantes es array?', Array.isArray(cfg.representantes));
          console.log('  - cfg.representantes.length:', cfg.representantes?.length);
          console.log('  - cfg.representantes completo:', JSON.stringify(cfg.representantes, null, 2));
          
          if (cfg.representantes && Array.isArray(cfg.representantes) && cfg.representantes.length > 0) {
            console.log('✅ CARGANDO REPRESENTANTES desde configuración');
            const repsTransformados = cfg.representantes.map((r: any) => ({
              rut: r.rut || "—",
              nombre: r.nombre || "—"
            }));
            console.log('✅ Representantes transformados:', repsTransformados);
            setRepresentantes(repsTransformados);
          } else {
            console.log('⚠️ NO hay representantes en configuración, intentaré cargar desde empresa_representante');
          }
        }

        // 3. Representantes legales desde empresa_representante (si no están en configuración)
        if (!ob?.configuracion?.representantes || ob?.configuracion?.representantes?.length === 0) {
          const { data: reps } = await supabase
            .from("empresa_representante")
            .select("rut, representante_legal:representante_legal!empresa_representante_rut_fkey(rut, nombre)")
            .eq("empkey", empkey);

          if (reps && reps.length > 0) {
            setRepresentantes(
              reps.map((r: any) => ({
                rut: r.representante_legal?.rut ?? r.rut ?? "—",
                nombre: r.representante_legal?.nombre ?? "—",
              }))
            );
          }
        }

        // 4. pap_solicitud — revisar estado
        const { data: papRow } = await supabase
          .from("pap_solicitud")
          .select("id, estado, enviado_a_sac_at")
          .eq("empkey", empkey)
          .maybeSingle();

        if (papRow) {
          setPapSolicitudId(papRow.id);
          if (papRow.estado !== "pre_ingreso") {
            setYaEnviadoASac(true);
          }
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Error cargando datos de la empresa.");
      } finally {
        setLoadingDB(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empkeyParam]);

  /* ======== Guardar configuración en empresa_onboarding ======== */
  const guardarConfiguracion = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const docsSeleccionados = documentos.filter((d) => d.seleccionado).map((d) => d.id);

      // Convertir fechaHora de datetime-local a timestamp (sin conversión timezone)
      let fechaHoraISO = fechaHora || null;
      if (fechaHora) {
        // datetime-local da: "2026-02-19T15:00"
        // Lo guardamos directamente agregando ":00.000Z" para que sea un ISO válido
        // pero tratándolo como si fuera UTC (así al leerlo, obtenemos la misma hora)
        fechaHoraISO = fechaHora + ":00.000Z";
      }

      const updatePayload: Record<string, any> = {
        pap_fecha_hora: fechaHoraISO,
        ticket_hs: ticketHS || null,
        tipo_integracion: empresa.tipoIntegracion !== "—" ? empresa.tipoIntegracion : null,
        tipo_certificacion: tipoCertificacion || null,
        casilla_intercambio: casillaIntercambio || null,
        documentos_dte: docsSeleccionados,
        configuracion: {
          // ✅ FUSIONAR: Mantener toda la configuración existente de Onboarding
          ...(configuracionOriginal || {}),
          // Actualizar solo los campos del PAP
          siiConfig,
          actividades,
          representantes: representantes.filter((r) => r.nombre || r.rut),
          usuarios: usuarios.filter((u) => u.nombre || u.rut),
          contactos: contactos.filter((c) => c.nombre || c.telefono || c.email),
        },
        updated_at: new Date().toISOString(),
      };

      const { error: updErr } = await supabase
        .from("empresa_onboarding")
        .update(updatePayload)
        .eq("empkey", empkey);

      if (updErr) throw updErr;

      setSuccessMsg("Configuración guardada correctamente ✅");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Error al guardar configuración.");
    } finally {
      setSaving(false);
    }
  };

  /* ======== Enviar a SAC (transicionar pap_solicitud) ======== */
  const enviarASac = async () => {
    const confirmado = window.confirm(
      yaEnviadoASac 
        ? "¿Confirmas reenviar esta solicitud de PAP a SAC con las modificaciones actuales?\n\nEsto actualizará la información ya enviada."
        : "¿Confirmas enviar esta solicitud de PAP a SAC?\n\nEsto guardará la configuración actual y enviará la solicitud para que Admin SAC la asigne a un ejecutivo."
    );
    if (!confirmado) return;

    setEnviando(true);
    setError(null);
    setSuccessMsg(null);
    try {
      // 1. Guardar configuración primero
      await guardarConfiguracion();

      // 2. Actualizar pap_solicitud: pre_ingreso → pendiente
      const now = new Date().toISOString();

      if (papSolicitudId) {
        const { error: papErr } = await supabase
          .from("pap_solicitud")
          .update({
            estado: "pendiente",
            enviado_a_sac_at: now,
          })
          .eq("id", papSolicitudId);

        if (papErr) throw papErr;
      } else {
        // Si no existe pap_solicitud, crearla directamente como pendiente
        const { error: papErr } = await supabase
          .from("pap_solicitud")
          .insert([
            {
              empkey,
              estado: "pendiente",
              creado_por_rut: profile?.rut ?? null,
              enviado_a_sac_at: now,
            },
          ]);

        if (papErr) throw papErr;
      }

      // 3. Actualizar estado de la empresa a SAC (si aún está en OB)
      await supabase
        .from("empresa")
        .update({ estado: "SAC", updated_at: now })
        .eq("empkey", empkey)
        .in("estado", ["OB", "PAP"]);

      // 4. Crear notificación para SAC
      // (Intentamos insertar; si la tabla no tiene permisos, no es crítico)
      try {
        await supabase.from("onboarding_notificacion").insert([
          {
            empkey,
            tipo: "enviado_sac",
            descripcion: `Solicitud PAP enviada a SAC para empresa ${empresa.razonSocial} (${empresa.rut})`,
          },
        ]);
      } catch {
        // No crítico
      }

      // TODO: 5. Enviar correo automático a SAC
      // Para implementar esto, necesitas:
      // - Crear una Edge Function en Supabase que envíe correos
      // - O configurar un trigger en la BD que llame a un servicio de email
      // - O usar un webhook a un servicio externo (SendGrid, Resend, etc.)
      // Ejemplo:
      // await fetch('/api/send-email', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     to: 'sac@empresa.com',
      //     subject: `Nueva solicitud PAP: ${empresa.razonSocial}`,
      //     body: `Se ha enviado una nueva solicitud PAP para ${empresa.razonSocial}...`
      //   })
      // })

      setYaEnviadoASac(true);
      setSuccessMsg("¡Solicitud enviada a SAC exitosamente! 🚀 Admin SAC podrá verla en su dashboard.");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Error al enviar solicitud a SAC.");
    } finally {
      setEnviando(false);
    }
  };

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
            ? `<a href="${esc(ticketHS)}" target="_blank" rel="noopener noreferrer">Ver ticket en HubSpot</a>`
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

  if (loadingDB) {
    return (
      <div className="container py-4" style={{ maxWidth: 980 }}>
        <div className="text-center py-5">
          <Loader2 className="spin" size={32} />
          <div className="text-muted mt-2">Cargando datos de la empresa…</div>
        </div>
      </div>
    );
  }

  if (!empkeyParam || Number.isNaN(empkey)) {
    return (
      <div className="container py-4" style={{ maxWidth: 980 }}>
        <BackButton fallback="/onboarding/paso-produccion-listado" />
        <div className="alert alert-danger mt-3">
          No se recibió un empkey válido. Vuelve al listado y selecciona una empresa.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 980 }}>
      {/* Header con botón Atrás */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <BackButton fallback="/onboarding/paso-produccion-listado" />
        <div>
          <h4 className="mb-1">Paso a Producción</h4>
          <p className="text-muted small mb-0">
            Configura los datos necesarios para coordinar el PAP con SAC.
            {" "}<b>Empkey {empkeyConfigurado || empkey}</b> • {empresa.razonSocial} • {empresa.rut}
          </p>
        </div>
        {yaEnviadoASac && (
          <span className="badge bg-success ms-auto">Enviado a SAC</span>
        )}
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2">
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}

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
            <div className="col-md-3">
              <label className="form-label">Tipo de certificación</label>
              <input
                className="form-control"
                value={tipoCertificacion}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Casilla de intercambio</label>
              <input
                className="form-control"
                value={casillaIntercambio}
                onChange={(e) => setCasillaIntercambio(e.target.value)}
                placeholder="casilla@empresa.cl"
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
          <p className="text-muted small">
            Selecciona los documentos que aplican para esta empresa.
          </p>
          <div className="row g-2">
            {documentos.map((d, idx) => (
              <div className="col-md-6" key={d.id}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`dte-${d.id}`}
                    checked={d.seleccionado}
                    onChange={(e) =>
                      setDocumentos((prev) => {
                        const copy = [...prev];
                        copy[idx] = { ...copy[idx], seleccionado: e.target.checked };
                        return copy;
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={`dte-${d.id}`}>
                    {d.nombre}
                  </label>
                </div>
              </div>
            ))}
          </div>
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

      {/* ===== Acciones principales ===== */}
      <div className="card mb-3 border-primary">
        <div className="card-header bg-primary bg-opacity-10">
          <strong>Acciones</strong>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            {/* Guardar configuración (sin enviar a SAC) */}
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={guardarConfiguracion}
              disabled={saving || enviando}
            >
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              Guardar configuración
            </button>

            {/* Enviar a SAC — transiciona pap_solicitud */}
            <button
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={enviarASac}
              disabled={saving || enviando}
            >
              {enviando ? (
                <Loader2 size={16} className="spin" />
              ) : yaEnviadoASac ? (
                <CheckCircle2 size={16} />
              ) : (
                <Send size={16} />
              )}
              {yaEnviadoASac ? "Reenviar actualización a SAC" : "Enviar solicitud a SAC"}
            </button>

            <div className="vr mx-1" />

            {/* Correo (funcionalidad existente) */}
            <button
              className="btn btn-outline-secondary"
              onClick={onAbrirGmailConBorrador}
            >
              Redactar en Gmail
            </button>
            <button className="btn btn-secondary" onClick={onEnviarAppScript}>
              Enviar con Apps Script
            </button>
          </div>

          {yaEnviadoASac && (
            <div className="form-text mt-2 text-success">
              ✅ La solicitud ya fue enviada a SAC. Admin SAC puede verla en su dashboard y asignarla a un ejecutivo.
            </div>
          )}

          {!yaEnviadoASac && (
            <div className="form-text mt-2">
              💡 <b>Guardar configuración</b> guarda los datos sin enviar a SAC.{" "}
              <b>Enviar solicitud a SAC</b> guarda y notifica a Admin SAC para que asigne un ejecutivo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}