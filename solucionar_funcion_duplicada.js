// ============================================================================
// SOLUCIONAR FUNCIÓN DUPLICADA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para solucionar el problema de función duplicada usando una aproximación diferente

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function crearFuncionAlternativa() {
  try {
    console.log('🔧 CREANDO FUNCIÓN ALTERNATIVA PARA EVITAR CONFLICTO...')
    
    // Crear una función con un nombre diferente que use UUID
    const funcionAlternativa = `
      CREATE OR REPLACE FUNCTION actualizar_stock_venta_uuid(
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
    
    // Intentar crear la función usando una llamada directa
    const { error: error } = await supabase
      .rpc('create_function', {
        function_definition: funcionAlternativa
      })
    
    if (error) {
      console.log('❌ Error creando función alternativa:', error.message)
      return false
    } else {
      console.log('✅ Función alternativa creada exitosamente')
      return true
    }
    
  } catch (error) {
    console.log('❌ Error durante la creación:', error.message)
    return false
  }
}

async function probarFuncionAlternativa() {
  try {
    console.log('\n🧪 PROBANDO FUNCIÓN ALTERNATIVA...')
    
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
    
    // Probar la función alternativa
    const { data: resultado, error: error } = await supabase
      .rpc('actualizar_stock_venta_uuid', {
        p_surtidor_id: surtidor.id,
        p_tipo_combustible: 'corriente',
        p_cantidad: 1
      })
    
    if (error) {
      console.log('❌ Error probando función alternativa:', error.message)
      console.log('   Código:', error.code)
      console.log('   Detalles:', error.details)
      return false
    } else {
      console.log('✅ Función alternativa ejecutada correctamente')
      console.log('   Resultado:', resultado)
      return true
    }
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
    return false
  }
}

async function actualizarServiciosFrontend() {
  try {
    console.log('\n🔄 ACTUALIZANDO SERVICIOS DEL FRONTEND...')
    
    // Leer el archivo de servicios
    const fs = require('fs')
    const path = require('path')
    
    const archivoServicios = 'src/services/supabaseServiceFinal.js'
    
    if (!fs.existsSync(archivoServicios)) {
      console.log('❌ Archivo de servicios no encontrado:', archivoServicios)
      return false
    }
    
    let contenido = fs.readFileSync(archivoServicios, 'utf8')
    
    // Buscar y reemplazar llamadas a la función problemática
    const llamadaOriginal = 'actualizar_stock_venta'
    const llamadaNueva = 'actualizar_stock_venta_uuid'
    
    if (contenido.includes(llamadaOriginal)) {
      contenido = contenido.replace(new RegExp(llamadaOriginal, 'g'), llamadaNueva)
      
      // Escribir el archivo actualizado
      fs.writeFileSync(archivoServicios, contenido, 'utf8')
      
      console.log('✅ Servicios del frontend actualizados')
      console.log(`   Reemplazado: ${llamadaOriginal} → ${llamadaNueva}`)
      return true
    } else {
      console.log('⚠️  No se encontraron llamadas a la función problemática en los servicios')
      return true
    }
    
  } catch (error) {
    console.log('❌ Error actualizando servicios:', error.message)
    return false
  }
}

async function verificarSolucion() {
  try {
    console.log('\n🔍 VERIFICANDO SOLUCIÓN...')
    
    // Verificar que la función alternativa funciona
    const { data: surtidor, error: surtidorError } = await supabase
      .from('surtidores')
      .select('id, nombre')
      .limit(1)
      .single()
    
    if (surtidorError) {
      console.log('❌ Error obteniendo surtidor:', surtidorError.message)
      return false
    }
    
    // Probar la función alternativa
    const { error: error } = await supabase
      .rpc('actualizar_stock_venta_uuid', {
        p_surtidor_id: surtidor.id,
        p_tipo_combustible: 'extra',
        p_cantidad: 0.5
      })
    
    if (error) {
      console.log('❌ Error en verificación:', error.message)
      return false
    } else {
      console.log('✅ Verificación exitosa')
      console.log('✅ La función alternativa funciona correctamente')
      return true
    }
    
  } catch (error) {
    console.log('❌ Error durante la verificación:', error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🔧 INICIANDO SOLUCIÓN DE FUNCIÓN DUPLICADA...')
    
    // Paso 1: Crear función alternativa
    const creacionExitosa = await crearFuncionAlternativa()
    
    if (!creacionExitosa) {
      console.log('❌ No se pudo crear la función alternativa')
      return
    }
    
    // Paso 2: Probar función alternativa
    const pruebaExitosa = await probarFuncionAlternativa()
    
    if (!pruebaExitosa) {
      console.log('❌ La función alternativa no funciona correctamente')
      return
    }
    
    // Paso 3: Actualizar servicios del frontend
    const actualizacionExitosa = await actualizarServiciosFrontend()
    
    if (!actualizacionExitosa) {
      console.log('❌ No se pudieron actualizar los servicios del frontend')
      return
    }
    
    // Paso 4: Verificar solución
    const verificacionExitosa = await verificarSolucion()
    
    if (verificacionExitosa) {
      console.log('\n🎉 SOLUCIÓN COMPLETADA EXITOSAMENTE 🎉')
      console.log('✅ Función alternativa creada (actualizar_stock_venta_uuid)')
      console.log('✅ Servicios del frontend actualizados')
      console.log('✅ La función funciona correctamente')
      console.log('\n📋 PRÓXIMO PASO: Ejecutar verificación de integridad completa')
    } else {
      console.log('❌ La solución no fue completamente exitosa')
    }
    
  } catch (error) {
    console.log('❌ Error durante la solución:', error.message)
  }
}

main()
