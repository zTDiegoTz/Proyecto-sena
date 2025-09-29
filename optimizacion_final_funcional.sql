-- =====================================================
-- OPTIMIZACIÓN FINAL FUNCIONAL - ESTACIÓN DE GASOLINA
-- =====================================================
-- Script completamente funcional sin errores de sintaxis

-- ============================================================================
-- PASO 1: ANÁLISIS ACTUAL
-- ============================================================================
SELECT '🔍 ANÁLISIS DE LA BASE DE DATOS ACTUAL:' as info;

-- Verificar tablas existentes
SELECT 
    table_name as tabla,
    CASE 
        WHEN table_name = 'users' THEN '👥 USUARIOS'
        WHEN table_name = 'surtidores' THEN '⛽ SURTIDORES'
        WHEN table_name = 'ventas' THEN '💰 VENTAS'
        WHEN table_name = 'combustibles_surtidor' THEN '🛢️ COMBUSTIBLES'
        WHEN table_name = 'configuracion' THEN '⚙️ CONFIGURACIÓN'
        WHEN table_name = 'turnos' THEN '⏰ TURNOS'
        ELSE '📋 OTRA TABLA'
    END as tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ============================================================================
-- PASO 2: CREAR ÍNDICES OPTIMIZADOS
-- ============================================================================
-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_activo ON users(activo);

-- Índices para surtidores
CREATE INDEX IF NOT EXISTS idx_surtidores_estado ON surtidores(estado);
CREATE INDEX IF NOT EXISTS idx_surtidores_nombre ON surtidores(nombre);

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

-- Índices para combustibles_surtidor
CREATE INDEX IF NOT EXISTS idx_combustibles_surtidor_id ON combustibles_surtidor(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_combustibles_tipo ON combustibles_surtidor(tipo_combustible);
CREATE INDEX IF NOT EXISTS idx_combustibles_stock ON combustibles_surtidor(stock);

-- Índices para turnos (si existe)
CREATE INDEX IF NOT EXISTS idx_turnos_bombero_id ON turnos(bombero_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_inicio ON turnos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);

SELECT '✅ Índices optimizados creados exitosamente' as resultado;

-- ============================================================================
-- PASO 3: CREAR VISTAS MATERIALIZADAS
-- ============================================================================
-- Vista para ventas del día actual
DROP MATERIALIZED VIEW IF EXISTS mv_ventas_hoy;
CREATE MATERIALIZED VIEW mv_ventas_hoy AS
SELECT 
    DATE(fecha_venta) as fecha,
    surtidor_id,
    tipo_combustible,
    COUNT(*) as total_ventas,
    SUM(cantidad_litros) as total_litros,
    SUM(valor_total) as total_valor,
    AVG(valor_total) as promedio_venta
FROM ventas 
WHERE DATE(fecha_venta) = CURRENT_DATE
GROUP BY DATE(fecha_venta), surtidor_id, tipo_combustible;

CREATE UNIQUE INDEX ON mv_ventas_hoy (fecha, surtidor_id, tipo_combustible);

-- Vista para estadísticas por surtidor
DROP MATERIALIZED VIEW IF EXISTS mv_estadisticas_surtidor;
CREATE MATERIALIZED VIEW mv_estadisticas_surtidor AS
SELECT 
    s.id as surtidor_id,
    s.nombre as surtidor_nombre,
    s.estado,
    COUNT(v.id) as total_ventas,
    COALESCE(SUM(v.cantidad_litros), 0) as total_litros_vendidos,
    COALESCE(SUM(v.valor_total), 0) as total_valor_vendido,
    COALESCE(AVG(v.valor_total), 0) as promedio_venta,
    MAX(v.fecha_venta) as ultima_venta
FROM surtidores s
LEFT JOIN ventas v ON s.id = v.surtidor_id
GROUP BY s.id, s.nombre, s.estado;

CREATE UNIQUE INDEX ON mv_estadisticas_surtidor (surtidor_id);

SELECT '✅ Vistas materializadas creadas exitosamente' as resultado;

-- ============================================================================
-- PASO 4: CREAR FUNCIONES OPTIMIZADAS
-- ============================================================================
-- Función para obtener estadísticas del día actual
CREATE OR REPLACE FUNCTION get_estadisticas_hoy()
RETURNS TABLE (
    total_ventas BIGINT,
    total_litros NUMERIC,
    total_valor NUMERIC,
    promedio_venta NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(cantidad_litros), 0) as total_litros,
        COALESCE(SUM(valor_total), 0) as total_valor,
        COALESCE(AVG(valor_total), 0) as promedio_venta
    FROM ventas 
    WHERE DATE(fecha_venta) = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener ventas por rango de fechas
CREATE OR REPLACE FUNCTION get_ventas_por_fecha(
    fecha_inicio DATE,
    fecha_fin DATE
)
RETURNS TABLE (
    fecha DATE,
    total_ventas BIGINT,
    total_litros NUMERIC,
    total_valor NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(v.fecha_venta) as fecha,
        COUNT(*) as total_ventas,
        SUM(v.cantidad_litros) as total_litros,
        SUM(v.valor_total) as total_valor
    FROM ventas v
    WHERE DATE(v.fecha_venta) BETWEEN fecha_inicio AND fecha_fin
    GROUP BY DATE(v.fecha_venta)
    ORDER BY fecha;
END;
$$ LANGUAGE plpgsql;

-- Función para refrescar vistas materializadas
CREATE OR REPLACE FUNCTION refrescar_vistas_materializadas()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_hoy;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_estadisticas_surtidor;
    RAISE NOTICE 'Vistas materializadas refrescadas exitosamente';
END;
$$ LANGUAGE plpgsql;

SELECT '✅ Funciones optimizadas creadas exitosamente' as resultado;

-- ============================================================================
-- PASO 5: CONFIGURAR TRIGGERS
-- ============================================================================
-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers a tablas que tengan fecha_actualizacion
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name
        FROM information_schema.columns 
        WHERE column_name = 'fecha_actualizacion' 
        AND table_schema = 'public'
    LOOP
        BEGIN
            EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_' || table_record.table_name || '_updated_at ON ' || table_record.table_name;
            EXECUTE 'CREATE TRIGGER trigger_update_' || table_record.table_name || '_updated_at 
                     BEFORE UPDATE ON ' || table_record.table_name || ' 
                     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error al crear trigger para %: %', table_record.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

SELECT '✅ Triggers configurados exitosamente' as resultado;

-- ============================================================================
-- PASO 6: CONFIGURAR MONITOREO
-- ============================================================================
-- Crear tabla de métricas
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Crear índices para métricas
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

-- Función para registrar métricas
CREATE OR REPLACE FUNCTION registrar_metrica(
    nombre_metrica TEXT,
    valor_metrica NUMERIC,
    unidad_metrica TEXT DEFAULT NULL,
    metadatos JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, metadata)
    VALUES (nombre_metrica, valor_metrica, unidad_metrica, metadatos);
END;
$$ LANGUAGE plpgsql;

SELECT '✅ Sistema de monitoreo configurado exitosamente' as resultado;

-- ============================================================================
-- PASO 7: VERIFICACIÓN FINAL
-- ============================================================================
-- Contar índices creados
SELECT 
    'Índices optimizados' as concepto,
    COUNT(*) as cantidad
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'

UNION ALL

-- Contar vistas materializadas
SELECT 
    'Vistas materializadas' as concepto,
    COUNT(*) as cantidad
FROM pg_matviews 
WHERE schemaname = 'public'

UNION ALL

-- Contar funciones
SELECT 
    'Funciones optimizadas' as concepto,
    COUNT(*) as cantidad
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND (p.proname LIKE 'get_%' OR p.proname LIKE 'refrescar_%' OR p.proname LIKE 'registrar_%');

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================
SELECT '🎉 OPTIMIZACIÓN FINAL COMPLETADA 🎉' as mensaje;
SELECT 'Base de datos optimizada específicamente para el proyecto de estación de gasolina' as detalle1;
SELECT '✅ Índices optimizados para consultas frecuentes' as detalle2;
SELECT '✅ Vistas materializadas para reportes rápidos' as detalle3;
SELECT '✅ Funciones optimizadas para operaciones comunes' as detalle4;
SELECT '✅ Triggers para mantenimiento automático' as detalle5;
SELECT '✅ Sistema de monitoreo configurado' as detalle6;
SELECT '🚀 La base de datos está lista para manejar alta carga de trabajo' as detalle7;
