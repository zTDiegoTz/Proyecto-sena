-- =====================================================
-- VERIFICACIÓN SIMPLE DE COMBUSTIBLES EN SURTIDORES
-- =====================================================
-- Script simplificado para verificar por qué no aparecen los combustibles

-- ============================================================================
-- PASO 1: VERIFICAR TABLAS EXISTENTES
-- ============================================================================
SELECT '🔍 VERIFICANDO TABLAS EXISTENTES...' as info;

SELECT 
    'TABLAS COMBUSTIBLES' as seccion,
    table_name as tabla,
    '✅ Existe' as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND (table_name LIKE '%combustible%' OR table_name = 'configuracion')
ORDER BY table_name;

-- ============================================================================
-- PASO 2: VERIFICAR DATOS EN SURTIDORES
-- ============================================================================
SELECT '⛽ VERIFICANDO SURTIDORES...' as info;

SELECT 
    'SURTIDORES EXISTENTES' as seccion,
    id,
    nombre,
    estado,
    ubicacion
FROM surtidores
ORDER BY nombre;

-- ============================================================================
-- PASO 3: VERIFICAR DATOS EN COMBUSTIBLES_SURTIDOR
-- ============================================================================
SELECT '🛢️ VERIFICANDO COMBUSTIBLES_SURTIDOR...' as info;

SELECT 
    'COMBUSTIBLES POR SURTIDOR' as seccion,
    cs.id,
    s.nombre as surtidor_nombre,
    cs.tipo_combustible,
    cs.precio,
    cs.stock,
    cs.capacidad_maxima,
    cs.vendido
FROM surtidores s
JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
ORDER BY s.nombre, cs.tipo_combustible;

-- ============================================================================
-- PASO 4: CONTAR COMBUSTIBLES POR SURTIDOR
-- ============================================================================
SELECT '📊 CONTANDO COMBUSTIBLES...' as info;

SELECT 
    'CONTEO COMBUSTIBLES' as seccion,
    s.nombre as surtidor,
    COUNT(cs.tipo_combustible) as tipos_combustible,
    CASE 
        WHEN COUNT(cs.tipo_combustible) = 3 THEN '✅ Completo'
        WHEN COUNT(cs.tipo_combustible) > 0 THEN '⚠️ Incompleto'
        ELSE '❌ Sin combustibles'
    END as estado
FROM surtidores s
LEFT JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
GROUP BY s.id, s.nombre
ORDER BY s.nombre;

-- ============================================================================
-- PASO 5: VERIFICAR PRECIOS
-- ============================================================================
SELECT '💰 VERIFICANDO PRECIOS...' as info;

SELECT 
    'PRECIOS CONFIGURADOS' as seccion,
    clave as tipo_combustible,
    valor as precio,
    descripcion
FROM configuracion
WHERE clave LIKE 'precio_%'
ORDER BY clave;

-- ============================================================================
-- PASO 6: VERIFICAR COMBUSTIBLES CON PRECIO 0
-- ============================================================================
SELECT '🔍 VERIFICANDO PRECIOS CERO...' as info;

SELECT 
    'COMBUSTIBLES CON PRECIO 0' as seccion,
    s.nombre as surtidor,
    cs.tipo_combustible,
    cs.precio,
    CASE 
        WHEN cs.precio = 0 THEN '❌ Precio 0'
        ELSE '✅ Precio válido'
    END as estado
FROM surtidores s
JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
WHERE cs.precio = 0
ORDER BY s.nombre, cs.tipo_combustible;

-- ============================================================================
-- PASO 7: VERIFICAR STOCK
-- ============================================================================
SELECT '📦 VERIFICANDO STOCK...' as info;

SELECT 
    'COMBUSTIBLES CON STOCK 0' as seccion,
    s.nombre as surtidor,
    cs.tipo_combustible,
    cs.stock,
    CASE 
        WHEN cs.stock = 0 THEN '❌ Sin stock'
        ELSE '✅ Con stock'
    END as estado
FROM surtidores s
JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
WHERE cs.stock = 0
ORDER BY s.nombre, cs.tipo_combustible;

-- ============================================================================
-- PASO 8: RESUMEN GENERAL
-- ============================================================================
SELECT '📋 RESUMEN GENERAL...' as info;

SELECT 
    'RESUMEN' as seccion,
    'Total surtidores' as elemento,
    COUNT(*) as cantidad
FROM surtidores
UNION ALL
SELECT 
    'RESUMEN' as seccion,
    'Total combustibles' as elemento,
    COUNT(*) as cantidad
FROM combustibles_surtidor
UNION ALL
SELECT 
    'RESUMEN' as seccion,
    'Combustibles con precio > 0' as elemento,
    COUNT(*) as cantidad
FROM combustibles_surtidor
WHERE precio > 0
UNION ALL
SELECT 
    'RESUMEN' as seccion,
    'Combustibles con stock > 0' as elemento,
    COUNT(*) as cantidad
FROM combustibles_surtidor
WHERE stock > 0;

-- ============================================================================
-- PASO 9: SIMULAR CONSULTA SIMPLE DEL FRONTEND
-- ============================================================================
SELECT '🔄 SIMULANDO CONSULTA FRONTEND...' as info;

-- Consulta simple que simula lo que necesita el frontend
SELECT 
    'SURTIDOR_COMBUSTIBLE' as seccion,
    s.id as surtidor_id,
    s.nombre as surtidor_nombre,
    s.estado as surtidor_estado,
    cs.tipo_combustible,
    cs.precio,
    cs.stock,
    cs.capacidad_maxima
FROM surtidores s
JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
WHERE s.estado IN ('disponible', 'ocupado')
  AND cs.precio > 0
  AND cs.stock > 0
ORDER BY s.nombre, cs.tipo_combustible;

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================
SELECT '🎯 VERIFICACIÓN SIMPLE COMPLETADA' as mensaje;
SELECT 'Revisa los resultados para identificar el problema' as recomendacion;
SELECT 'Si hay datos, el problema está en el frontend' as resultado;
