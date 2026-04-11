import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// ——— Tipos ————————————————————————————————————————
interface HubSpotPayload {
  formulario_origen?: string
  hs_object_id?: string
  // Empresa
  razon_social_empresa?: string
  rut_empresa?: string | number        // ✅ Fix: llega como número desde HubSpot
  nombre_fantasia_empresa?: string
  direccion_empresa?: string | null
  comuna_empresa?: string
  telefono_empresa?: string
  email?: string
  // Representante Legal
  nombre_representante_legal?: string
  apellido_representante_legal?: string
  rut_representante_legal?: string | number  // ✅ Fix: llega como número
  correo_representante_legal?: string
  telefono_representante_legal?: string
  // Contacto Principal
  nombre_contacto_principal?: string
  apellido_contacto_principal?: string
  telefono_contacto_principal?: string
  correo_contacto_principal?: string
  // Archivos (URLs internas de HubSpot)
  plantilla_usuario?: string           // ✅ Fix: sin 's' final
  plantilla_contraparte?: string
  plantilla_notificaciones?: string
  [key: string]: string | number | null | undefined
}

interface ExcelRow {
  [header: string]: string
}

// ——— Descarga y parsea un xlsx desde URL de HubSpot ——
async function parsearXlsx(url: string, hsToken: string): Promise<ExcelRow[]> {
  if (!url) return []
  try {
    // Extraer el fileId de la URL de HubSpot
    // URL formato: .../signed-url-redirect/FILEID?...
    const match = url.match(/signed-url-redirect\/(\d+)/)
    
    let fetchUrl = url
    let headers: Record<string, string> = {}

    if (match) {
      // Usar la API de archivos de HubSpot directamente con el token
      const fileId = match[1]
      fetchUrl = `https://api.hubapi.com/files/v3/files/${fileId}/signed-url`
      headers = { Authorization: `Bearer ${hsToken}` }
    }

    const res = await fetch(fetchUrl, { headers, redirect: "follow" })
    if (!res.ok) {
      const body = await res.text()
      console.error(`Error obteniendo signed URL (${res.status}): ${body}`)
      return []
    }

    // Si es JSON, es la respuesta de la API con la URL real
    const contentType = res.headers.get("content-type") ?? ""
    let fileRes: Response

    if (contentType.includes("application/json")) {
      const json = await res.json()
      const signedUrl = json.url
      if (!signedUrl) {
        console.error("No se encontró URL en la respuesta de HubSpot Files API")
        return []
      }
      fileRes = await fetch(signedUrl, { redirect: "follow" })
    } else {
      fileRes = res
    }

    if (!fileRes.ok) {
      console.error(`Error descargando archivo (${fileRes.status})`)
      return []
    }

    const buffer = await fileRes.arrayBuffer()
    const { read, utils } = await import(
      "https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs"
    )
    const workbook = read(new Uint8Array(buffer), { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return utils.sheet_to_json<ExcelRow>(sheet, { defval: "", range: 1 })
  } catch (err) {
    console.error("Error parseando xlsx:", err)
    return []
  }
}

// ——— Normaliza RUT chileno a formato 12345678-K ———————
// ✅ Fix: acepta string | number | null
function normalizarRut(raw?: string | number | null): string | null {
  if (!raw) return null
  const str = String(raw).trim().replace(/\./g, "").toUpperCase()
  if (str.includes("-")) return str
  const dv = str.slice(-1)
  const cuerpo = str.slice(0, -1)
  return `${cuerpo}-${dv}`
}

// ——— Handler principal ————————————————————————————
serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  // Validar secret
  const secret = req.headers.get("x-webhook-secret")
  if (secret !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 })
  }

  let payload: HubSpotPayload
  try {
    payload = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  // Email es el campo mínimo requerido
  const email = payload.email?.toString().trim()
  if (!email) {
    return new Response("email requerido", { status: 422 })
  }

  const hsToken = Deno.env.get("HUBSPOT_API_TOKEN")!
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Detectar producto
  const producto = payload.formulario_origen === "ANDESPOS"
    ? "ANDESPOS"
    : "ENTERFAC"

  // Normalizar RUTs
  const rutEmpresa = normalizarRut(payload.rut_empresa)
  const rutRepLegal = normalizarRut(payload.rut_representante_legal)

  // Verificar duplicado por RUT empresa
  if (rutEmpresa) {
    const { data: existente } = await supabase
      .from("pre_ingresos")
      .select("id")
      .eq("rut", rutEmpresa)
      .eq("estado", "Pendiente")
      .maybeSingle()

    if (existente) {
      console.log(`Duplicado detectado para RUT ${rutEmpresa}`)
      return new Response(
        JSON.stringify({ ok: true, duplicado: true, id: existente.id }),
        { headers: { "Content-Type": "application/json" } }
      )
    }
  }

  // ✅ Fix: usar plantilla_usuario (sin 's') para usuarios
  const [usuariosRows, contraparteRows, notificacionesRows] = await Promise.all([
    parsearXlsx(payload.plantilla_usuario ?? "", hsToken),
    parsearXlsx(payload.plantilla_contraparte ?? "", hsToken),
    parsearXlsx(payload.plantilla_notificaciones ?? "", hsToken),
  ])

  // Insertar pre_ingreso
  const { data, error } = await supabase
    .from("pre_ingresos")
    .insert({
      nombre_empresa: payload.razon_social_empresa ?? null,
      rut:            rutEmpresa,
      contacto:       `${payload.nombre_contacto_principal ?? ""} ${payload.apellido_contacto_principal ?? ""}`.trim() || null,
      origen:         "HubSpot",
      estado:         "Pendiente",

      producto,
      hs_contact_id: payload.hs_object_id ?? null,

      representante: {
        nombre:   payload.nombre_representante_legal ?? null,
        apellido: payload.apellido_representante_legal ?? null,
        rut:      rutRepLegal,
        correo:   payload.correo_representante_legal ?? null,
        telefono: payload.telefono_representante_legal ?? null,
      },

      contacto_principal: {
        nombre:   payload.nombre_contacto_principal ?? null,
        apellido: payload.apellido_contacto_principal ?? null,
        telefono: payload.telefono_contacto_principal ?? null,
        email:    payload.correo_contacto_principal ?? null,
      },

      datos_json: {
        razon_social:      payload.razon_social_empresa,
        rut:               rutEmpresa,
        nombre_fantasia:   payload.nombre_fantasia_empresa,
        direccion:         payload.direccion_empresa,
        comuna:            payload.comuna_empresa,
        telefono:          payload.telefono_empresa,
        email:             email,
        formulario_origen: payload.formulario_origen,
        raw:               payload,
      },

      usuarios_xlsx:       usuariosRows.length > 0 ? usuariosRows : null,
      contrapartes_xlsx:   contraparteRows.length > 0 ? contraparteRows : null,
      notificaciones_xlsx: notificacionesRows.length > 0 ? notificacionesRows : null,

      // ✅ Fix: usar plantilla_usuario (sin 's') en archivos_hs
      archivos_hs: {
        plantilla_usuario:        payload.plantilla_usuario ?? null,
        plantilla_contraparte:    payload.plantilla_contraparte ?? null,
        plantilla_notificaciones: payload.plantilla_notificaciones ?? null,
      },

      procesado_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error insertando pre_ingreso:", error)
    return new Response("Error interno", { status: 500 })
  }

  console.log(`✅ Pre-ingreso creado: id=${data.id} | rut=${rutEmpresa} | producto=${producto}`)

  return new Response(
    JSON.stringify({ ok: true, id: data.id }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  )
})