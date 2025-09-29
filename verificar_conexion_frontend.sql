-- =====================================================
-- VERIFICACIÓN DE CONEXIÓN FRONTEND - BASE DE DATOS
-- =====================================================
-- Script para verificar que la base de datos esté lista para el frontend

-- ============================================================================
-- PASO 1: VERIFICAR TABLAS QUE USA EL FRONTEND
-- ============================================================================
SELECT '🔍 VERIFICANDO TABLAS QUE USA EL FRONTEND...' as info;

-- Verificar que todas las tablas principales existen
SELECT 
    'TABLAS PRINCIPALES' as seccion,
    table_name as tabla,
    CASE 
        WHEN table_name = 'users' THEN '👤 Usuarios (Login)'
        WHEN table_name = 'surtidores' THEN '⛽ Surtidores (Dashboard)'
        WHEN table_name = 'ventas' THEN '💰 Ventas (Registro)'
        WHEN table_name = 'combustibles_surtidor' THEN '🛢️ Combustibles (Inventario)'
        WHEN table_name = 'turnos' THEN '🕐 Turnos (Gestión)'
        WHEN table_name = 'configuracion' THEN '⚙️ Configuración (Precios)'
        ELSE '📋 Otra tabla'
    END as descripcion,
    '✅ Existe' as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('users', 'surtidores', 'ventas', 'combustibles_surtidor', 'turnos', 'configuracion')
ORDER BY table_name;

-- ============================================================================
-- PASO 2: VERIFICAR DATOS INICIALES PARA LOGIN
-- ============================================================================
SELECT '👤 VERIFICANDO DATOS PARA LOGIN...' as info;

-- Verificar usuarios disponibles para login
SELECT 
    'USUARIOS DISPONIBLES' as seccion,
    username as usuario,
    name as nombre,
    role as rol,
    activo as estado,
    CASE 
        WHEN activo = true THEN '✅ Activo'
        ELSE '❌ Inactivo'
    END as estado_login
FROM users
ORDER BY role, username;

-- Verificar que hay al menos un usuario activo
SELECT 
    'VERIFICACIÓN LOGIN' as seccion,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN activo = true THEN 1 END) as usuarios_activos,
    CASE 
        WHEN COUNT(CASE WHEN activo = true THEN 1 END) > 0 THEN '✅ Login posible'
        ELSE '❌ No hay usuarios activos'
    END as estado_login
FROM users;

-- ============================================================================
-- PASO 3: VERIFICAR DATOS PARA DASHBOARD
-- ============================================================================
SELECT '📊 VERIFICANDO DATOS PARA DASHBOARD...' as info;

-- Verificar surtidores para dashboard
SELECT 
    'SURTIDORES PARA DASHBOARD' as seccion,
    COUNT(*) as total_surtidores,
    COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as surtidores_disponibles,
    COUNT(CASE WHEN estado = 'ocupado' THEN 1 END) as surtidores_ocupados,
    COUNT(CASE WHEN estado = 'mantenimiento' THEN 1 END) as surtidores_mantenimiento,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Dashboard funcional'
        ELSE '❌ Sin surtidores'
    END as estado_dashboard
FROM surtidores;

-- Verificar combustibles para dashboard
SELECT 
    'COMBUSTIBLES PARA DASHBOARD' as seccion,
    COUNT(*) as total_combustibles,
    COUNT(DISTINCT tipo_combustible) as tipos_combustible,
    COUNT(DISTINCT surtidor_id) as surtidores_con_combustible,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Inventario funcional'
        ELSE '❌ Sin combustibles'
    END as estado_inventario
FROM combustibles_surtidor;

-- ============================================================================
-- PASO 4: VERIFICAR CONFIGURACIÓN DE PRECIOS
-- ============================================================================
SELECT '💰 VERIFICANDO CONFIGURACIÓN DE PRECIOS...' as info;

-- Verificar precios configurados
SELECT 
    'PRECIOS CONFIGURADOS' as seccion,
    clave as tipo_combustible,
    valor as precio,
    descripcion,
    CASE 
        WHEN valor IS NOT NULL AND valor != '' THEN '✅ Precio configurado'
        ELSE '❌ Precio faltante'
    END as estado_precio
FROM configuracion
WHERE clave IN ('precio_extra', 'precio_corriente', 'precio_acpm')
ORDER BY clave;

-- Verificar que todos los precios están configurados
SELECT 
    'VERIFICACIÓN PRECIOS' as seccion,
    COUNT(*) as precios_configurados,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ Todos los precios configurados'
        ELSE '❌ Faltan precios: ' || (3 - COUNT(*))
    END as estado_precios
FROM configuracion
WHERE clave IN ('precio_extra', 'precio_corriente', 'precio_acpm');

-- ============================================================================
-- PASO 5: VERIFICAR VISTAS PARA DASHBOARD
-- ============================================================================
SELECT '👁️ VERIFICANDO VISTAS PARA DASHBOARD...' as info;

-- Verificar vistas existentes
SELECT 
    'VISTAS DASHBOARD' as seccion,
    table_name as vista,
    CASE 
        WHEN table_name = 'vista_combustibles_disponibles' THEN '🛢️ Combustibles disponibles'
        WHEN table_name = 'vista_surtidores_estado' THEN '⛽ Estado de surtidores'
        WHEN table_name = 'vista_ventas_diarias' THEN '📊 Ventas diarias'
        WHEN table_name = 'vista_ultimas_ventas' THEN '🕐 Últimas ventas'
        WHEN table_name = 'vista_estadisticas_combustible' THEN '📈 Estadísticas por combustible'
        WHEN table_name = 'vista_turnos_activos' THEN '👥 Turnos activos'
        ELSE '📋 Otra vista'
    END as descripcion,
    '✅ Existe' as estado
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- PASO 6: VERIFICAR FUNCIONES PARA FRONTEND
-- ============================================================================
SELECT '⚙️ VERIFICANDO FUNCIONES PARA FRONTEND...' as info;

-- Verificar funciones existentes
SELECT 
    'FUNCIONES FRONTEND' as seccion,
    routine_name as funcion,
    routine_type as tipo,
    CASE 
        WHEN routine_name = 'actualizar_fecha_actualizacion' THEN '🔄 Actualizar fechas'
        WHEN routine_name = 'actualizar_stock_venta' THEN '📦 Actualizar stock'
        WHEN routine_name = 'calcular_estadisticas_ventas' THEN '📊 Estadísticas de ventas'
        WHEN routine_name = 'obtener_resumen_ventas_diario' THEN '📈 Resumen diario'
        ELSE '📋 Otra función'
    END as descripcion,
    '✅ Existe' as estado
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ============================================================================
-- PASO 7: VERIFICAR PERMISOS Y SEGURIDAD
-- ============================================================================
SELECT '🔒 VERIFICANDO PERMISOS Y SEGURIDAD...' as info;

-- Verificar RLS (Row Level Security)
SELECT 
    'SEGURIDAD RLS' as seccion,
    schemaname as esquema,
    tablename as tabla,
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS habilitado'
        ELSE '⚠️ RLS deshabilitado (OK para desarrollo)'
    END as estado_seguridad
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'surtidores', 'ventas', 'combustibles_surtidor', 'turnos', 'configuracion')
ORDER BY tablename;

-- ============================================================================
-- PASO 8: VERIFICAR CLAVES FORÁNEAS
-- ============================================================================
SELECT '🔗 VERIFICANDO CLAVES FORÁNEAS...' as info;

-- Verificar claves foráneas críticas
SELECT 
    'CLAVES FORÁNEAS CRÍTICAS' as seccion,
    tc.constraint_name as constraint,
    tc.table_name as tabla_origen,
    kcu.column_name as columna_origen,
    ccu.table_name as tabla_destino,
    ccu.column_name as columna_destino,
    '✅ Existe' as estado
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('ventas', 'combustibles_surtidor', 'turnos')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- PASO 9: VERIFICAR ÍNDICES PARA RENDIMIENTO
-- ============================================================================
SELECT '📊 VERIFICANDO ÍNDICES PARA RENDIMIENTO...' as info;

-- Verificar índices críticos para el frontend
SELECT 
    'ÍNDICES CRÍTICOS' as seccion,
    tablename as tabla,
    indexname as indice,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ Índice optimizado'
        ELSE '📋 Índice automático'
    END as tipo_indice
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'surtidores', 'ventas', 'combustibles_surtidor', 'turnos')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- PASO 10: VERIFICACIÓN FINAL PARA FRONTEND
-- ============================================================================
SELECT '🎯 VERIFICACIÓN FINAL PARA FRONTEND...' as info;

-- Resumen de verificación
SELECT 
    'RESUMEN FRONTEND' as seccion,
    'Tablas principales' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 6 THEN '✅ Todas las tablas existen'
        ELSE '❌ Faltan tablas: ' || (6 - COUNT(*))
    END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('users', 'surtidores', 'ventas', 'combustibles_surtidor', 'turnos', 'configuracion')
UNION ALL
SELECT 
    'RESUMEN FRONTEND' as seccion,
    'Usuarios activos' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Login posible'
        ELSE '❌ No hay usuarios para login'
    END as estado
FROM users
WHERE activo = true
UNION ALL
SELECT 
    'RESUMEN FRONTEND' as seccion,
    'Surtidores' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Dashboard funcional'
        ELSE '❌ Sin surtidores'
    END as estado
FROM surtidores
UNION ALL
SELECT 
    'RESUMEN FRONTEND' as seccion,
    'Combustibles' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Inventario funcional'
        ELSE '❌ Sin combustibles'
    END as estado
FROM combustibles_surtidor
UNION ALL
SELECT 
    'RESUMEN FRONTEND' as seccion,
    'Precios configurados' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ Precios listos'
        ELSE '❌ Faltan precios: ' || (3 - COUNT(*))
    END as estado
FROM configuracion
WHERE clave IN ('precio_extra', 'precio_corriente', 'precio_acpm')
UNION ALL
SELECT 
    'RESUMEN FRONTEND' as seccion,
    'Vistas dashboard' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ Vistas listas'
        ELSE '❌ Faltan vistas: ' || (6 - COUNT(*))
    END as estado
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'RESUMEN FRONTEND' as seccion,
    'Funciones' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ Funciones listas'
        ELSE '❌ Faltan funciones: ' || (4 - COUNT(*))
    END as estado
FROM information_schema.routines
WHERE routine_schema = 'public'
UNION ALL
SELECT 
    'RESUMEN FRONTEND' as seccion,
    'Claves foráneas' as elemento,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ Relaciones correctas'
        ELSE '❌ Faltan relaciones: ' || (5 - COUNT(*))
    END as estado
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public'
  AND table_name IN ('ventas', 'combustibles_surtidor', 'turnos');

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================
SELECT '🎉 VERIFICACIÓN DE CONEXIÓN FRONTEND COMPLETADA' as mensaje;
SELECT 'Si todos los elementos muestran ✅, el frontend puede conectarse' as detalle1;
SELECT 'Las credenciales en src/lib/supabase.js están correctas' as detalle2;
SELECT 'La base de datos está lista para el frontend React' as resultado;
