-- ============================================================================
-- CREAR TABLA CONFIGURACIÓN COMBUSTIBLES
-- ============================================================================
-- Script para crear la tabla que el frontend está buscando

SELECT '🔧 CREANDO TABLA CONFIGURACIÓN COMBUSTIBLES...' as info;

-- ============================================================================
-- PASO 1: CREAR TABLA CONFIGURACIÓN COMBUSTIBLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS configuracion_combustibles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_combustible VARCHAR(50) NOT NULL UNIQUE,
    precio_por_litro DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_disponible DECIMAL(10,2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PASO 2: INSERTAR DATOS INICIALES
-- ============================================================================
INSERT INTO configuracion_combustibles (tipo_combustible, precio_por_litro, stock_total, stock_disponible) VALUES
    ('extra', 12500, 3000, 3000),
    ('corriente', 12000, 3000, 3000),
    ('acpm', 11000, 3000, 3000)
ON CONFLICT (tipo_combustible) DO UPDATE SET
    precio_por_litro = EXCLUDED.precio_por_litro,
    stock_total = EXCLUDED.stock_total,
    stock_disponible = EXCLUDED.stock_disponible,
    fecha_actualizacion = NOW();

-- ============================================================================
-- PASO 3: CREAR ÍNDICES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_configuracion_combustibles_tipo ON configuracion_combustibles(tipo_combustible);
CREATE INDEX IF NOT EXISTS idx_configuracion_combustibles_activo ON configuracion_combustibles(activo);

-- ============================================================================
-- PASO 4: CREAR TRIGGER PARA FECHA_ACTUALIZACION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_configuracion_combustibles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger (eliminar si existe primero)
DROP TRIGGER IF EXISTS trigger_configuracion_combustibles_updated_at ON configuracion_combustibles;
CREATE TRIGGER trigger_configuracion_combustibles_updated_at
    BEFORE UPDATE ON configuracion_combustibles
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracion_combustibles_updated_at();

-- ============================================================================
-- PASO 5: VERIFICAR CREACIÓN
-- ============================================================================
SELECT '✅ VERIFICANDO TABLA CREADA...' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'configuracion_combustibles'
ORDER BY ordinal_position;

-- ============================================================================
-- PASO 6: VERIFICAR DATOS INSERTADOS
-- ============================================================================
SELECT '📊 VERIFICANDO DATOS INSERTADOS...' as info;

SELECT 
    tipo_combustible,
    precio_por_litro,
    stock_total,
    stock_disponible,
    activo
FROM configuracion_combustibles
ORDER BY tipo_combustible;

-- ============================================================================
-- PASO 7: RESUMEN FINAL
-- ============================================================================
SELECT '📋 RESUMEN FINAL:' as info;

SELECT 
    COUNT(*) as total_combustibles_configurados,
    COUNT(CASE WHEN activo = true THEN 1 END) as combustibles_activos,
    SUM(stock_total) as stock_total_general,
    SUM(stock_disponible) as stock_disponible_general
FROM configuracion_combustibles;

SELECT '✅ Tabla configuracion_combustibles creada exitosamente' as resultado;
