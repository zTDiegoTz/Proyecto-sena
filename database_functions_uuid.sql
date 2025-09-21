-- Funciones auxiliares para la base de datos con UUIDs
-- Ejecuta este código en el editor SQL de Supabase después del schema principal

-- Función para actualizar stock cuando se realiza una venta (versión UUID)
CREATE OR REPLACE FUNCTION actualizar_stock_venta_uuid(
  p_surtidor_id UUID,
  p_tipo_combustible VARCHAR(20),
  p_cantidad DECIMAL(10,3)
)
RETURNS VOID AS $$
BEGIN
  UPDATE combustibles_surtidor 
  SET 
    stock = stock - p_cantidad,
    vendido = vendido + p_cantidad,
    fecha_actualizacion = NOW()
  WHERE 
    surtidor_id = p_surtidor_id 
    AND tipo_combustible = p_tipo_combustible;
    
  -- Verificar que hay suficiente stock
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el combustible especificado';
  END IF;
  
  -- Verificar que el stock no sea negativo
  IF (SELECT stock FROM combustibles_surtidor 
      WHERE surtidor_id = p_surtidor_id AND tipo_combustible = p_tipo_combustible) < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente para realizar la venta';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener resumen de ventas por período
CREATE OR REPLACE FUNCTION obtener_resumen_ventas_uuid(
  p_fecha_inicio TIMESTAMPTZ DEFAULT NULL,
  p_fecha_fin TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  tipo_combustible VARCHAR(20),
  total_cantidad DECIMAL(15,3),
  total_valor DECIMAL(15,2),
  num_ventas BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.tipo_combustible,
    SUM(v.cantidad) as total_cantidad,
    SUM(v.valor_total) as total_valor,
    COUNT(*) as num_ventas
  FROM ventas v
  WHERE 
    (p_fecha_inicio IS NULL OR v.fecha_hora >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR v.fecha_hora <= p_fecha_fin)
  GROUP BY v.tipo_combustible
  ORDER BY v.tipo_combustible;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener ventas por surtidor
CREATE OR REPLACE FUNCTION obtener_ventas_por_surtidor_uuid(
  p_fecha_inicio TIMESTAMPTZ DEFAULT NULL,
  p_fecha_fin TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  surtidor_id UUID,
  surtidor_nombre VARCHAR(50),
  total_ventas BIGINT,
  total_valor DECIMAL(15,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.surtidor_id,
    v.surtidor_nombre,
    COUNT(*) as total_ventas,
    SUM(v.valor_total) as total_valor
  FROM ventas v
  WHERE 
    (p_fecha_inicio IS NULL OR v.fecha_hora >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR v.fecha_hora <= p_fecha_fin)
  GROUP BY v.surtidor_id, v.surtidor_nombre
  ORDER BY v.surtidor_nombre;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de turnos
CREATE OR REPLACE FUNCTION obtener_estadisticas_turnos_uuid(
  p_fecha_inicio TIMESTAMPTZ DEFAULT NULL,
  p_fecha_fin TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  bombero_id UUID,
  bombero_nombre VARCHAR(100),
  total_turnos BIGINT,
  horas_trabajadas DECIMAL(10,2),
  ventas_realizadas BIGINT,
  valor_total_vendido DECIMAL(15,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.bombero_id,
    t.bombero_nombre,
    COUNT(DISTINCT t.id) as total_turnos,
    COALESCE(SUM(
      CASE 
        WHEN t.hora_salida IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (t.hora_salida - t.hora_entrada)) / 3600.0
        ELSE 0
      END
    ), 0) as horas_trabajadas,
    COALESCE(COUNT(v.id), 0) as ventas_realizadas,
    COALESCE(SUM(v.valor_total), 0) as valor_total_vendido
  FROM turnos t
  LEFT JOIN ventas v ON t.bombero_id = v.bombero_id 
    AND v.fecha_hora BETWEEN t.hora_entrada AND COALESCE(t.hora_salida, NOW())
  WHERE 
    (p_fecha_inicio IS NULL OR t.hora_entrada >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR t.hora_entrada <= p_fecha_fin)
  GROUP BY t.bombero_id, t.bombero_nombre
  ORDER BY t.bombero_nombre;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener información completa de un usuario por username
CREATE OR REPLACE FUNCTION get_user_by_username(p_username TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  role TEXT,
  username TEXT,
  email TEXT,
  activo BOOLEAN,
  fecha_creacion TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.role,
    u.username,
    u.email,
    u.activo,
    u.fecha_creacion
  FROM users u
  WHERE u.username = p_username AND u.activo = true;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un usuario tiene permisos específicos
CREATE OR REPLACE FUNCTION check_user_permission(p_user_id UUID, p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = p_user_id AND activo = true;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Super admin tiene todos los permisos
  IF user_role = 'Administrador' AND p_permission IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Gerente tiene permisos de gestión
  IF user_role = 'Gerente' AND p_permission IN ('admin', 'manage') THEN
    RETURN TRUE;
  END IF;
  
  -- Bombero tiene permisos básicos
  IF user_role = 'Bombero' AND p_permission = 'basic' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
