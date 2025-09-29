// ============================================================================
// INVESTIGAR FUNCIÓN DUPLICADA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para investigar y corregir la función actualizar_stock_venta duplicada

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function investigarFuncionDuplicada() {
  try {
    console.log('🔍 INVESTIGANDO FUNCIÓN actualizar_stock_venta DUPLICADA...')
    
    // Buscar todas las funciones con el nombre actualizar_stock_venta
    const { data: funciones, error: funcionesError } = await supabase
      .rpc('get_function_info', { function_name: 'actualizar_stock_venta' })
    
    if (funcionesError) {
      console.log('❌ Error obteniendo información de funciones:', funcionesError.message)
      
      // Intentar obtener información de otra manera
      console.log('\n🔍 INTENTANDO OBTENER INFORMACIÓN DE FUNCIONES...')
      
      // Buscar en el esquema de información
      const { data: schemaInfo, error: schemaError } = await supabase
        .from('information_schema.routines')
        .select('*')
        .eq('routine_name', 'actualizar_stock_venta')
      
      if (schemaError) {
        console.log('❌ Error accediendo a information_schema:', schemaError.message)
        return
      }
      
      if (schemaInfo && schemaInfo.length > 0) {
        console.log(`📊 Funciones encontradas: ${schemaInfo.length}`)
        schemaInfo.forEach((func, i) => {
          console.log(`\n${i+1}. Función: ${func.routine_name}`)
          console.log(`   Esquema: ${func.routine_schema}`)
          console.log(`   Tipo: ${func.routine_type}`)
          console.log(`   Definición: ${func.routine_definition?.substring(0, 200)}...`)
        })
      } else {
        console.log('❌ No se encontraron funciones con ese nombre')
      }
      
      return
    }
    
    console.log('📊 Funciones encontradas:', funciones)
    
  } catch (error) {
    console.log('❌ Error durante la investigación:', error.message)
  }
}

async function probarLlamadaFuncion() {
  try {
    console.log('\n🧪 PROBANDO LLAMADA A LA FUNCIÓN...')
    
    // Obtener un surtidor válido
    const { data: surtidor, error: surtidorError } = await supabase
      .from('surtidores')
      .select('id')
      .limit(1)
      .single()
    
    if (surtidorError) {
      console.log('❌ Error obteniendo surtidor:', surtidorError.message)
      return
    }
    
    console.log('📊 Surtidor de prueba:', surtidor)
    
    // Probar llamada a la función con diferentes tipos
    console.log('\n🔬 PROBANDO CON UUID (tipo correcto)...')
    try {
      const { data: resultado1, error: error1 } = await supabase
        .rpc('actualizar_stock_venta', {
          p_surtidor_id: surtidor.id, // UUID
          p_tipo_combustible: 'corriente',
          p_cantidad: 10
        })
      
      if (error1) {
        console.log('❌ Error con UUID:', error1.message)
        console.log('   Código:', error1.code)
        console.log('   Detalles:', error1.details)
        console.log('   Hint:', error1.hint)
      } else {
        console.log('✅ Función ejecutada correctamente con UUID')
        console.log('   Resultado:', resultado1)
      }
    } catch (err) {
      console.log('❌ Excepción con UUID:', err.message)
    }
    
    // Probar con BIGINT (tipo incorrecto)
    console.log('\n🔬 PROBANDO CON BIGINT (tipo incorrecto)...')
    try {
      const { data: resultado2, error: error2 } = await supabase
        .rpc('actualizar_stock_venta', {
          p_surtidor_id: 1, // BIGINT
          p_tipo_combustible: 'corriente',
          p_cantidad: 10
        })
      
      if (error2) {
        console.log('❌ Error con BIGINT:', error2.message)
        console.log('   Código:', error2.code)
        console.log('   Detalles:', error2.details)
        console.log('   Hint:', error2.hint)
      } else {
        console.log('✅ Función ejecutada correctamente con BIGINT')
        console.log('   Resultado:', resultado2)
      }
    } catch (err) {
      console.log('❌ Excepción con BIGINT:', err.message)
    }
    
  } catch (error) {
    console.log('❌ Error durante las pruebas:', error.message)
  }
}

async function buscarFuncionesEnCodigo() {
  try {
    console.log('\n🔍 BUSCANDO FUNCIONES EN EL CÓDIGO...')
    
    // Buscar archivos SQL que contengan la función
    const fs = require('fs')
    const path = require('path')
    
    const archivosSQL = [
      'database_schema_completo.sql',
      'base_datos_estacion_gasolina_optimizada.sql',
      'correccion_completa_sistema.sql'
    ]
    
    for (const archivo of archivosSQL) {
      try {
        if (fs.existsSync(archivo)) {
          const contenido = fs.readFileSync(archivo, 'utf8')
          const lineas = contenido.split('\n')
          
          let encontradas = 0
          lineas.forEach((linea, index) => {
            if (linea.toLowerCase().includes('actualizar_stock_venta')) {
              encontradas++
              console.log(`\n📄 ${archivo}:${index + 1}`)
              console.log(`   ${linea.trim()}`)
              
              // Mostrar contexto
              for (let i = Math.max(0, index - 2); i <= Math.min(lineas.length - 1, index + 2); i++) {
                if (i !== index) {
                  console.log(`   ${i + 1}: ${lineas[i].trim()}`)
                }
              }
            }
          })
          
          if (encontradas > 0) {
            console.log(`\n📊 Total encontradas en ${archivo}: ${encontradas}`)
          }
        }
      } catch (err) {
        console.log(`❌ Error leyendo ${archivo}:`, err.message)
      }
    }
    
  } catch (error) {
    console.log('❌ Error buscando en código:', error.message)
  }
}

async function main() {
  try {
    console.log('🔍 INICIANDO INVESTIGACIÓN DE FUNCIÓN DUPLICADA...')
    
    // Paso 1: Investigar función duplicada
    await investigarFuncionDuplicada()
    
    // Paso 2: Probar llamadas a la función
    await probarLlamadaFuncion()
    
    // Paso 3: Buscar en archivos SQL
    await buscarFuncionesEnCodigo()
    
    console.log('\n🎯 INVESTIGACIÓN COMPLETADA')
    console.log('📋 PRÓXIMO PASO: Corregir función duplicada')
    
  } catch (error) {
    console.log('❌ Error durante la investigación:', error.message)
  }
}

main()

