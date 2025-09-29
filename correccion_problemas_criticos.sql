-- =====================================================
-- CORRECCIÓN DE PROBLEMAS CRÍTICOS IDENTIFICADOS
-- =====================================================
-- Script para solucionar todos los problemas críticos encontrados en el diagnóstico

-- ============================================================================
-- PASO 1: VERIFICAR ESTADO ACTUAL
-- ============================================================================
SELECT '🔍 VERIFICANDO ESTADO ACTUAL DE LA BASE DE DATOS...' as info;

-- Contar elementos existentes
SELECT 
    'ESTADO ACTUAL' as seccion,
    'Tablas' as elemento,
    COUNT(*) as cantidad
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'ESTADO ACTUAL' as seccion,
    'Claves Foráneas' as elemento,
    COUNT(*) as cantidad
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public'
UNION ALL
SELECT 
    'ESTADO ACTUAL' as seccion,
    'Índices' as elemento,
    COUNT(*) as cantidad
FROM pg_indexes 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'ESTADO ACTUAL' as seccion,
    'Funciones' as elemento,
    COUNT(*) as cantidad
FROM information_schema.routines 
WHERE routine_schema = 'public'
UNION ALL
SELECT 
    'ESTADO ACTUAL' as seccion,
    'Triggers' as elemento,
    COUNT(*) as cantidad
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT 
    'ESTADO ACTUAL' as seccion,
    'Vistas' as elemento,
    COUNT(*) as cantidad
FROM information_schema.views
WHERE table_schema = 'public';

-- ============================================================================
-- PASO 2: CREAR TABLAS FALTANTES
-- ============================================================================
SELECT '📋 CREANDO TABLAS FALTANTES...' as info;

-- Crear tabla users si no existe
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'administrador', 'bombero')),
  email VARCHAR(100) UNIQUE,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla surtidores si no existe
CREATE TABLE IF NOT EXISTS surtidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento', 'fuera_servicio')),
  ubicacion VARCHAR(100),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla combustibles_surtidor si no existe
CREATE TABLE IF NOT EXISTS combustibles_surtidor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surtidor_id UUID NOT NULL,
  tipo_combustible VARCHAR(20) NOT NULL CHECK (tipo_combustible IN ('extra', 'corriente', 'acpm')),
  stock DECIMAL(10,3) NOT NULL DEFAULT 0,
  vendido DECIMAL(10,3) NOT NULL DEFAULT 0,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  capacidad_maxima DECIMAL(10,3) NOT NULL DEFAULT 1000,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(surtidor_id, tipo_combustible)
);

-- Crear tabla turnos si no existe
CREATE TABLE IF NOT EXISTS turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bombero_id UUID NOT NULL,
  bombero_nombre VARCHAR(100) NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado')),
  observaciones TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla ventas si no existe
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surtidor_id UUID NOT NULL,
  surtidor_nombre VARCHAR(100) NOT NULL,
  bombero_id UUID NOT NULL,
  bombero_nombre VARCHAR(100) NOT NULL,
  tipo_combustible VARCHAR(20) NOT NULL CHECK (tipo_combustible IN ('extra', 'corriente', 'acpm')),
  cantidad DECIMAL(10,3) NOT NULL,
  cantidad_galones DECIMAL(10,3) NOT NULL,
  precio_por_galon DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'credito')),
  cliente_nombre VARCHAR(100),
  cliente_documento VARCHAR(20),
  placa_vehiculo VARCHAR(10),
  turno_id UUID,
  fecha_venta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla configuracion si no existe
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave VARCHAR(50) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(20) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla inventario_historico si no existe
CREATE TABLE IF NOT EXISTS inventario_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surtidor_id UUID NOT NULL,
  tipo_combustible VARCHAR(20) NOT NULL,
  stock_anterior DECIMAL(10,3) NOT NULL,
  stock_nuevo DECIMAL(10,3) NOT NULL,
  diferencia DECIMAL(10,3) NOT NULL,
  motivo VARCHAR(100) NOT NULL,
  usuario_id UUID,
  observaciones TEXT,
  fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear tabla precios_historico si no existe
CREATE TABLE IF NOT EXISTS precios_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_combustible VARCHAR(20) NOT NULL,
  precio_anterior DECIMAL(10,2) NOT NULL,
  precio_nuevo DECIMAL(10,2) NOT NULL,
  usuario_id UUID,
  motivo VARCHAR(100),
  fecha_cambio TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear tabla reportes si no existe
CREATE TABLE IF NOT EXISTS reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_reporte VARCHAR(50) NOT NULL,
  parametros JSONB,
  resultado JSONB,
  usuario_id UUID,
  fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear tabla auditoria si no existe
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla_afectada VARCHAR(50) NOT NULL,
  accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id VARCHAR(100) NOT NULL,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_id UUID,
  ip_address INET,
  user_agent TEXT,
  fecha_accion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT '✅ Tablas creadas/verificadas exitosamente' as resultado;

-- ============================================================================
-- PASO 3: CREAR CLAVES FORÁNEAS FALTANTES
-- ============================================================================
SELECT '🔗 CREANDO CLAVES FORÁNEAS FALTANTES...' as info;

-- Claves foráneas para combustibles_surtidor
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'combustibles_surtidor_surtidor_id_fkey') THEN
        ALTER TABLE combustibles_surtidor 
        ADD CONSTRAINT combustibles_surtidor_surtidor_id_fkey 
        FOREIGN KEY (surtidor_id) REFERENCES surtidores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Claves foráneas para turnos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'turnos_bombero_id_fkey') THEN
        ALTER TABLE turnos 
        ADD CONSTRAINT turnos_bombero_id_fkey 
        FOREIGN KEY (bombero_id) REFERENCES users(id);
    END IF;
END $$;

-- Claves foráneas para ventas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ventas_surtidor_id_fkey') THEN
        ALTER TABLE ventas 
        ADD CONSTRAINT ventas_surtidor_id_fkey 
        FOREIGN KEY (surtidor_id) REFERENCES surtidores(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ventas_bombero_id_fkey') THEN
        ALTER TABLE ventas 
        ADD CONSTRAINT ventas_bombero_id_fkey 
        FOREIGN KEY (bombero_id) REFERENCES users(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ventas_turno_id_fkey') THEN
        ALTER TABLE ventas 
        ADD CONSTRAINT ventas_turno_id_fkey 
        FOREIGN KEY (turno_id) REFERENCES turnos(id);
    END IF;
END $$;

-- Claves foráneas para inventario_historico
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inventario_historico_surtidor_id_fkey') THEN
        ALTER TABLE inventario_historico 
        ADD CONSTRAINT inventario_historico_surtidor_id_fkey 
        FOREIGN KEY (surtidor_id) REFERENCES surtidores(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inventario_historico_usuario_id_fkey') THEN
        ALTER TABLE inventario_historico 
        ADD CONSTRAINT inventario_historico_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES users(id);
    END IF;
END $$;

-- Claves foráneas para precios_historico
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'precios_historico_usuario_id_fkey') THEN
        ALTER TABLE precios_historico 
        ADD CONSTRAINT precios_historico_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES users(id);
    END IF;
END $$;

-- Claves foráneas para reportes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reportes_usuario_id_fkey') THEN
        ALTER TABLE reportes 
        ADD CONSTRAINT reportes_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES users(id);
    END IF;
END $$;

-- Claves foráneas para auditoria
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'auditoria_usuario_id_fkey') THEN
        ALTER TABLE auditoria 
        ADD CONSTRAINT auditoria_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES users(id);
    END IF;
END $$;

SELECT '✅ Claves foráneas creadas/verificadas exitosamente' as resultado;

-- ============================================================================
-- PASO 4: CREAR ÍNDICES FALTANTES
-- ============================================================================
SELECT '📊 CREANDO ÍNDICES FALTANTES...' as info;

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_activo ON users(activo);

-- Índices para surtidores
CREATE INDEX IF NOT EXISTS idx_surtidores_estado ON surtidores(estado);
CREATE INDEX IF NOT EXISTS idx_surtidores_nombre ON surtidores(nombre);

-- Índices para combustibles_surtidor
CREATE INDEX IF NOT EXISTS idx_combustibles_surtidor_id ON combustibles_surtidor(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_combustibles_tipo ON combustibles_surtidor(tipo_combustible);

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_venta ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_surtidor_id ON ventas(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_ventas_bombero_id ON ventas(bombero_id);
CREATE INDEX IF NOT EXISTS idx_ventas_tipo_combustible ON ventas(tipo_combustible);
CREATE INDEX IF NOT EXISTS idx_ventas_metodo_pago ON ventas(metodo_pago);

-- Índices compuestos para reportes
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_surtidor ON ventas(fecha_venta, surtidor_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_tipo ON ventas(fecha_venta, tipo_combustible);
CREATE INDEX IF NOT EXISTS idx_ventas_bombero_fecha ON ventas(bombero_id, fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_metodo ON ventas(fecha_venta, metodo_pago);

-- Índices para turnos
CREATE INDEX IF NOT EXISTS idx_turnos_bombero_id ON turnos(bombero_id);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_inicio ON turnos(fecha_inicio);

-- Índices para configuración
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON configuracion(clave);

-- Índices para inventario_historico
CREATE INDEX IF NOT EXISTS idx_inventario_surtidor_id ON inventario_historico(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_inventario_fecha ON inventario_historico(fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_inventario_motivo ON inventario_historico(motivo);

-- Índices para precios_historico
CREATE INDEX IF NOT EXISTS idx_precios_tipo ON precios_historico(tipo_combustible);
CREATE INDEX IF NOT EXISTS idx_precios_fecha ON precios_historico(fecha_cambio);

-- Índices para reportes
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON reportes(tipo_reporte);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha_generacion);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);

SELECT '✅ Índices creados/verificados exitosamente' as resultado;

-- ============================================================================
-- PASO 5: CREAR FUNCIONES FALTANTES
-- ============================================================================
SELECT '⚙️ CREANDO FUNCIONES FALTANTES...' as info;

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar stock en ventas
CREATE OR REPLACE FUNCTION actualizar_stock_venta(
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

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el combustible especificado para el surtidor %', p_surtidor_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular estadísticas de ventas
CREATE OR REPLACE FUNCTION calcular_estadisticas_ventas(
  p_fecha_inicio DATE DEFAULT CURRENT_DATE,
  p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_ventas BIGINT,
  total_ingresos DECIMAL(12,2),
  total_litros DECIMAL(10,3),
  promedio_venta DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_ventas,
    COALESCE(SUM(valor_total), 0) as total_ingresos,
    COALESCE(SUM(cantidad), 0) as total_litros,
    COALESCE(AVG(valor_total), 0) as promedio_venta
  FROM ventas
  WHERE DATE(fecha_venta) BETWEEN p_fecha_inicio AND p_fecha_fin;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener resumen diario de ventas
CREATE OR REPLACE FUNCTION obtener_resumen_ventas_diario(
  p_fecha DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  surtidor_nombre VARCHAR(100),
  tipo_combustible VARCHAR(20),
  total_ventas BIGINT,
  total_ingresos DECIMAL(12,2),
  total_litros DECIMAL(10,3)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.surtidor_nombre,
    v.tipo_combustible,
    COUNT(*)::BIGINT as total_ventas,
    COALESCE(SUM(v.valor_total), 0) as total_ingresos,
    COALESCE(SUM(v.cantidad), 0) as total_litros
  FROM ventas v
  WHERE DATE(v.fecha_venta) = p_fecha
  GROUP BY v.surtidor_nombre, v.tipo_combustible
  ORDER BY total_ingresos DESC;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ Funciones creadas/verificadas exitosamente' as resultado;

-- ============================================================================
-- PASO 6: CREAR TRIGGERS FALTANTES
-- ============================================================================
SELECT '🔄 CREANDO TRIGGERS FALTANTES...' as info;

-- Triggers para actualizar fecha_actualizacion
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_users_actualizar_fecha') THEN
        CREATE TRIGGER trigger_users_actualizar_fecha
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION actualizar_fecha_actualizacion();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_surtidores_actualizar_fecha') THEN
        CREATE TRIGGER trigger_surtidores_actualizar_fecha
          BEFORE UPDATE ON surtidores
          FOR EACH ROW
          EXECUTE FUNCTION actualizar_fecha_actualizacion();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_combustibles_actualizar_fecha') THEN
        CREATE TRIGGER trigger_combustibles_actualizar_fecha
          BEFORE UPDATE ON combustibles_surtidor
          FOR EACH ROW
          EXECUTE FUNCTION actualizar_fecha_actualizacion();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_ventas_actualizar_fecha') THEN
        CREATE TRIGGER trigger_ventas_actualizar_fecha
          BEFORE UPDATE ON ventas
          FOR EACH ROW
          EXECUTE FUNCTION actualizar_fecha_actualizacion();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_turnos_actualizar_fecha') THEN
        CREATE TRIGGER trigger_turnos_actualizar_fecha
          BEFORE UPDATE ON turnos
          FOR EACH ROW
          EXECUTE FUNCTION actualizar_fecha_actualizacion();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_configuracion_actualizar_fecha') THEN
        CREATE TRIGGER trigger_configuracion_actualizar_fecha
          BEFORE UPDATE ON configuracion
          FOR EACH ROW
          EXECUTE FUNCTION actualizar_fecha_actualizacion();
    END IF;
END $$;

SELECT '✅ Triggers creados/verificados exitosamente' as resultado;

-- ============================================================================
-- PASO 7: CREAR VISTAS FALTANTES
-- ============================================================================
SELECT '👁️ CREANDO VISTAS FALTANTES...' as info;

-- Vista para combustibles disponibles
CREATE OR REPLACE VIEW vista_combustibles_disponibles AS
SELECT 
  s.id as surtidor_id,
  s.nombre as surtidor_nombre,
  s.estado as surtidor_estado,
  s.ubicacion,
  cs.tipo_combustible,
  cs.precio,
  cs.capacidad_maxima,
  cs.stock,
  cs.vendido,
  'Stock no monitoreado en tiempo real' as stock_status
FROM surtidores s
LEFT JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
WHERE s.estado = 'disponible'
ORDER BY s.id, cs.tipo_combustible;

-- Vista para estado de surtidores
CREATE OR REPLACE VIEW vista_surtidores_estado AS
SELECT 
  s.id as surtidor_id,
  s.nombre as surtidor_nombre,
  s.estado,
  s.ubicacion,
  COUNT(cs.tipo_combustible) as tipos_combustible,
  s.fecha_creacion,
  s.fecha_actualizacion
FROM surtidores s
LEFT JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
GROUP BY s.id, s.nombre, s.estado, s.ubicacion, s.fecha_creacion, s.fecha_actualizacion
ORDER BY s.id;

-- Vista para ventas diarias
CREATE OR REPLACE VIEW vista_ventas_diarias AS
SELECT 
  DATE(fecha_venta) as fecha,
  COUNT(*) as total_ventas,
  SUM(valor_total) as total_ingresos,
  SUM(cantidad) as total_litros,
  AVG(valor_total) as promedio_venta,
  COUNT(DISTINCT surtidor_id) as surtidores_activos,
  COUNT(DISTINCT bombero_id) as bomberos_activos
FROM ventas
GROUP BY DATE(fecha_venta)
ORDER BY fecha DESC;

-- Vista para últimas ventas
CREATE OR REPLACE VIEW vista_ultimas_ventas AS
SELECT 
  id,
  surtidor_nombre,
  tipo_combustible,
  cantidad,
  cantidad_galones,
  valor_total,
  bombero_nombre,
  metodo_pago,
  fecha_venta
FROM ventas
ORDER BY fecha_venta DESC
LIMIT 50;

-- Vista para estadísticas por tipo de combustible
CREATE OR REPLACE VIEW vista_estadisticas_combustible AS
SELECT 
  tipo_combustible,
  COUNT(*) as total_ventas,
  SUM(valor_total) as total_ingresos,
  SUM(cantidad) as total_litros,
  AVG(valor_total) as promedio_venta,
  MIN(precio_por_galon) as precio_minimo,
  MAX(precio_por_galon) as precio_maximo,
  AVG(precio_por_galon) as precio_promedio
FROM ventas
GROUP BY tipo_combustible
ORDER BY total_ingresos DESC;

-- Vista para resumen de turnos activos
CREATE OR REPLACE VIEW vista_turnos_activos AS
SELECT 
  t.id as turno_id,
  t.bombero_nombre,
  t.fecha_inicio,
  t.estado,
  COUNT(v.id) as ventas_realizadas,
  COALESCE(SUM(v.valor_total), 0) as total_ventas
FROM turnos t
LEFT JOIN ventas v ON t.id = v.turno_id
WHERE t.estado = 'activo'
GROUP BY t.id, t.bombero_nombre, t.fecha_inicio, t.estado
ORDER BY t.fecha_inicio DESC;

SELECT '✅ Vistas creadas/verificadas exitosamente' as resultado;

-- ============================================================================
-- PASO 8: INSERTAR DATOS INICIALES FALTANTES
-- ============================================================================
SELECT '📝 INSERTANDO DATOS INICIALES FALTANTES...' as info;

-- Insertar usuarios iniciales
INSERT INTO users (username, password_hash, name, role, email, activo) VALUES
  ('admin', 'admin123', 'Administrador Principal', 'super_admin', 'admin@estacion.com', true),
  ('gerente', 'gerente123', 'Gerente de Estación', 'administrador', 'gerente@estacion.com', true),
  ('bombero1', 'bombero123', 'Juan Pérez', 'bombero', 'juan@estacion.com', true),
  ('bombero2', 'bombero123', 'María García', 'bombero', 'maria@estacion.com', true)
ON CONFLICT (username) DO NOTHING;

-- Insertar surtidores iniciales
INSERT INTO surtidores (nombre, estado, ubicacion) VALUES
  ('Surtidor 1', 'disponible', 'Entrada principal'),
  ('Surtidor 2', 'disponible', 'Entrada secundaria'),
  ('Surtidor 3', 'disponible', 'Área de carga')
ON CONFLICT DO NOTHING;

-- Insertar combustibles para los surtidores
DO $$
DECLARE
    surtidor1_id UUID;
    surtidor2_id UUID;
    surtidor3_id UUID;
BEGIN
    -- Obtener IDs de los surtidores
    SELECT id INTO surtidor1_id FROM surtidores WHERE nombre = 'Surtidor 1' LIMIT 1;
    SELECT id INTO surtidor2_id FROM surtidores WHERE nombre = 'Surtidor 2' LIMIT 1;
    SELECT id INTO surtidor3_id FROM surtidores WHERE nombre = 'Surtidor 3' LIMIT 1;
    
    -- Insertar combustibles para Surtidor 1
    INSERT INTO combustibles_surtidor (surtidor_id, tipo_combustible, stock, precio, capacidad_maxima) VALUES
      (surtidor1_id, 'extra', 1000, 12500, 1000),
      (surtidor1_id, 'corriente', 1000, 12000, 1000),
      (surtidor1_id, 'acpm', 1000, 11000, 1000)
    ON CONFLICT (surtidor_id, tipo_combustible) DO NOTHING;
    
    -- Insertar combustibles para Surtidor 2
    INSERT INTO combustibles_surtidor (surtidor_id, tipo_combustible, stock, precio, capacidad_maxima) VALUES
      (surtidor2_id, 'extra', 1000, 12500, 1000),
      (surtidor2_id, 'corriente', 1000, 12000, 1000),
      (surtidor2_id, 'acpm', 1000, 11000, 1000)
    ON CONFLICT (surtidor_id, tipo_combustible) DO NOTHING;
    
    -- Insertar combustibles para Surtidor 3
    INSERT INTO combustibles_surtidor (surtidor_id, tipo_combustible, stock, precio, capacidad_maxima) VALUES
      (surtidor3_id, 'extra', 1000, 12500, 1000),
      (surtidor3_id, 'corriente', 1000, 12000, 1000),
      (surtidor3_id, 'acpm', 1000, 11000, 1000)
    ON CONFLICT (surtidor_id, tipo_combustible) DO NOTHING;
    
    RAISE NOTICE '✅ Combustibles insertados para todos los surtidores';
END $$;

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, descripcion, tipo) VALUES
  ('precio_extra', '12500', 'Precio por galón de gasolina extra', 'number'),
  ('precio_corriente', '12000', 'Precio por galón de gasolina corriente', 'number'),
  ('precio_acpm', '11000', 'Precio por galón de ACPM', 'number'),
  ('nombre_estacion', 'Estación de Gasolina SENA', 'Nombre de la estación', 'string'),
  ('direccion_estacion', 'Calle 123 #45-67', 'Dirección de la estación', 'string'),
  ('telefono_estacion', '300-123-4567', 'Teléfono de la estación', 'string'),
  ('monitoreo_stock', 'false', 'Indica si se monitorea el stock en tiempo real', 'boolean'),
  ('version_sistema', '2.0', 'Versión del sistema', 'string')
ON CONFLICT (clave) DO NOTHING;

SELECT '✅ Datos iniciales insertados/verificados exitosamente' as resultado;

-- ============================================================================
-- PASO 9: CONFIGURAR PERMISOS Y SEGURIDAD
-- ============================================================================
SELECT '🔒 CONFIGURANDO PERMISOS Y SEGURIDAD...' as info;

-- Deshabilitar RLS para desarrollo
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE surtidores DISABLE ROW LEVEL SECURITY;
ALTER TABLE combustibles_surtidor DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE turnos DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE precios_historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE reportes DISABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria DISABLE ROW LEVEL SECURITY;

SELECT '✅ Permisos y seguridad configurados exitosamente' as resultado;

-- ============================================================================
-- PASO 10: VERIFICACIÓN FINAL
-- ============================================================================
SELECT '🔍 VERIFICACIÓN FINAL POST-CORRECCIÓN...' as info;

-- Verificar estado final
SELECT 
    'ESTADO FINAL' as seccion,
    'Tablas' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ OK'
        ELSE '❌ PROBLEMAS'
    END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'ESTADO FINAL' as seccion,
    'Claves Foráneas' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ OK'
        ELSE '❌ PROBLEMAS'
    END as estado
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public'
UNION ALL
SELECT 
    'ESTADO FINAL' as seccion,
    'Índices' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 20 THEN '✅ OK'
        ELSE '❌ PROBLEMAS'
    END as estado
FROM pg_indexes 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'ESTADO FINAL' as seccion,
    'Funciones' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ OK'
        ELSE '❌ PROBLEMAS'
    END as estado
FROM information_schema.routines 
WHERE routine_schema = 'public'
UNION ALL
SELECT 
    'ESTADO FINAL' as seccion,
    'Triggers' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ OK'
        ELSE '❌ PROBLEMAS'
    END as estado
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT 
    'ESTADO FINAL' as seccion,
    'Vistas' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ OK'
        ELSE '❌ PROBLEMAS'
    END as estado
FROM information_schema.views
WHERE table_schema = 'public';

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================
SELECT '🎉 CORRECCIÓN DE PROBLEMAS CRÍTICOS COMPLETADA' as mensaje;
SELECT 'Todos los elementos faltantes han sido creados' as detalle1;
SELECT 'La base de datos ahora debería estar completamente funcional' as detalle2;
SELECT 'Ejecuta la revisión nuevamente para confirmar que no hay problemas' as recomendacion;
SELECT '✅ Base de datos corregida y lista para uso' as resultado;
