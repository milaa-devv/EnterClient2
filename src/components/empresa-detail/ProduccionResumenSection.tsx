import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  empkey: number;
};

type ProduccionResumen = {
  empkey: number;
  rut: string | null;
  razon_social: string | null;

  // 👇 campos de la view vw_empresa_produccion_resumen
  fecha_pap_completado: string | null;
  ejecutivo_ob: string | null;
  ejecutivo_sac: string | null;
  estado_final: string | null;
};

const fmtFecha = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
};

export const ProduccionResumenSection: React.FC<Props> = ({ empkey }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<ProduccionResumen | null>(null);

  useEffect(() => {
    const fetchResumen = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("vw_empresa_produccion_resumen")
        .select(
          "empkey,rut,razon_social,fecha_pap_completado,ejecutivo_ob,ejecutivo_sac,estado_final"
        )
        .eq("empkey", empkey)
        .maybeSingle();

      if (error) {
        setErrorMsg(`No se pudo cargar el resumen de producción. (${error.message})`);
        setData(null);
        setLoading(false);
        return;
      }

      setData(data as ProduccionResumen | null);
      setLoading(false);
    };

    fetchResumen();
  }, [empkey]);

  const estado = data?.estado_final ?? "SIN ESTADO";

  const badgeClass =
    estado === "PRODUCCIÓN"
      ? "bg-success"
      : estado === "EN SAC"
      ? "bg-primary"
      : estado === "SIN PAP"
      ? "bg-secondary"
      : "bg-dark";

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="mb-0">Resumen Producción (PAP)</h5>
          <span className={`badge ${badgeClass}`}>{estado}</span>
        </div>

        {loading && (
          <div className="alert alert-secondary mb-0">
            Cargando información de producción…
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger mb-0">
            {errorMsg}
            <div className="small text-muted mt-2">
              Revisa que exista la view <code>vw_empresa_produccion_resumen</code> y permisos/RLS.
            </div>
          </div>
        )}

        {!loading && !errorMsg && (
          <div className="row g-3 mt-1">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="text-muted small">Fecha “PAP” completado</div>
              <div className="fw-semibold">{fmtFecha(data?.fecha_pap_completado)}</div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="text-muted small">Ejecutivo OB (última acción)</div>
              <div className="fw-semibold">{data?.ejecutivo_ob ?? "—"}</div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="text-muted small">Ejecutivo SAC (ejecutó PAP)</div>
              <div className="fw-semibold">{data?.ejecutivo_sac ?? "—"}</div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="text-muted small">Estado final</div>
              <div className="fw-semibold">{data?.estado_final ?? "—"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
