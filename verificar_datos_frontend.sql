-- ============================================================================
-- VERIFICACIÓN DE DATOS PARA FRONTEND
-- ============================================================================
-- Script para verificar que los datos están correctos para el frontend

SELECT '🔍 VERIFICANDO DATOS PARA FRONTEND...' as info;

-- ============================================================================
-- PASO 1: VERIFICAR SURTIDORES Y SUS COMBUSTIBLES
-- ============================================================================
SELECT '📊 SURTIDORES CON COMBUSTIBLES:' as info;

SELECT 
    s.id,
    s.nombre,
    s.estado,
    s.ubicacion,
    COUNT(cs.id) as total_combustibles,
    STRING_AGG(cs.tipo_combustible, ', ') as tipos_combustible
FROM surtidores s
LEFT JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
GROUP BY s.id, s.nombre, s.estado, s.ubicacion
ORDER BY s.nombre;

-- ============================================================================
-- PASO 2: VERIFICAR COMBUSTIBLES POR SURTIDOR
-- ============================================================================
SELECT '⛽ COMBUSTIBLES POR SURTIDOR:' as info;

SELECT 
    s.nombre as surtidor,
    cs.tipo_combustible,
    cs.stock,
    cs.precio,
    cs.capacidad_maxima,
    cs.vendido
FROM surtidores s
JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
ORDER BY s.nombre, cs.tipo_combustible;

-- ============================================================================
-- PASO 3: VERIFICAR QUE HAY STOCK DISPONIBLE
-- ============================================================================
SELECT '📈 STOCK DISPONIBLE:' as info;

SELECT 
    s.nombre as surtidor,
    cs.tipo_combustible,
    cs.stock,
    CASE 
        WHEN cs.stock > 0 THEN '✅ DISPONIBLE'
        ELSE '❌ SIN STOCK'
    END as estado_stock
FROM surtidores s
JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
ORDER BY s.nombre, cs.tipo_combustible;

-- ============================================================================
-- PASO 4: VERIFICAR ESTRUCTURA DE DATOS PARA FRONTEND
-- ============================================================================
SELECT '🔧 ESTRUCTURA DE DATOS:' as info;

-- Verificar que los IDs son UUIDs
SELECT 
    'surtidores.id' as tabla_columna,
    data_type as tipo_dato,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ CORRECTO'
        ELSE '❌ INCORRECTO'
    END as estado
FROM information_schema.columns 
WHERE table_name = 'surtidores' AND column_name = 'id'

UNION ALL

SELECT 
    'combustibles_surtidor.surtidor_id' as tabla_columna,
    data_type as tipo_dato,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ CORRECTO'
        ELSE '❌ INCORRECTO'
    END as estado
FROM information_schema.columns 
WHERE table_name = 'combustibles_surtidor' AND column_name = 'surtidor_id';

-- ============================================================================
-- PASO 5: VERIFICAR VISTA OPTIMIZADA
-- ============================================================================
SELECT '👁️ VISTA OPTIMIZADA:' as info;

-- Verificar que la vista existe
SELECT 
    table_name as vista,
    CASE 
        WHEN table_name = 'vista_surtidores_combustibles' THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'vista_surtidores_combustibles';

-- ============================================================================
-- PASO 6: RESUMEN FINAL
-- ============================================================================
SELECT '📋 RESUMEN FINAL:' as info;

SELECT 
    (SELECT COUNT(*) FROM surtidores) as total_surtidores,
    (SELECT COUNT(*) FROM combustibles_surtidor) as total_combustibles,
    (SELECT COUNT(*) FROM combustibles_surtidor WHERE stock > 0) as combustibles_con_stock,
    (SELECT COUNT(DISTINCT tipo_combustible) FROM combustibles_surtidor) as tipos_combustible_unicos;

SELECT '✅ Verificación completada' as resultado;


