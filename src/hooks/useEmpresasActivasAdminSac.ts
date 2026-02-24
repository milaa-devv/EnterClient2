import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type EmpresaActivaRow = {
  empkey: number;
  rut: string | null;
  nombre: string | null;
  logo: string | null;
};

export function useEmpresasActivasAdminSac() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaActivaRow[]>([]);

  const refresh = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("vw_empresas_activas_admin_sac")
        .select("empkey,rut,nombre,logo")
        .order("empkey", { ascending: true });

      if (error) {
        setError(error.message);
        setEmpresas([]);
        setLoading(false);
        return;
      }

      setEmpresas((data as EmpresaActivaRow[]) ?? []);
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { empresas, loading, error, refresh };
}
