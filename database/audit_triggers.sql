-- SISTEMA DE AUDITORÍA PARA SUPABASE
-- Función para crear historial de cambios
CREATE OR REPLACE FUNCTION create_audit_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Para INSERT
  IF TG_OP = 'INSERT' THEN
    INSERT INTO historial_movimientos (
      tabla,
      registro_id,
      accion,
      cambios,
      usuario,
      fecha
    ) VALUES (
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, NEW.empkey::text, NEW.rut::text),
      'INSERT',
      row_to_json(NEW),
      current_setting('request.jwt.claims', true)::json->>'email',
      now()
    );
    RETURN NEW;
  END IF;

  -- Para UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Solo crear registro si hay cambios reales
    IF OLD IS DISTINCT FROM NEW THEN
      INSERT INTO historial_movimientos (
        tabla,
        registro_id,
        accion,
        cambios,
        usuario,
        fecha
      ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, NEW.empkey::text, NEW.rut::text),
        'UPDATE',
        json_build_object(
          'anterior', row_to_json(OLD),
          'nuevo', row_to_json(NEW)
        ),
        current_setting('request.jwt.claims', true)::json->>'email',
        now()
      );
    END IF;
    RETURN NEW;
  END IF;

  -- Para DELETE
  IF TG_OP = 'DELETE' THEN
    INSERT INTO historial_movimientos (
      tabla,
      registro_id,
      accion,
      cambios,
      usuario,
      fecha
    ) VALUES (
      TG_TABLE_NAME,
      COALESCE(OLD.id::text, OLD.empkey::text, OLD.rut::text),
      'DELETE',
      row_to_json(OLD),
      current_setting('request.jwt.claims', true)::json->>'email',
      now()
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- TRIGGERS PARA AUDITORÍA
-- ==========================================

-- Trigger para tabla empresa
DROP TRIGGER IF EXISTS empresa_audit_trigger ON empresa;
CREATE TRIGGER empresa_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON empresa
  FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- Trigger para representante_legal
DROP TRIGGER IF EXISTS representante_legal_audit_trigger ON representante_legal;
CREATE TRIGGER representante_legal_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON representante_legal
  FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- Trigger para contraparte_tecnica
DROP TRIGGER IF EXISTS contraparte_tecnica_audit_trigger ON contraparte_tecnica;
CREATE TRIGGER contraparte_tecnica_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON contraparte_tecnica
  FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- Trigger para contraparte_administrativa
DROP TRIGGER IF EXISTS contraparte_administrativa_audit_trigger ON contraparte_administrativa;
CREATE TRIGGER contraparte_administrativa_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON contraparte_administrativa
  FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS en tablas principales
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_movimientos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para empresa
CREATE POLICY "Usuarios pueden ver empresas según su rol" ON empresa
  FOR SELECT USING (
    CASE 
      -- Comercial: solo empresas en estado COMERCIAL
      WHEN (current_setting('request.jwt.claims', true)::json->>'perfil') = 'COM' 
        THEN estado = 'COMERCIAL'
      -- Onboarding: empresas desde ONBOARDING en adelante
      WHEN (current_setting('request.jwt.claims', true)::json->>'perfil') = 'OB' 
        THEN estado IN ('ONBOARDING', 'SAC', 'COMPLETADA')
      -- SAC: empresas desde SAC en adelante
      WHEN (current_setting('request.jwt.claims', true)::json->>'perfil') = 'SAC' 
        THEN estado IN ('SAC', 'COMPLETADA')
      ELSE false
    END
  );

-- Política para inserción (solo Comercial puede crear)
CREATE POLICY "Solo Comercial puede crear empresas" ON empresa
  FOR INSERT WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'perfil') = 'COM'
  );

-- Política para actualización basada en roles
CREATE POLICY "Usuarios pueden actualizar según permisos" ON empresa
  FOR UPDATE USING (
    CASE 
      -- Comercial: solo empresas en COMERCIAL
      WHEN (current_setting('request.jwt.claims', true)::json->>'perfil') = 'COM' 
        THEN estado = 'COMERCIAL'
      -- Onboarding: empresas en ONBOARDING
      WHEN (current_setting('request.jwt.claims', true)::json->>'perfil') = 'OB' 
        THEN estado = 'ONBOARDING'
      -- SAC: empresas en SAC
      WHEN (current_setting('request.jwt.claims', true)::json->>'perfil') = 'SAC' 
        THEN estado = 'SAC'
      -- Administradores pueden editar cualquier cosa
      WHEN (current_setting('request.jwt.claims', true)::json->>'perfil') IN ('OB_ADMIN', 'SAC_ADMIN')
        THEN true
      ELSE false
    END
  );

-- ==========================================
-- FUNCIONES AUXILIARES
-- ==========================================

-- Función para obtener historial de una empresa
CREATE OR REPLACE FUNCTION get_empresa_history(empresa_empkey INTEGER)
RETURNS TABLE (
  id BIGINT,
  tabla TEXT,
  accion TEXT,
  cambios JSONB,
  usuario TEXT,
  fecha TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.tabla,
    h.accion,
    h.cambios,
    h.usuario,
    h.fecha
  FROM historial_movimientos h
  WHERE h.registro_id = empresa_empkey::text
    OR h.cambios->>'empkey' = empresa_empkey::text
  ORDER BY h.fecha DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar transiciones de estado
CREATE OR REPLACE FUNCTION validate_estado_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar transiciones válidas de estado
  IF OLD.estado IS NOT NULL AND NEW.estado IS NOT NULL THEN
    -- COMERCIAL -> ONBOARDING (OK)
    IF OLD.estado = 'COMERCIAL' AND NEW.estado = 'ONBOARDING' THEN
      RETURN NEW;
    -- ONBOARDING -> SAC (OK)
    ELSIF OLD.estado = 'ONBOARDING' AND NEW.estado = 'SAC' THEN
      RETURN NEW;
    -- SAC -> COMPLETADA (OK)
    ELSIF OLD.estado = 'SAC' AND NEW.estado = 'COMPLETADA' THEN
      RETURN NEW;
    -- Mismo estado (OK)
    ELSIF OLD.estado = NEW.estado THEN
      RETURN NEW;
    -- Administradores pueden hacer cualquier cambio
    ELSIF (current_setting('request.jwt.claims', true)::json->>'perfil') IN ('OB_ADMIN', 'SAC_ADMIN') THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Transición de estado inválida: % -> %', OLD.estado, NEW.estado;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para validar transiciones de estado
DROP TRIGGER IF EXISTS validate_estado_trigger ON empresa;
CREATE TRIGGER validate_estado_trigger
  BEFORE UPDATE ON empresa
  FOR EACH ROW EXECUTE FUNCTION validate_estado_transition();

-- ==========================================
-- POLÍTICAS DE SEGURIDAD ADICIONALES
-- ==========================================

-- Solo usuarios autenticados pueden acceder a historial
CREATE POLICY "Solo usuarios autenticados ven historial" ON historial_movimientos
  FOR SELECT USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IS NOT NULL
  );

-- Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Usuarios ven su propio perfil" ON usuario
  FOR SELECT USING (
    correo = (current_setting('request.jwt.claims', true)::json->>'email')
  );
