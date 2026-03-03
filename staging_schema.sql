


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."actividades_economicas" (
    "cod" integer NOT NULL,
    "nombre" "text",
    "posee_iva" boolean
);


ALTER TABLE "public"."actividades_economicas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."administrador_folios" (
    "id" integer NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."administrador_folios" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."administrador_folios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."administrador_folios_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."administrador_folios_id_seq" OWNED BY "public"."administrador_folios"."id";



CREATE TABLE IF NOT EXISTS "public"."box" (
    "id" "text" NOT NULL,
    "punto_acceso_key" "text",
    "punto_acceso_nombre" "text",
    "router" "text",
    "ip" "text",
    "mac_eth0" "text",
    "mac_wlan0" "text",
    "sucursal_id" "text"
);


ALTER TABLE "public"."box" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categorias_tributarias" (
    "cod" integer NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."categorias_tributarias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."codigo_producto" (
    "codigo" "text" NOT NULL,
    "nombre" "text",
    "descripcion" "text",
    "producto_id" integer
);


ALTER TABLE "public"."codigo_producto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contraparte_administrativa" (
    "rut" "text" NOT NULL,
    "nombre" "text",
    "telefono" "text",
    "correo" "text"
);


ALTER TABLE "public"."contraparte_administrativa" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contraparte_tecnica" (
    "rut" "text" NOT NULL,
    "nombre" "text",
    "telefono" "text",
    "correo" "text"
);


ALTER TABLE "public"."contraparte_tecnica" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa" (
    "empkey" integer NOT NULL,
    "rut" "text" NOT NULL,
    "nombre" "text",
    "nombre_fantasia" "text",
    "fecha_inicio" "date",
    "logo" "text",
    "domicilio" "text",
    "telefono" "text",
    "correo" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text",
    "estado" "text" DEFAULT 'SAC'::"text" NOT NULL,
    "producto" "text",
    "paso_produccion_por_rut" "text",
    "paso_produccion_at" timestamp with time zone,
    CONSTRAINT "empresa_estado_chk" CHECK (("estado" = ANY (ARRAY['OB'::"text", 'SAC'::"text", 'PAP'::"text", 'PRODUCCION'::"text", 'COMPLETADA'::"text"]))),
    CONSTRAINT "empresa_producto_chk" CHECK ((("producto" IS NULL) OR ("producto" = ANY (ARRAY['ENTERFAC'::"text", 'ANDESPOS'::"text"]))))
);


ALTER TABLE "public"."empresa" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_actividad" (
    "empkey" integer NOT NULL,
    "cod" integer NOT NULL
);


ALTER TABLE "public"."empresa_actividad" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_categoria" (
    "empkey" integer NOT NULL,
    "cod" integer NOT NULL
);


ALTER TABLE "public"."empresa_categoria" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_comercial" (
    "id" integer NOT NULL,
    "empkey" integer NOT NULL,
    "nombre_comercial" "text" NOT NULL,
    "correo_comercial" "text",
    "telefono_comercial" "text"
);


ALTER TABLE "public"."empresa_comercial" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."empresa_comercial_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."empresa_comercial_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."empresa_comercial_id_seq" OWNED BY "public"."empresa_comercial"."id";



CREATE TABLE IF NOT EXISTS "public"."empresa_contraparte_adm" (
    "empkey" integer NOT NULL,
    "rut" "text" NOT NULL
);


ALTER TABLE "public"."empresa_contraparte_adm" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_contraparte_tecnica" (
    "empkey" integer NOT NULL,
    "rut" "text" NOT NULL
);


ALTER TABLE "public"."empresa_contraparte_tecnica" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_contrato" (
    "empresa_id" bigint NOT NULL,
    "contrato_id" integer NOT NULL
);


ALTER TABLE "public"."empresa_contrato" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_dte" (
    "empresa_id" bigint NOT NULL,
    "dte_id" "text" NOT NULL
);


ALTER TABLE "public"."empresa_dte" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_impuesto" (
    "empresa_id" bigint NOT NULL,
    "impuesto_id" integer NOT NULL
);


ALTER TABLE "public"."empresa_impuesto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_onboarding" (
    "id" integer NOT NULL,
    "empkey" integer NOT NULL,
    "encargado_name" "text",
    "encargado_email" "text",
    "encargado_phone" "text",
    "estado" "text" DEFAULT 'pendiente'::"text",
    "fecha_inicio" "date",
    "fecha_fin" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "encargado_rut" "text",
    "pap_fecha_hora" timestamp with time zone,
    "casilla_intercambio" "text",
    "documentos_dte" "text"[],
    "ticket_hs" "text",
    "tipo_integracion" "text",
    "tipo_certificacion" "text",
    CONSTRAINT "empresa_onboarding_estado_check" CHECK (("estado" = ANY (ARRAY['pendiente'::"text", 'en_proceso'::"text", 'completado'::"text", 'cancelado'::"text"])))
);


ALTER TABLE "public"."empresa_onboarding" OWNER TO "postgres";


COMMENT ON COLUMN "public"."empresa_onboarding"."encargado_rut" IS 'RUT del ejecutivo de Onboarding asignado';



CREATE SEQUENCE IF NOT EXISTS "public"."empresa_onboarding_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."empresa_onboarding_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."empresa_onboarding_id_seq" OWNED BY "public"."empresa_onboarding"."id";



CREATE TABLE IF NOT EXISTS "public"."empresa_producto" (
    "empkey" integer NOT NULL,
    "producto_id" integer NOT NULL
);


ALTER TABLE "public"."empresa_producto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_representante" (
    "empkey" integer NOT NULL,
    "rut" "text" NOT NULL
);


ALTER TABLE "public"."empresa_representante" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_sac" (
    "id" integer NOT NULL,
    "empkey" integer NOT NULL,
    "nombre_sac" "text" NOT NULL,
    "correo_sac" "text",
    "telefono_sac" "text",
    "direccion_sac" "text",
    "horario_atencion" "text"
);


ALTER TABLE "public"."empresa_sac" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."empresa_sac_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."empresa_sac_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."empresa_sac_id_seq" OWNED BY "public"."empresa_sac"."id";



CREATE TABLE IF NOT EXISTS "public"."empresa_servicio" (
    "empresa_id" bigint NOT NULL,
    "servicio_id" integer NOT NULL
);


ALTER TABLE "public"."empresa_servicio" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_soporte" (
    "empresa_id" bigint NOT NULL,
    "soporte_id" integer NOT NULL
);


ALTER TABLE "public"."empresa_soporte" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_sucursal" (
    "empkey" integer NOT NULL,
    "id" "text" NOT NULL
);


ALTER TABLE "public"."empresa_sucursal" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."encargado_ef" (
    "rut" "text" NOT NULL,
    "nombre" "text",
    "telefono" "text",
    "correo" "text",
    "direccion" "text",
    "cod_interno" "text"
);


ALTER TABLE "public"."encargado_ef" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."encargado_pos" (
    "rut" "text" NOT NULL,
    "nombre" "text",
    "telefono" "text",
    "correo" "text"
);


ALTER TABLE "public"."encargado_pos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."erp" (
    "id" "text" NOT NULL,
    "nombre" "text",
    "version" "text",
    "lenguaje" "text",
    "bd" "text"
);


ALTER TABLE "public"."erp" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ficha_tecnica" (
    "id" integer NOT NULL,
    "sistema_id" "text",
    "version_so_id" "text",
    "version_app_id" "text",
    "admin_folios_id" integer,
    "integracion_id" integer,
    "retorno_id" integer,
    "layout_id" "text",
    "modo_firma" "text",
    "modo_impresion" "text"
);


ALTER TABLE "public"."ficha_tecnica" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ficha_tecnica_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."ficha_tecnica_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ficha_tecnica_id_seq" OWNED BY "public"."ficha_tecnica"."id";



CREATE TABLE IF NOT EXISTS "public"."historial_movimientos" (
    "id" integer NOT NULL,
    "tabla" "text" NOT NULL,
    "registro_id" "text" NOT NULL,
    "accion" "text",
    "cambios" "jsonb",
    "usuario" "text",
    "fecha" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "historial_movimientos_accion_check" CHECK (("accion" = ANY (ARRAY['INSERT'::"text", 'UPDATE'::"text", 'DELETE'::"text"])))
);


ALTER TABLE "public"."historial_movimientos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."historial_movimientos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."historial_movimientos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."historial_movimientos_id_seq" OWNED BY "public"."historial_movimientos"."id";



CREATE TABLE IF NOT EXISTS "public"."integracion" (
    "id" integer NOT NULL,
    "parser" boolean
);


ALTER TABLE "public"."integracion" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."integracion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."integracion_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."integracion_id_seq" OWNED BY "public"."integracion"."id";



CREATE TABLE IF NOT EXISTS "public"."layout" (
    "cod" "text" NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."layout" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_notificacion" (
    "id" bigint NOT NULL,
    "empkey" integer NOT NULL,
    "tipo" "text" NOT NULL,
    "descripcion" "text",
    "visto" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "onboarding_notificacion_tipo_check" CHECK (("tipo" = ANY (ARRAY['llego_ob'::"text", 'asignado_ejecutivo'::"text", 'inicio_configuracion'::"text", 'inicio_pap'::"text", 'enviado_sac'::"text"])))
);


ALTER TABLE "public"."onboarding_notificacion" OWNER TO "postgres";


ALTER TABLE "public"."onboarding_notificacion" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."onboarding_notificacion_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."pap_sac" (
    "empkey" integer NOT NULL,
    "estado" "text" DEFAULT 'PENDIENTE'::"text" NOT NULL,
    "fecha_hora" timestamp with time zone,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pap_sac" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pap_solicitud" (
    "id" bigint NOT NULL,
    "empkey" integer NOT NULL,
    "creado_por_rut" "text",
    "asignado_a_rut" "text",
    "completado_por_rut" "text",
    "estado" "text" DEFAULT 'pendiente'::"text" NOT NULL,
    "enviado_a_sac_at" timestamp with time zone,
    "inicio_pap_at" timestamp with time zone,
    "completado_at" timestamp with time zone,
    "comentario" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "pap_solicitud_estado_check" CHECK (("estado" = ANY (ARRAY['pendiente'::"text", 'asignada'::"text", 'en_proceso'::"text", 'completada'::"text", 'rechazada'::"text", 'cancelada'::"text"])))
);


ALTER TABLE "public"."pap_solicitud" OWNER TO "postgres";


ALTER TABLE "public"."pap_solicitud" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."pap_solicitud_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."perfil_ef" (
    "id" integer NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."perfil_ef" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."perfil_ef_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."perfil_ef_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."perfil_ef_id_seq" OWNED BY "public"."perfil_ef"."id";



CREATE TABLE IF NOT EXISTS "public"."perfil_encargado_ef" (
    "perfil_id" integer NOT NULL,
    "rut" "text" NOT NULL
);


ALTER TABLE "public"."perfil_encargado_ef" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfil_encargado_pos" (
    "perfil_id" integer NOT NULL,
    "rut" "text" NOT NULL
);


ALTER TABLE "public"."perfil_encargado_pos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfil_pos" (
    "id" integer NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."perfil_pos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."perfil_pos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."perfil_pos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."perfil_pos_id_seq" OWNED BY "public"."perfil_pos"."id";



CREATE TABLE IF NOT EXISTS "public"."perfil_usuarios" (
    "id" integer NOT NULL,
    "nombre" "text" NOT NULL,
    CONSTRAINT "perfil_usuarios_nombre_check" CHECK (("nombre" = ANY (ARRAY['OB'::"text", 'SAC'::"text", 'COM'::"text", 'ADMIN'::"text", 'ADMIN_SAC'::"text", 'ADMIN_OB'::"text"])))
);


ALTER TABLE "public"."perfil_usuarios" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."perfil_usuarios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."perfil_usuarios_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."perfil_usuarios_id_seq" OWNED BY "public"."perfil_usuarios"."id";



CREATE TABLE IF NOT EXISTS "public"."producto" (
    "id" integer NOT NULL,
    "tipo" "text",
    CONSTRAINT "producto_tipo_check" CHECK (("tipo" = ANY (ARRAY['ENTERFAC'::"text", 'ANDESPOS'::"text"])))
);


ALTER TABLE "public"."producto" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."producto_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."producto_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."producto_id_seq" OWNED BY "public"."producto"."id";



CREATE TABLE IF NOT EXISTS "public"."protocolo_comunicacion" (
    "id" integer NOT NULL,
    "nombre" "text",
    "descripcion" "text"
);


ALTER TABLE "public"."protocolo_comunicacion" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."protocolo_comunicacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."protocolo_comunicacion_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."protocolo_comunicacion_id_seq" OWNED BY "public"."protocolo_comunicacion"."id";



CREATE TABLE IF NOT EXISTS "public"."representante_legal" (
    "rut" "text" NOT NULL,
    "nombre" "text",
    "correo" "text",
    "telefono" "text"
);


ALTER TABLE "public"."representante_legal" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."retorno_integracion" (
    "id" integer NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."retorno_integracion" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."retorno_integracion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."retorno_integracion_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."retorno_integracion_id_seq" OWNED BY "public"."retorno_integracion"."id";



CREATE TABLE IF NOT EXISTS "public"."sac_evento" (
    "id" bigint NOT NULL,
    "empkey" integer NOT NULL,
    "tipo" "text" NOT NULL,
    "actor_rut" "text",
    "asignado_a_rut" "text",
    "detalle" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sac_evento_tipo_check" CHECK (("tipo" = ANY (ARRAY['LLEGO'::"text", 'ASIGNADO'::"text", 'REPROGRAMADO'::"text", 'DESAFILIADO'::"text", 'COMPLETADO'::"text"])))
);


ALTER TABLE "public"."sac_evento" OWNER TO "postgres";


ALTER TABLE "public"."sac_evento" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."sac_evento_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."sac_notificacion" (
    "id" bigint NOT NULL,
    "destinatario_rut" "text" NOT NULL,
    "titulo" "text",
    "mensaje" "text",
    "empkey" integer,
    "leida" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sac_notificacion" OWNER TO "postgres";


ALTER TABLE "public"."sac_notificacion" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."sac_notificacion_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."servicio" (
    "id" integer NOT NULL,
    "nombre" "text" NOT NULL
);


ALTER TABLE "public"."servicio" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."servicio_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."servicio_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."servicio_id_seq" OWNED BY "public"."servicio"."id";



CREATE TABLE IF NOT EXISTS "public"."sistema_operativo" (
    "id" "text" NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."sistema_operativo" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sucursal_ef" (
    "id" "text" NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."sucursal_ef" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sucursal_pos" (
    "id" "text" NOT NULL,
    "nombre" "text",
    "direccion" "text",
    "box" boolean,
    "cant_box" integer,
    "cajas" integer,
    "otros" "text"
);


ALTER TABLE "public"."sucursal_pos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tipo_contrato" (
    "id" integer NOT NULL,
    "nombre" "text",
    "descripcion" "text"
);


ALTER TABLE "public"."tipo_contrato" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tipo_contrato_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tipo_contrato_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tipo_contrato_id_seq" OWNED BY "public"."tipo_contrato"."id";



CREATE TABLE IF NOT EXISTS "public"."tipo_dte" (
    "id" "text" NOT NULL,
    "nombre" "text" NOT NULL
);


ALTER TABLE "public"."tipo_dte" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tipo_impuesto" (
    "cod" integer NOT NULL,
    "nombre" "text" NOT NULL
);


ALTER TABLE "public"."tipo_impuesto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tipo_mensaje" (
    "id" integer NOT NULL,
    "nombre" "text",
    "descripcion" "text"
);


ALTER TABLE "public"."tipo_mensaje" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tipo_mensaje_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tipo_mensaje_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tipo_mensaje_id_seq" OWNED BY "public"."tipo_mensaje"."id";



CREATE TABLE IF NOT EXISTS "public"."tipo_soporte" (
    "id" integer NOT NULL,
    "nombre" "text",
    "descripcion" "text"
);


ALTER TABLE "public"."tipo_soporte" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tipo_soporte_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tipo_soporte_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tipo_soporte_id_seq" OWNED BY "public"."tipo_soporte"."id";



CREATE TABLE IF NOT EXISTS "public"."usuario" (
    "rut" "text" NOT NULL,
    "nombre" "text" NOT NULL,
    "correo" "text",
    "telefono" "text",
    "perfil_id" integer
);


ALTER TABLE "public"."usuario" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."version_app_full" (
    "id" "text" NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."version_app_full" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."version_sistema_operativo" (
    "id" "text" NOT NULL,
    "nombre" "text",
    "so_id" "text"
);


ALTER TABLE "public"."version_sistema_operativo" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vw_empresa_produccion_resumen" AS
 SELECT "e"."empkey",
    "e"."rut",
    COALESCE("e"."nombre", "e"."nombre_fantasia", 'Sin nombre'::"text") AS "razon_social",
    "ps"."completado_at" AS "fecha_pap_completado",
    "uob"."nombre" AS "ejecutivo_ob",
    "usac"."nombre" AS "ejecutivo_sac",
        CASE
            WHEN ("ps"."estado" = 'completada'::"text") THEN 'PRODUCCIÓN'::"text"
            WHEN ("ps"."estado" = ANY (ARRAY['en_proceso'::"text", 'asignada'::"text", 'pendiente'::"text"])) THEN 'EN SAC'::"text"
            WHEN ("ps"."estado" IS NULL) THEN 'SIN PAP'::"text"
            ELSE "upper"("ps"."estado")
        END AS "estado_final"
   FROM ((("public"."empresa" "e"
     LEFT JOIN LATERAL ( SELECT "pap_solicitud"."id",
            "pap_solicitud"."empkey",
            "pap_solicitud"."creado_por_rut",
            "pap_solicitud"."asignado_a_rut",
            "pap_solicitud"."completado_por_rut",
            "pap_solicitud"."estado",
            "pap_solicitud"."enviado_a_sac_at",
            "pap_solicitud"."inicio_pap_at",
            "pap_solicitud"."completado_at",
            "pap_solicitud"."comentario",
            "pap_solicitud"."created_at",
            "pap_solicitud"."updated_at"
           FROM "public"."pap_solicitud"
          WHERE ("pap_solicitud"."empkey" = "e"."empkey")
          ORDER BY "pap_solicitud"."updated_at" DESC
         LIMIT 1) "ps" ON (true))
     LEFT JOIN "public"."usuario" "uob" ON (("uob"."rut" = "ps"."creado_por_rut")))
     LEFT JOIN "public"."usuario" "usac" ON (("usac"."rut" = "ps"."completado_por_rut")));


ALTER VIEW "public"."vw_empresa_produccion_resumen" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vw_empresas_activas_admin_sac" AS
 SELECT "e"."empkey",
    "e"."rut",
    "e"."nombre",
    "e"."logo",
    "e"."paso_produccion_at" AS "fecha_paso_produccion",
    "uob"."nombre" AS "ejecutivo_ob",
    "usac"."nombre" AS "ejecutivo_sac",
        CASE
            WHEN ("e"."estado" = 'COMPLETADA'::"text") THEN 'ACTIVA'::"text"
            WHEN ("e"."estado" = 'PRODUCCION'::"text") THEN 'PRODUCCION'::"text"
            ELSE "e"."estado"
        END AS "estado_final"
   FROM ((("public"."empresa" "e"
     LEFT JOIN LATERAL ( SELECT "ob_1"."id",
            "ob_1"."empkey",
            "ob_1"."encargado_name",
            "ob_1"."encargado_email",
            "ob_1"."encargado_phone",
            "ob_1"."estado",
            "ob_1"."fecha_inicio",
            "ob_1"."fecha_fin",
            "ob_1"."created_at",
            "ob_1"."updated_at",
            "ob_1"."encargado_rut",
            "ob_1"."pap_fecha_hora",
            "ob_1"."casilla_intercambio",
            "ob_1"."documentos_dte",
            "ob_1"."ticket_hs",
            "ob_1"."tipo_integracion",
            "ob_1"."tipo_certificacion"
           FROM "public"."empresa_onboarding" "ob_1"
          WHERE ("ob_1"."empkey" = "e"."empkey")
          ORDER BY "ob_1"."updated_at" DESC NULLS LAST
         LIMIT 1) "ob" ON (true))
     LEFT JOIN "public"."usuario" "uob" ON (("uob"."rut" = "ob"."encargado_rut")))
     LEFT JOIN "public"."usuario" "usac" ON (("usac"."rut" = "e"."paso_produccion_por_rut")))
  WHERE ("e"."estado" = ANY (ARRAY['PRODUCCION'::"text", 'COMPLETADA'::"text"]));


ALTER VIEW "public"."vw_empresas_activas_admin_sac" OWNER TO "postgres";


ALTER TABLE ONLY "public"."administrador_folios" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."administrador_folios_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."empresa_comercial" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."empresa_comercial_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."empresa_onboarding" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."empresa_onboarding_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."empresa_sac" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."empresa_sac_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ficha_tecnica" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ficha_tecnica_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."historial_movimientos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."historial_movimientos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."integracion" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."integracion_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."perfil_ef" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."perfil_ef_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."perfil_pos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."perfil_pos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."perfil_usuarios" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."perfil_usuarios_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."producto" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."producto_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."protocolo_comunicacion" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."protocolo_comunicacion_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."retorno_integracion" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."retorno_integracion_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."servicio" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."servicio_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tipo_contrato" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tipo_contrato_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tipo_mensaje" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tipo_mensaje_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tipo_soporte" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tipo_soporte_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."actividades_economicas"
    ADD CONSTRAINT "actividades_economicas_pkey" PRIMARY KEY ("cod");



ALTER TABLE ONLY "public"."administrador_folios"
    ADD CONSTRAINT "administrador_folios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."box"
    ADD CONSTRAINT "box_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."box"
    ADD CONSTRAINT "box_sucursal_id_key" UNIQUE ("sucursal_id");



ALTER TABLE ONLY "public"."categorias_tributarias"
    ADD CONSTRAINT "categorias_tributarias_pkey" PRIMARY KEY ("cod");



ALTER TABLE ONLY "public"."codigo_producto"
    ADD CONSTRAINT "codigo_producto_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."contraparte_administrativa"
    ADD CONSTRAINT "contraparte_administrativa_pkey" PRIMARY KEY ("rut");



ALTER TABLE ONLY "public"."contraparte_tecnica"
    ADD CONSTRAINT "contraparte_tecnica_pkey" PRIMARY KEY ("rut");



ALTER TABLE ONLY "public"."empresa_actividad"
    ADD CONSTRAINT "empresa_actividad_pkey" PRIMARY KEY ("empkey", "cod");



ALTER TABLE ONLY "public"."empresa_categoria"
    ADD CONSTRAINT "empresa_categoria_pkey" PRIMARY KEY ("empkey", "cod");



ALTER TABLE ONLY "public"."empresa_comercial"
    ADD CONSTRAINT "empresa_comercial_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empresa_contraparte_adm"
    ADD CONSTRAINT "empresa_contraparte_adm_pkey" PRIMARY KEY ("empkey", "rut");



ALTER TABLE ONLY "public"."empresa_contraparte_tecnica"
    ADD CONSTRAINT "empresa_contraparte_tecnica_pkey" PRIMARY KEY ("empkey", "rut");



ALTER TABLE ONLY "public"."empresa_contrato"
    ADD CONSTRAINT "empresa_contrato_pkey" PRIMARY KEY ("empresa_id", "contrato_id");



ALTER TABLE ONLY "public"."empresa_dte"
    ADD CONSTRAINT "empresa_dte_pkey" PRIMARY KEY ("empresa_id", "dte_id");



ALTER TABLE ONLY "public"."empresa_impuesto"
    ADD CONSTRAINT "empresa_impuesto_pkey" PRIMARY KEY ("empresa_id", "impuesto_id");



ALTER TABLE ONLY "public"."empresa_onboarding"
    ADD CONSTRAINT "empresa_onboarding_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empresa"
    ADD CONSTRAINT "empresa_pkey" PRIMARY KEY ("empkey");



ALTER TABLE ONLY "public"."empresa_producto"
    ADD CONSTRAINT "empresa_producto_pkey" PRIMARY KEY ("empkey", "producto_id");



ALTER TABLE ONLY "public"."empresa_representante"
    ADD CONSTRAINT "empresa_representante_pkey" PRIMARY KEY ("empkey", "rut");



ALTER TABLE ONLY "public"."empresa"
    ADD CONSTRAINT "empresa_rut_key" UNIQUE ("rut");



ALTER TABLE ONLY "public"."empresa_sac"
    ADD CONSTRAINT "empresa_sac_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empresa_servicio"
    ADD CONSTRAINT "empresa_servicio_pkey" PRIMARY KEY ("empresa_id", "servicio_id");



ALTER TABLE ONLY "public"."empresa_soporte"
    ADD CONSTRAINT "empresa_soporte_pkey" PRIMARY KEY ("empresa_id", "soporte_id");



ALTER TABLE ONLY "public"."empresa_sucursal"
    ADD CONSTRAINT "empresa_sucursal_pkey" PRIMARY KEY ("empkey", "id");



ALTER TABLE ONLY "public"."encargado_ef"
    ADD CONSTRAINT "encargado_ef_pkey" PRIMARY KEY ("rut");



ALTER TABLE ONLY "public"."encargado_pos"
    ADD CONSTRAINT "encargado_pos_pkey" PRIMARY KEY ("rut");



ALTER TABLE ONLY "public"."erp"
    ADD CONSTRAINT "erp_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ficha_tecnica"
    ADD CONSTRAINT "ficha_tecnica_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."historial_movimientos"
    ADD CONSTRAINT "historial_movimientos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integracion"
    ADD CONSTRAINT "integracion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."layout"
    ADD CONSTRAINT "layout_pkey" PRIMARY KEY ("cod");



ALTER TABLE ONLY "public"."onboarding_notificacion"
    ADD CONSTRAINT "onboarding_notificacion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pap_sac"
    ADD CONSTRAINT "pap_sac_pkey" PRIMARY KEY ("empkey");



ALTER TABLE ONLY "public"."pap_solicitud"
    ADD CONSTRAINT "pap_solicitud_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfil_ef"
    ADD CONSTRAINT "perfil_ef_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfil_encargado_ef"
    ADD CONSTRAINT "perfil_encargado_ef_pkey" PRIMARY KEY ("perfil_id", "rut");



ALTER TABLE ONLY "public"."perfil_encargado_pos"
    ADD CONSTRAINT "perfil_encargado_pos_pkey" PRIMARY KEY ("perfil_id", "rut");



ALTER TABLE ONLY "public"."perfil_pos"
    ADD CONSTRAINT "perfil_pos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfil_usuarios"
    ADD CONSTRAINT "perfil_usuarios_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."perfil_usuarios"
    ADD CONSTRAINT "perfil_usuarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."producto"
    ADD CONSTRAINT "producto_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."protocolo_comunicacion"
    ADD CONSTRAINT "protocolo_comunicacion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."representante_legal"
    ADD CONSTRAINT "representante_legal_pkey" PRIMARY KEY ("rut");



ALTER TABLE ONLY "public"."retorno_integracion"
    ADD CONSTRAINT "retorno_integracion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sac_evento"
    ADD CONSTRAINT "sac_evento_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sac_notificacion"
    ADD CONSTRAINT "sac_notificacion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."servicio"
    ADD CONSTRAINT "servicio_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sistema_operativo"
    ADD CONSTRAINT "sistema_operativo_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sucursal_ef"
    ADD CONSTRAINT "sucursal_ef_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sucursal_pos"
    ADD CONSTRAINT "sucursal_pos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tipo_contrato"
    ADD CONSTRAINT "tipo_contrato_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tipo_dte"
    ADD CONSTRAINT "tipo_dte_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tipo_impuesto"
    ADD CONSTRAINT "tipo_impuesto_pkey" PRIMARY KEY ("cod");



ALTER TABLE ONLY "public"."tipo_mensaje"
    ADD CONSTRAINT "tipo_mensaje_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tipo_soporte"
    ADD CONSTRAINT "tipo_soporte_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuario"
    ADD CONSTRAINT "usuario_pkey" PRIMARY KEY ("rut");



ALTER TABLE ONLY "public"."version_app_full"
    ADD CONSTRAINT "version_app_full_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."version_sistema_operativo"
    ADD CONSTRAINT "version_sistema_operativo_pkey" PRIMARY KEY ("id");



CREATE INDEX "empresa_onboarding_encargado_rut_idx" ON "public"."empresa_onboarding" USING "btree" ("encargado_rut");



CREATE INDEX "idx_empresa_estado" ON "public"."empresa" USING "btree" ("estado");



CREATE INDEX "idx_empresa_onboarding_empkey" ON "public"."empresa_onboarding" USING "btree" ("empkey");



CREATE INDEX "idx_empresa_onboarding_encargado_rut" ON "public"."empresa_onboarding" USING "btree" ("encargado_rut");



CREATE INDEX "idx_empresa_onboarding_estado" ON "public"."empresa_onboarding" USING "btree" ("estado");



CREATE INDEX "idx_empresa_paso_prod_at" ON "public"."empresa" USING "btree" ("paso_produccion_at");



CREATE INDEX "idx_empresa_paso_prod_por" ON "public"."empresa" USING "btree" ("paso_produccion_por_rut");



CREATE INDEX "idx_empresa_producto" ON "public"."empresa" USING "btree" ("producto");



CREATE INDEX "idx_ob_pap_fecha" ON "public"."empresa_onboarding" USING "btree" ("pap_fecha_hora");



CREATE INDEX "idx_onboarding_notificacion_empkey" ON "public"."onboarding_notificacion" USING "btree" ("empkey");



CREATE INDEX "idx_onboarding_notificacion_visto_created_at" ON "public"."onboarding_notificacion" USING "btree" ("visto", "created_at");



CREATE INDEX "idx_pap_sac_empkey" ON "public"."pap_sac" USING "btree" ("empkey");



CREATE INDEX "onboarding_notif_empkey_idx" ON "public"."onboarding_notificacion" USING "btree" ("empkey");



CREATE INDEX "onboarding_notif_visto_created_idx" ON "public"."onboarding_notificacion" USING "btree" ("visto", "created_at" DESC);



CREATE INDEX "sac_evento_created_at_idx" ON "public"."sac_evento" USING "btree" ("created_at");



CREATE INDEX "sac_evento_empkey_idx" ON "public"."sac_evento" USING "btree" ("empkey");



CREATE INDEX "sac_evento_tipo_idx" ON "public"."sac_evento" USING "btree" ("tipo");



CREATE INDEX "sac_notificacion_created_at_idx" ON "public"."sac_notificacion" USING "btree" ("created_at");



CREATE INDEX "sac_notificacion_destinatario_idx" ON "public"."sac_notificacion" USING "btree" ("destinatario_rut");



CREATE INDEX "sac_notificacion_leida_idx" ON "public"."sac_notificacion" USING "btree" ("leida");



CREATE OR REPLACE TRIGGER "set_updated_at_on_empresa_onboarding" BEFORE UPDATE ON "public"."empresa_onboarding" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_pap_solicitud_updated_at" BEFORE UPDATE ON "public"."pap_solicitud" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "update_empresa_updated_at" BEFORE UPDATE ON "public"."empresa" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."box"
    ADD CONSTRAINT "box_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "public"."sucursal_pos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."codigo_producto"
    ADD CONSTRAINT "codigo_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "public"."producto"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_actividad"
    ADD CONSTRAINT "empresa_actividad_cod_fkey" FOREIGN KEY ("cod") REFERENCES "public"."actividades_economicas"("cod");



ALTER TABLE ONLY "public"."empresa_actividad"
    ADD CONSTRAINT "empresa_actividad_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_categoria"
    ADD CONSTRAINT "empresa_categoria_cod_fkey" FOREIGN KEY ("cod") REFERENCES "public"."categorias_tributarias"("cod");



ALTER TABLE ONLY "public"."empresa_categoria"
    ADD CONSTRAINT "empresa_categoria_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_contraparte_adm"
    ADD CONSTRAINT "empresa_contraparte_adm_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_contraparte_adm"
    ADD CONSTRAINT "empresa_contraparte_adm_rut_fkey" FOREIGN KEY ("rut") REFERENCES "public"."contraparte_administrativa"("rut");



ALTER TABLE ONLY "public"."empresa_contraparte_tecnica"
    ADD CONSTRAINT "empresa_contraparte_tecnica_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_contraparte_tecnica"
    ADD CONSTRAINT "empresa_contraparte_tecnica_rut_fkey" FOREIGN KEY ("rut") REFERENCES "public"."contraparte_tecnica"("rut");



ALTER TABLE ONLY "public"."empresa_contrato"
    ADD CONSTRAINT "empresa_contrato_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "public"."tipo_contrato"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_contrato"
    ADD CONSTRAINT "empresa_contrato_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_dte"
    ADD CONSTRAINT "empresa_dte_dte_id_fkey" FOREIGN KEY ("dte_id") REFERENCES "public"."tipo_dte"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_dte"
    ADD CONSTRAINT "empresa_dte_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_impuesto"
    ADD CONSTRAINT "empresa_impuesto_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_impuesto"
    ADD CONSTRAINT "empresa_impuesto_impuesto_id_fkey" FOREIGN KEY ("impuesto_id") REFERENCES "public"."tipo_impuesto"("cod") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa"
    ADD CONSTRAINT "empresa_paso_produccion_por_fkey" FOREIGN KEY ("paso_produccion_por_rut") REFERENCES "public"."usuario"("rut");



ALTER TABLE ONLY "public"."empresa_producto"
    ADD CONSTRAINT "empresa_producto_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_producto"
    ADD CONSTRAINT "empresa_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "public"."producto"("id");



ALTER TABLE ONLY "public"."empresa_representante"
    ADD CONSTRAINT "empresa_representante_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_representante"
    ADD CONSTRAINT "empresa_representante_rut_fkey" FOREIGN KEY ("rut") REFERENCES "public"."representante_legal"("rut");



ALTER TABLE ONLY "public"."empresa_servicio"
    ADD CONSTRAINT "empresa_servicio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_servicio"
    ADD CONSTRAINT "empresa_servicio_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicio"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_soporte"
    ADD CONSTRAINT "empresa_soporte_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_soporte"
    ADD CONSTRAINT "empresa_soporte_soporte_id_fkey" FOREIGN KEY ("soporte_id") REFERENCES "public"."tipo_soporte"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_sucursal"
    ADD CONSTRAINT "empresa_sucursal_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_sucursal"
    ADD CONSTRAINT "empresa_sucursal_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."sucursal_pos"("id");



ALTER TABLE ONLY "public"."ficha_tecnica"
    ADD CONSTRAINT "ficha_tecnica_admin_folios_id_fkey" FOREIGN KEY ("admin_folios_id") REFERENCES "public"."administrador_folios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ficha_tecnica"
    ADD CONSTRAINT "ficha_tecnica_integracion_id_fkey" FOREIGN KEY ("integracion_id") REFERENCES "public"."integracion"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ficha_tecnica"
    ADD CONSTRAINT "ficha_tecnica_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "public"."layout"("cod") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ficha_tecnica"
    ADD CONSTRAINT "ficha_tecnica_retorno_id_fkey" FOREIGN KEY ("retorno_id") REFERENCES "public"."retorno_integracion"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ficha_tecnica"
    ADD CONSTRAINT "ficha_tecnica_sistema_id_fkey" FOREIGN KEY ("sistema_id") REFERENCES "public"."sistema_operativo"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ficha_tecnica"
    ADD CONSTRAINT "ficha_tecnica_version_app_id_fkey" FOREIGN KEY ("version_app_id") REFERENCES "public"."version_app_full"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ficha_tecnica"
    ADD CONSTRAINT "ficha_tecnica_version_so_id_fkey" FOREIGN KEY ("version_so_id") REFERENCES "public"."version_sistema_operativo"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."empresa_comercial"
    ADD CONSTRAINT "fk_empresa" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_onboarding"
    ADD CONSTRAINT "fk_empresa_onboarding" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_sac"
    ADD CONSTRAINT "fk_empresa_sac" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_notificacion"
    ADD CONSTRAINT "onboarding_notificacion_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pap_sac"
    ADD CONSTRAINT "pap_sac_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pap_solicitud"
    ADD CONSTRAINT "pap_solicitud_asignado_a_rut_fkey" FOREIGN KEY ("asignado_a_rut") REFERENCES "public"."usuario"("rut");



ALTER TABLE ONLY "public"."pap_solicitud"
    ADD CONSTRAINT "pap_solicitud_completado_por_rut_fkey" FOREIGN KEY ("completado_por_rut") REFERENCES "public"."usuario"("rut");



ALTER TABLE ONLY "public"."pap_solicitud"
    ADD CONSTRAINT "pap_solicitud_creado_por_rut_fkey" FOREIGN KEY ("creado_por_rut") REFERENCES "public"."usuario"("rut");



ALTER TABLE ONLY "public"."pap_solicitud"
    ADD CONSTRAINT "pap_solicitud_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey");



ALTER TABLE ONLY "public"."perfil_encargado_ef"
    ADD CONSTRAINT "perfil_encargado_ef_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfil_ef"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfil_encargado_ef"
    ADD CONSTRAINT "perfil_encargado_ef_rut_fkey" FOREIGN KEY ("rut") REFERENCES "public"."encargado_ef"("rut") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfil_encargado_pos"
    ADD CONSTRAINT "perfil_encargado_pos_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfil_pos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfil_encargado_pos"
    ADD CONSTRAINT "perfil_encargado_pos_rut_fkey" FOREIGN KEY ("rut") REFERENCES "public"."encargado_pos"("rut") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sac_evento"
    ADD CONSTRAINT "sac_evento_actor_rut_fkey" FOREIGN KEY ("actor_rut") REFERENCES "public"."usuario"("rut");



ALTER TABLE ONLY "public"."sac_evento"
    ADD CONSTRAINT "sac_evento_asignado_a_rut_fkey" FOREIGN KEY ("asignado_a_rut") REFERENCES "public"."usuario"("rut");



ALTER TABLE ONLY "public"."sac_evento"
    ADD CONSTRAINT "sac_evento_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sac_notificacion"
    ADD CONSTRAINT "sac_notificacion_destinatario_rut_fkey" FOREIGN KEY ("destinatario_rut") REFERENCES "public"."usuario"("rut") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sac_notificacion"
    ADD CONSTRAINT "sac_notificacion_empkey_fkey" FOREIGN KEY ("empkey") REFERENCES "public"."empresa"("empkey") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."usuario"
    ADD CONSTRAINT "usuario_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfil_usuarios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."version_sistema_operativo"
    ADD CONSTRAINT "version_sistema_operativo_so_id_fkey" FOREIGN KEY ("so_id") REFERENCES "public"."sistema_operativo"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."actividades_economicas" TO "anon";
GRANT ALL ON TABLE "public"."actividades_economicas" TO "authenticated";
GRANT ALL ON TABLE "public"."actividades_economicas" TO "service_role";



GRANT ALL ON TABLE "public"."administrador_folios" TO "anon";
GRANT ALL ON TABLE "public"."administrador_folios" TO "authenticated";
GRANT ALL ON TABLE "public"."administrador_folios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."administrador_folios_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."administrador_folios_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."administrador_folios_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."box" TO "anon";
GRANT ALL ON TABLE "public"."box" TO "authenticated";
GRANT ALL ON TABLE "public"."box" TO "service_role";



GRANT ALL ON TABLE "public"."categorias_tributarias" TO "anon";
GRANT ALL ON TABLE "public"."categorias_tributarias" TO "authenticated";
GRANT ALL ON TABLE "public"."categorias_tributarias" TO "service_role";



GRANT ALL ON TABLE "public"."codigo_producto" TO "anon";
GRANT ALL ON TABLE "public"."codigo_producto" TO "authenticated";
GRANT ALL ON TABLE "public"."codigo_producto" TO "service_role";



GRANT ALL ON TABLE "public"."contraparte_administrativa" TO "anon";
GRANT ALL ON TABLE "public"."contraparte_administrativa" TO "authenticated";
GRANT ALL ON TABLE "public"."contraparte_administrativa" TO "service_role";



GRANT ALL ON TABLE "public"."contraparte_tecnica" TO "anon";
GRANT ALL ON TABLE "public"."contraparte_tecnica" TO "authenticated";
GRANT ALL ON TABLE "public"."contraparte_tecnica" TO "service_role";



GRANT ALL ON TABLE "public"."empresa" TO "anon";
GRANT ALL ON TABLE "public"."empresa" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_actividad" TO "anon";
GRANT ALL ON TABLE "public"."empresa_actividad" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_actividad" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_categoria" TO "anon";
GRANT ALL ON TABLE "public"."empresa_categoria" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_categoria" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_comercial" TO "anon";
GRANT ALL ON TABLE "public"."empresa_comercial" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_comercial" TO "service_role";



GRANT ALL ON SEQUENCE "public"."empresa_comercial_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."empresa_comercial_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."empresa_comercial_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_contraparte_adm" TO "anon";
GRANT ALL ON TABLE "public"."empresa_contraparte_adm" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_contraparte_adm" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_contraparte_tecnica" TO "anon";
GRANT ALL ON TABLE "public"."empresa_contraparte_tecnica" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_contraparte_tecnica" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_contrato" TO "anon";
GRANT ALL ON TABLE "public"."empresa_contrato" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_contrato" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_dte" TO "anon";
GRANT ALL ON TABLE "public"."empresa_dte" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_dte" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_impuesto" TO "anon";
GRANT ALL ON TABLE "public"."empresa_impuesto" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_impuesto" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_onboarding" TO "anon";
GRANT ALL ON TABLE "public"."empresa_onboarding" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_onboarding" TO "service_role";



GRANT ALL ON SEQUENCE "public"."empresa_onboarding_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."empresa_onboarding_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."empresa_onboarding_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_producto" TO "anon";
GRANT ALL ON TABLE "public"."empresa_producto" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_producto" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_representante" TO "anon";
GRANT ALL ON TABLE "public"."empresa_representante" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_representante" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_sac" TO "anon";
GRANT ALL ON TABLE "public"."empresa_sac" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_sac" TO "service_role";



GRANT ALL ON SEQUENCE "public"."empresa_sac_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."empresa_sac_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."empresa_sac_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_servicio" TO "anon";
GRANT ALL ON TABLE "public"."empresa_servicio" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_servicio" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_soporte" TO "anon";
GRANT ALL ON TABLE "public"."empresa_soporte" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_soporte" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_sucursal" TO "anon";
GRANT ALL ON TABLE "public"."empresa_sucursal" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_sucursal" TO "service_role";



GRANT ALL ON TABLE "public"."encargado_ef" TO "anon";
GRANT ALL ON TABLE "public"."encargado_ef" TO "authenticated";
GRANT ALL ON TABLE "public"."encargado_ef" TO "service_role";



GRANT ALL ON TABLE "public"."encargado_pos" TO "anon";
GRANT ALL ON TABLE "public"."encargado_pos" TO "authenticated";
GRANT ALL ON TABLE "public"."encargado_pos" TO "service_role";



GRANT ALL ON TABLE "public"."erp" TO "anon";
GRANT ALL ON TABLE "public"."erp" TO "authenticated";
GRANT ALL ON TABLE "public"."erp" TO "service_role";



GRANT ALL ON TABLE "public"."ficha_tecnica" TO "anon";
GRANT ALL ON TABLE "public"."ficha_tecnica" TO "authenticated";
GRANT ALL ON TABLE "public"."ficha_tecnica" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ficha_tecnica_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ficha_tecnica_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ficha_tecnica_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."historial_movimientos" TO "anon";
GRANT ALL ON TABLE "public"."historial_movimientos" TO "authenticated";
GRANT ALL ON TABLE "public"."historial_movimientos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."historial_movimientos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."historial_movimientos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."historial_movimientos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."integracion" TO "anon";
GRANT ALL ON TABLE "public"."integracion" TO "authenticated";
GRANT ALL ON TABLE "public"."integracion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."integracion_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."integracion_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."integracion_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."layout" TO "anon";
GRANT ALL ON TABLE "public"."layout" TO "authenticated";
GRANT ALL ON TABLE "public"."layout" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_notificacion" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_notificacion" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_notificacion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."onboarding_notificacion_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."onboarding_notificacion_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."onboarding_notificacion_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."pap_sac" TO "anon";
GRANT ALL ON TABLE "public"."pap_sac" TO "authenticated";
GRANT ALL ON TABLE "public"."pap_sac" TO "service_role";



GRANT ALL ON TABLE "public"."pap_solicitud" TO "anon";
GRANT ALL ON TABLE "public"."pap_solicitud" TO "authenticated";
GRANT ALL ON TABLE "public"."pap_solicitud" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pap_solicitud_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pap_solicitud_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pap_solicitud_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."perfil_ef" TO "anon";
GRANT ALL ON TABLE "public"."perfil_ef" TO "authenticated";
GRANT ALL ON TABLE "public"."perfil_ef" TO "service_role";



GRANT ALL ON SEQUENCE "public"."perfil_ef_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."perfil_ef_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."perfil_ef_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."perfil_encargado_ef" TO "anon";
GRANT ALL ON TABLE "public"."perfil_encargado_ef" TO "authenticated";
GRANT ALL ON TABLE "public"."perfil_encargado_ef" TO "service_role";



GRANT ALL ON TABLE "public"."perfil_encargado_pos" TO "anon";
GRANT ALL ON TABLE "public"."perfil_encargado_pos" TO "authenticated";
GRANT ALL ON TABLE "public"."perfil_encargado_pos" TO "service_role";



GRANT ALL ON TABLE "public"."perfil_pos" TO "anon";
GRANT ALL ON TABLE "public"."perfil_pos" TO "authenticated";
GRANT ALL ON TABLE "public"."perfil_pos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."perfil_pos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."perfil_pos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."perfil_pos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."perfil_usuarios" TO "anon";
GRANT ALL ON TABLE "public"."perfil_usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."perfil_usuarios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."perfil_usuarios_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."perfil_usuarios_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."perfil_usuarios_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."producto" TO "anon";
GRANT ALL ON TABLE "public"."producto" TO "authenticated";
GRANT ALL ON TABLE "public"."producto" TO "service_role";



GRANT ALL ON SEQUENCE "public"."producto_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."producto_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."producto_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."protocolo_comunicacion" TO "anon";
GRANT ALL ON TABLE "public"."protocolo_comunicacion" TO "authenticated";
GRANT ALL ON TABLE "public"."protocolo_comunicacion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."protocolo_comunicacion_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."protocolo_comunicacion_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."protocolo_comunicacion_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."representante_legal" TO "anon";
GRANT ALL ON TABLE "public"."representante_legal" TO "authenticated";
GRANT ALL ON TABLE "public"."representante_legal" TO "service_role";



GRANT ALL ON TABLE "public"."retorno_integracion" TO "anon";
GRANT ALL ON TABLE "public"."retorno_integracion" TO "authenticated";
GRANT ALL ON TABLE "public"."retorno_integracion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."retorno_integracion_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."retorno_integracion_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."retorno_integracion_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sac_evento" TO "anon";
GRANT ALL ON TABLE "public"."sac_evento" TO "authenticated";
GRANT ALL ON TABLE "public"."sac_evento" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sac_evento_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sac_evento_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sac_evento_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sac_notificacion" TO "anon";
GRANT ALL ON TABLE "public"."sac_notificacion" TO "authenticated";
GRANT ALL ON TABLE "public"."sac_notificacion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sac_notificacion_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sac_notificacion_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sac_notificacion_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."servicio" TO "anon";
GRANT ALL ON TABLE "public"."servicio" TO "authenticated";
GRANT ALL ON TABLE "public"."servicio" TO "service_role";



GRANT ALL ON SEQUENCE "public"."servicio_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."servicio_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."servicio_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sistema_operativo" TO "anon";
GRANT ALL ON TABLE "public"."sistema_operativo" TO "authenticated";
GRANT ALL ON TABLE "public"."sistema_operativo" TO "service_role";



GRANT ALL ON TABLE "public"."sucursal_ef" TO "anon";
GRANT ALL ON TABLE "public"."sucursal_ef" TO "authenticated";
GRANT ALL ON TABLE "public"."sucursal_ef" TO "service_role";



GRANT ALL ON TABLE "public"."sucursal_pos" TO "anon";
GRANT ALL ON TABLE "public"."sucursal_pos" TO "authenticated";
GRANT ALL ON TABLE "public"."sucursal_pos" TO "service_role";



GRANT ALL ON TABLE "public"."tipo_contrato" TO "anon";
GRANT ALL ON TABLE "public"."tipo_contrato" TO "authenticated";
GRANT ALL ON TABLE "public"."tipo_contrato" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tipo_contrato_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tipo_contrato_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tipo_contrato_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tipo_dte" TO "anon";
GRANT ALL ON TABLE "public"."tipo_dte" TO "authenticated";
GRANT ALL ON TABLE "public"."tipo_dte" TO "service_role";



GRANT ALL ON TABLE "public"."tipo_impuesto" TO "anon";
GRANT ALL ON TABLE "public"."tipo_impuesto" TO "authenticated";
GRANT ALL ON TABLE "public"."tipo_impuesto" TO "service_role";



GRANT ALL ON TABLE "public"."tipo_mensaje" TO "anon";
GRANT ALL ON TABLE "public"."tipo_mensaje" TO "authenticated";
GRANT ALL ON TABLE "public"."tipo_mensaje" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tipo_mensaje_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tipo_mensaje_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tipo_mensaje_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tipo_soporte" TO "anon";
GRANT ALL ON TABLE "public"."tipo_soporte" TO "authenticated";
GRANT ALL ON TABLE "public"."tipo_soporte" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tipo_soporte_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tipo_soporte_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tipo_soporte_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."usuario" TO "anon";
GRANT ALL ON TABLE "public"."usuario" TO "authenticated";
GRANT ALL ON TABLE "public"."usuario" TO "service_role";



GRANT ALL ON TABLE "public"."version_app_full" TO "anon";
GRANT ALL ON TABLE "public"."version_app_full" TO "authenticated";
GRANT ALL ON TABLE "public"."version_app_full" TO "service_role";



GRANT ALL ON TABLE "public"."version_sistema_operativo" TO "anon";
GRANT ALL ON TABLE "public"."version_sistema_operativo" TO "authenticated";
GRANT ALL ON TABLE "public"."version_sistema_operativo" TO "service_role";



GRANT ALL ON TABLE "public"."vw_empresa_produccion_resumen" TO "anon";
GRANT ALL ON TABLE "public"."vw_empresa_produccion_resumen" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_empresa_produccion_resumen" TO "service_role";



GRANT ALL ON TABLE "public"."vw_empresas_activas_admin_sac" TO "anon";
GRANT ALL ON TABLE "public"."vw_empresas_activas_admin_sac" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_empresas_activas_admin_sac" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































