-- ============================================================================
-- CORRECCIÓN DE PRECIOS DE COMBUSTIBLES
-- ============================================================================
-- Script para corregir precios incorrectos en la base de datos

SELECT '🔍 VERIFICANDO PRECIOS ACTUALES...' as info;

-- ============================================================================
-- PASO 1: VERIFICAR PRECIOS ACTUALES
-- ============================================================================
SELECT '📊 PRECIOS ACTUALES:' as info;

SELECT 
    s.nombre as surtidor,
    cs.tipo_combustible,
    cs.precio as precio_actual,
    CASE 
        WHEN cs.precio > 50000 THEN '❌ PRECIO INCORRECTO'
        WHEN cs.precio = 0 THEN '⚠️ PRECIO CERO'
        WHEN cs.precio BETWEEN 10000 AND 20000 THEN '✅ PRECIO CORRECTO'
        ELSE '⚠️ PRECIO SOSPECHOSO'
    END as estado_precio
FROM surtidores s
JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
ORDER BY s.nombre, cs.tipo_combustible;

-- ============================================================================
-- PASO 2: CORREGIR PRECIOS INCORRECTOS
-- ============================================================================
SELECT '🔧 CORRIGIENDO PRECIOS...' as info;

-- Corregir precios que sean mayores a 50000 (claramente incorrectos)
UPDATE combustibles_surtidor 
SET precio = CASE 
    WHEN tipo_combustible = 'extra' THEN 12500
    WHEN tipo_combustible = 'corriente' THEN 12000
    WHEN tipo_combustible = 'acpm' THEN 11000
    ELSE precio
END
WHERE precio > 50000;

-- Corregir precios que sean 0
UPDATE combustibles_surtidor 
SET precio = CASE 
    WHEN tipo_combustible = 'extra' THEN 12500
    WHEN tipo_combustible = 'corriente' THEN 12000
    WHEN tipo_combustible = 'acpm' THEN 11000
    ELSE precio
END
WHERE precio = 0;

-- ============================================================================
-- PASO 3: VERIFICAR CORRECCIÓN
-- ============================================================================
SELECT '✅ VERIFICANDO CORRECCIÓN...' as info;

SELECT 
    s.nombre as surtidor,
    cs.tipo_combustible,
    cs.precio as precio_corregido,
    CASE 
        WHEN cs.precio BETWEEN 10000 AND 20000 THEN '✅ CORRECTO'
        ELSE '❌ AÚN INCORRECTO'
    END as estado_final
FROM surtidores s
JOIN combustibles_surtidor cs ON s.id = cs.surtidor_id
ORDER BY s.nombre, cs.tipo_combustible;

-- ============================================================================
-- PASO 4: RESUMEN DE CAMBIOS
-- ============================================================================
SELECT '📋 RESUMEN DE CAMBIOS:' as info;

SELECT 
    COUNT(*) as total_combustibles,
    COUNT(CASE WHEN precio BETWEEN 10000 AND 20000 THEN 1 END) as precios_correctos,
    COUNT(CASE WHEN precio NOT BETWEEN 10000 AND 20000 THEN 1 END) as precios_incorrectos
FROM combustibles_surtidor;

SELECT '✅ Corrección de precios completada' as resultado;


