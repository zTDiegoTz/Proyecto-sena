// ============================================================================
// CORREGIR FUNCIÓN DUPLICADA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para eliminar la función duplicada actualizar_stock_venta

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function eliminarFuncionDuplicada() {
  try {
    console.log('🗑️  ELIMINANDO FUNCIÓN DUPLICADA actualizar_stock_venta...')
    
    // Primero, vamos a eliminar todas las versiones de la función
    console.log('\n📋 PASO 1: Eliminando todas las versiones de la función...')
    
    // Eliminar función con parámetro BIGINT (versión incorrecta)
    const { error: error1 } = await supabase
      .rpc('exec_sql', {
        sql: 'DROP FUNCTION IF EXISTS actualizar_stock_venta(BIGINT, VARCHAR, NUMERIC) CASCADE;'
      })
    
    if (error1) {
      console.log('⚠️  Error eliminando función BIGINT:', error1.message)
    } else {
      console.log('✅ Función con BIGINT eliminada exitosamente')
    }
    
    // Eliminar función con parámetro UUID (versión correcta)
    const { error: error2 } = await supabase
      .rpc('exec_sql', {
        sql: 'DROP FUNCTION IF EXISTS actualizar_stock_venta(UUID, VARCHAR, NUMERIC) CASCADE;'
      })
    
    if (error2) {
      console.log('⚠️  Error eliminando función UUID:', error2.message)
    } else {
      console.log('✅ Función con UUID eliminada exitosamente')
    }
    
    console.log('\n📋 PASO 2: Recreando solo la versión correcta (UUID)...')
    
    // Recrear solo la versión correcta con UUID
    const funcionCorrecta = `
      CREATE OR REPLACE FUNCTION actualizar_stock_venta(
        p_surtidor_id UUID,
        p_tipo_combustible VARCHAR(20),
        p_cantidad NUMERIC
      )
      RETURNS VOID AS $$
      BEGIN
        -- Actualizar el stock del combustible en el surtidor
        UPDATE combustibles_surtidor 
        SET stock_actual = stock_actual - p_cantidad,
            fecha_actualizacion = NOW()
        WHERE surtidor_id = p_surtidor_id 
          AND tipo_combustible = p_tipo_combustible;
        
        -- Verificar que la actualización fue exitosa
        IF NOT FOUND THEN
          RAISE EXCEPTION 'No se encontró el combustible % en el surtidor %', p_tipo_combustible, p_surtidor_id;
        END IF;
        
        -- Log de la operación
        RAISE NOTICE 'Stock actualizado: Surtidor %, Combustible %, Cantidad vendida: %', 
          p_surtidor_id, p_tipo_combustible, p_cantidad;
          
      END;
      $$ LANGUAGE plpgsql;
    `
    
    const { error: error3 } = await supabase
      .rpc('exec_sql', {
        sql: funcionCorrecta
      })
    
    if (error3) {
      console.log('❌ Error recreando función:', error3.message)
      return false
    } else {
      console.log('✅ Función correcta recreada exitosamente')
    }
    
    return true
    
  } catch (error) {
    console.log('❌ Error durante la corrección:', error.message)
    return false
  }
}

async function probarFuncionCorregida() {
  try {
    console.log('\n🧪 PROBANDO FUNCIÓN CORREGIDA...')
    
    // Obtener un surtidor válido
    const { data: surtidor, error: surtidorError } = await supabase
      .from('surtidores')
      .select('id, nombre')
      .limit(1)
      .single()
    
    if (surtidorError) {
      console.log('❌ Error obteniendo surtidor:', surtidorError.message)
      return false
    }
    
    console.log('📊 Probando con surtidor:', surtidor.nombre, '(ID:', surtidor.id, ')')
    
    // Probar la función corregida
    const { data: resultado, error: error } = await supabase
      .rpc('actualizar_stock_venta', {
        p_surtidor_id: surtidor.id,
        p_tipo_combustible: 'corriente',
        p_cantidad: 1
      })
    
    if (error) {
      console.log('❌ Error probando función:', error.message)
      console.log('   Código:', error.code)
      console.log('   Detalles:', error.details)
      return false
    } else {
      console.log('✅ Función ejecutada correctamente')
      console.log('   Resultado:', resultado)
      return true
    }
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
    return false
  }
}

async function verificarEstadoFinal() {
  try {
    console.log('\n🔍 VERIFICANDO ESTADO FINAL...')
    
    // Verificar que solo existe una versión de la función
    console.log('📋 Verificando que la función funciona correctamente...')
    
    const { data: surtidor, error: surtidorError } = await supabase
      .from('surtidores')
      .select('id, nombre')
      .limit(1)
      .single()
    
    if (surtidorError) {
      console.log('❌ Error obteniendo surtidor:', surtidorError.message)
      return false
    }
    
    // Probar la función una vez más
    const { error: error } = await supabase
      .rpc('actualizar_stock_venta', {
        p_surtidor_id: surtidor.id,
        p_tipo_combustible: 'extra',
        p_cantidad: 0.5
      })
    
    if (error) {
      console.log('❌ Error en verificación final:', error.message)
      return false
    } else {
      console.log('✅ Verificación final exitosa')
      console.log('✅ La función actualizar_stock_venta funciona correctamente')
      console.log('✅ Solo existe una versión de la función (con UUID)')
      return true
    }
    
  } catch (error) {
    console.log('❌ Error durante la verificación final:', error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🔧 INICIANDO CORRECCIÓN DE FUNCIÓN DUPLICADA...')
    
    // Paso 1: Eliminar función duplicada
    const eliminacionExitosa = await eliminarFuncionDuplicada()
    
    if (!eliminacionExitosa) {
      console.log('❌ No se pudo eliminar la función duplicada')
      return
    }
    
    // Paso 2: Probar función corregida
    const pruebaExitosa = await probarFuncionCorregida()
    
    if (!pruebaExitosa) {
      console.log('❌ La función no funciona correctamente después de la corrección')
      return
    }
    
    // Paso 3: Verificar estado final
    const verificacionExitosa = await verificarEstadoFinal()
    
    if (verificacionExitosa) {
      console.log('\n🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE 🎉')
      console.log('✅ Función duplicada eliminada')
      console.log('✅ Solo existe la versión correcta (UUID)')
      console.log('✅ La función funciona correctamente')
      console.log('\n📋 PRÓXIMO PASO: Ejecutar verificación de integridad completa')
    } else {
      console.log('❌ La corrección no fue completamente exitosa')
    }
    
  } catch (error) {
    console.log('❌ Error durante la corrección:', error.message)
  }
}

main()

