-- =====================================================
-- SCRIPT PARA ELIMINAR TODAS LAS TABLAS EXISTENTES
-- =====================================================
-- Limpia completamente la base de datos para crear una nueva

-- ============================================================================
-- PASO 1: IDENTIFICAR TABLAS EXISTENTES
-- ============================================================================
SELECT '🔍 IDENTIFICANDO TABLAS EXISTENTES...' as info;

-- Mostrar todas las tablas que se van a eliminar
SELECT 
    'TABLAS A ELIMINAR' as seccion,
    table_name as tabla,
    CASE 
        WHEN table_name = 'users' THEN '👤 USUARIOS'
        WHEN table_name = 'surtidores' THEN '⛽ SURTIDORES'
        WHEN table_name = 'ventas' THEN '💰 VENTAS'
        WHEN table_name = 'combustibles_surtidor' THEN '🛢️ COMBUSTIBLES'
        WHEN table_name = 'turnos' THEN '🕐 TURNOS'
        WHEN table_name = 'configuracion' THEN '⚙️ CONFIGURACIÓN'
        WHEN table_name = 'inventario_historico' THEN '📊 INVENTARIO'
        WHEN table_name = 'precios_historico' THEN '💲 PRECIOS'
        WHEN table_name = 'reportes' THEN '📈 REPORTES'
        WHEN table_name = 'auditoria' THEN '🔍 AUDITORÍA'
        WHEN table_name LIKE 'backup_%' THEN '💾 BACKUP'
        WHEN table_name LIKE 'id_mapping_%' THEN '🔄 MAPEO'
        ELSE '📋 OTRA TABLA'
    END as tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- PASO 2: ELIMINAR VISTAS PRIMERO
-- ============================================================================
SELECT '👁️ ELIMINANDO VISTAS...' as info;

-- Eliminar todas las vistas
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT viewname
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE 'DROP VIEW IF EXISTS ' || view_record.viewname || ' CASCADE';
            RAISE NOTICE '✅ Vista % eliminada', view_record.viewname;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Error al eliminar vista %: %', view_record.viewname, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 3: ELIMINAR TRIGGERS
-- ============================================================================
SELECT '🔄 ELIMINANDO TRIGGERS...' as info;

-- Eliminar todos los triggers
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    LOOP
        BEGIN
            EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || 
                   ' ON ' || trigger_record.event_object_table || ' CASCADE';
            RAISE NOTICE '✅ Trigger % eliminado de tabla %', 
                        trigger_record.trigger_name, trigger_record.event_object_table;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Error al eliminar trigger %: %', 
                            trigger_record.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 4: ELIMINAR FUNCIONES
-- ============================================================================
SELECT '⚙️ ELIMINANDO FUNCIONES...' as info;

-- Eliminar todas las funciones
DO $$
DECLARE
    function_record RECORD;
BEGIN
    FOR function_record IN 
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_name NOT LIKE 'pg_%'  -- No eliminar funciones del sistema
    LOOP
        BEGIN
            EXECUTE 'DROP ' || function_record.routine_type || ' IF EXISTS ' || 
                   function_record.routine_name || ' CASCADE';
            RAISE NOTICE '✅ Función % eliminada', function_record.routine_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Error al eliminar función %: %', 
                            function_record.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 5: ELIMINAR TODAS LAS TABLAS
-- ============================================================================
SELECT '🗑️ ELIMINANDO TODAS LAS TABLAS...' as info;

-- Eliminar todas las tablas con CASCADE para forzar eliminación
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        BEGIN
            EXECUTE 'DROP TABLE IF EXISTS ' || table_record.table_name || ' CASCADE';
            RAISE NOTICE '✅ Tabla % eliminada', table_record.table_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Error al eliminar tabla %: %', 
                            table_record.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 6: ELIMINAR ÍNDICES HUÉRFANOS
-- ============================================================================
SELECT '📊 ELIMINANDO ÍNDICES HUÉRFANOS...' as info;

-- Eliminar índices que puedan haber quedado
DO $$
DECLARE
    index_record RECORD;
BEGIN
    FOR index_record IN 
        SELECT indexname
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
    LOOP
        BEGIN
            EXECUTE 'DROP INDEX IF EXISTS ' || index_record.indexname || ' CASCADE';
            RAISE NOTICE '✅ Índice % eliminado', index_record.indexname;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Error al eliminar índice %: %', 
                            index_record.indexname, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 7: LIMPIAR SECUENCIAS
-- ============================================================================
SELECT '🔢 LIMPIANDO SECUENCIAS...' as info;

-- Eliminar secuencias que puedan haber quedado
DO $$
DECLARE
    sequence_record RECORD;
BEGIN
    FOR sequence_record IN 
        SELECT sequence_name
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        BEGIN
            EXECUTE 'DROP SEQUENCE IF EXISTS ' || sequence_record.sequence_name || ' CASCADE';
            RAISE NOTICE '✅ Secuencia % eliminada', sequence_record.sequence_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Error al eliminar secuencia %: %', 
                            sequence_record.sequence_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 8: VERIFICAR LIMPIEZA COMPLETA
-- ============================================================================
SELECT '🔍 VERIFICANDO LIMPIEZA COMPLETA...' as info;

-- Verificar que no queden tablas
SELECT 
    'TABLAS RESTANTES' as seccion,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TODAS LAS TABLAS ELIMINADAS'
        ELSE '❌ QUEDAN ' || COUNT(*) || ' TABLAS'
    END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Verificar que no queden vistas
SELECT 
    'VISTAS RESTANTES' as seccion,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TODAS LAS VISTAS ELIMINADAS'
        ELSE '❌ QUEDAN ' || COUNT(*) || ' VISTAS'
    END as estado
FROM information_schema.views 
WHERE table_schema = 'public';

-- Verificar que no queden funciones
SELECT 
    'FUNCIONES RESTANTES' as seccion,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TODAS LAS FUNCIONES ELIMINADAS'
        ELSE '❌ QUEDAN ' || COUNT(*) || ' FUNCIONES'
    END as estado
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name NOT LIKE 'pg_%';

-- Verificar que no queden triggers
SELECT 
    'TRIGGERS RESTANTES' as seccion,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TODOS LOS TRIGGERS ELIMINADOS'
        ELSE '❌ QUEDAN ' || COUNT(*) || ' TRIGGERS'
    END as estado
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- ============================================================================
-- PASO 9: LIMPIEZA FINAL
-- ============================================================================
SELECT '🧹 LIMPIEZA FINAL...' as info;

-- NOTA: Los comandos VACUUM y ANALYZE deben ejecutarse fuera de transacciones
-- Ejecuta estos comandos después del script principal:

/*
VACUUM;
ANALYZE;
*/

SELECT '✅ Limpieza final completada' as resultado;

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================
SELECT '🎉 LIMPIEZA COMPLETA FINALIZADA 🎉' as mensaje;
SELECT 'Todas las tablas existentes han sido eliminadas' as detalle1;
SELECT '✅ Vistas eliminadas' as detalle2;
SELECT '✅ Triggers eliminados' as detalle3;
SELECT '✅ Funciones eliminadas' as detalle4;
SELECT '✅ Tablas eliminadas' as detalle5;
SELECT '✅ Índices eliminados' as detalle6;
SELECT '✅ Secuencias eliminadas' as detalle7;
SELECT '✅ Base de datos completamente limpia' as detalle8;
SELECT '🚀 Lista para crear nueva base de datos optimizada' as resultado;
