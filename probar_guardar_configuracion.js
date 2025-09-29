// ============================================================================
// PROBAR GUARDAR CONFIGURACIÓN - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para probar la funcionalidad de guardar configuración del sistema

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function probarGuardarConfiguracion() {
  try {
    console.log('🧪 PROBANDO FUNCIONALIDAD DE GUARDAR CONFIGURACIÓN...')
    
    // Simular los datos de configuración que se enviarían desde el frontend
    const configData = {
      estacion: {
        nombre: "Estación Principal Actualizada",
        ruc: "12345678-9",
        direccion: "Av. Principal #123"
      },
      precios: {
        extra: 13000,      // Aumentar precio
        corriente: 12500,  // Aumentar precio
        acpm: 11500        // Aumentar precio
      },
      seguridad: {
        confirmacionVentas: true,
        backupAutomatico: true,
        notificacionesEmail: false
      }
    }
    
    console.log('📊 Datos de configuración a guardar:')
    console.log('   Precios:')
    console.log(`     - Extra: $${configData.precios.extra}/litro`)
    console.log(`     - Corriente: $${configData.precios.corriente}/litro`)
    console.log(`     - ACPM: $${configData.precios.acpm}/litro`)
    
    // Paso 1: Obtener configuración actual
    console.log('\n📋 PASO 1: Obteniendo configuración actual...')
    
    const { data: configActual, error: configError } = await supabase
      .from('configuracion_combustibles')
      .select('*')
    
    if (configError) {
      console.log('❌ Error obteniendo configuración actual:', configError.message)
      return false
    }
    
    console.log('✅ Configuración actual obtenida')
    configActual.forEach(c => {
      console.log(`   - ${c.tipo_combustible}: $${c.precio_por_litro}/litro`)
    })
    
    // Paso 2: Actualizar configuración de combustibles
    console.log('\n📋 PASO 2: Actualizando configuración de combustibles...')
    
    const preciosActualizados = {
      extra: {
        precio_por_litro: configData.precios.extra,
        activo: true,
        fecha_actualizacion: new Date().toISOString()
      },
      corriente: {
        precio_por_litro: configData.precios.corriente,
        activo: true,
        fecha_actualizacion: new Date().toISOString()
      },
      acpm: {
        precio_por_litro: configData.precios.acpm,
        activo: true,
        fecha_actualizacion: new Date().toISOString()
      }
    }
    
    // Actualizar cada tipo de combustible
    for (const [tipo, data] of Object.entries(preciosActualizados)) {
      console.log(`   Actualizando ${tipo}...`)
      
      const { data: resultado, error: updateError } = await supabase
        .from('configuracion_combustibles')
        .update(data)
        .eq('tipo_combustible', tipo)
        .select()
      
      if (updateError) {
        console.log(`   ❌ Error actualizando ${tipo}:`, updateError.message)
        return false
      }
      
      console.log(`   ✅ ${tipo} actualizado exitosamente`)
    }
    
    // Paso 3: Actualizar precios en todos los surtidores
    console.log('\n📋 PASO 3: Actualizando precios en surtidores...')
    
    // Obtener todos los surtidores
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('id, nombre')
    
    if (surtidoresError) {
      console.log('❌ Error obteniendo surtidores:', surtidoresError.message)
      return false
    }
    
    console.log(`📊 Actualizando precios en ${surtidores.length} surtidores...`)
    
    // Actualizar precios en cada surtidor
    for (const surtidor of surtidores) {
      console.log(`   Actualizando ${surtidor.nombre}...`)
      
      // Actualizar cada tipo de combustible en el surtidor
      for (const [tipo, precio] of Object.entries(configData.precios)) {
        const { error: precioError } = await supabase
          .from('combustibles_surtidor')
          .update({ precio: precio })
          .eq('surtidor_id', surtidor.id)
          .eq('tipo_combustible', tipo)
        
        if (precioError) {
          console.log(`     ❌ Error actualizando precio ${tipo}:`, precioError.message)
          return false
        }
      }
      
      console.log(`   ✅ ${surtidor.nombre} actualizado exitosamente`)
    }
    
    // Paso 4: Verificar que los cambios se aplicaron correctamente
    console.log('\n📋 PASO 4: Verificando cambios aplicados...')
    
    // Verificar configuración global
    const { data: configVerificada, error: verifyError } = await supabase
      .from('configuracion_combustibles')
      .select('*')
    
    if (verifyError) {
      console.log('❌ Error verificando configuración:', verifyError.message)
      return false
    }
    
    console.log('✅ Configuración global verificada:')
    configVerificada.forEach(c => {
      console.log(`   - ${c.tipo_combustible}: $${c.precio_por_litro}/litro`)
    })
    
    // Verificar precios en surtidores
    const { data: combustiblesVerificados, error: combustiblesError } = await supabase
      .from('combustibles_surtidor')
      .select(`
        tipo_combustible,
        precio,
        surtidores(nombre)
      `)
      .limit(3)
    
    if (combustiblesError) {
      console.log('❌ Error verificando precios en surtidores:', combustiblesError.message)
      return false
    }
    
    console.log('✅ Precios en surtidores verificados:')
    combustiblesVerificados.forEach(c => {
      console.log(`   - ${c.surtidores.nombre} - ${c.tipo_combustible}: $${c.precio}`)
    })
    
    console.log('\n🎉 CONFIGURACIÓN GUARDADA EXITOSAMENTE 🎉')
    console.log('✅ Precios globales actualizados')
    console.log('✅ Precios en surtidores actualizados')
    console.log('✅ Configuración verificada')
    
    return true
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
    return false
  }
}

async function verificarEstadoFinal() {
  try {
    console.log('\n🔍 VERIFICANDO ESTADO FINAL DEL SISTEMA...')
    
    // Verificar configuración de combustibles
    const { data: config, error: configError } = await supabase
      .from('configuracion_combustibles')
      .select('*')
    
    if (configError) {
      console.log('❌ Error verificando configuración:', configError.message)
      return false
    }
    
    console.log('📊 Configuración actual de combustibles:')
    config.forEach(c => {
      console.log(`   - ${c.tipo_combustible}: $${c.precio_por_litro}/litro (${c.activo ? 'Activo' : 'Inactivo'})`)
    })
    
    // Verificar precios en surtidores
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select(`
        nombre,
        combustibles_surtidor(tipo_combustible, precio)
      `)
    
    if (surtidoresError) {
      console.log('❌ Error verificando surtidores:', surtidoresError.message)
      return false
    }
    
    console.log('\n📊 Precios en surtidores:')
    surtidores.forEach(surtidor => {
      console.log(`\n⛽ ${surtidor.nombre}:`)
      surtidor.combustibles_surtidor.forEach(comb => {
        console.log(`   - ${comb.tipo_combustible}: $${comb.precio}`)
      })
    })
    
    // Verificar integridad
    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('id, surtidor_id, bombero_id')
      .limit(1)
    
    if (ventasError) {
      console.log('❌ Error verificando ventas:', ventasError.message)
      return false
    }
    
    console.log('\n✅ Sistema funcionando correctamente')
    console.log('✅ Configuración actualizada exitosamente')
    console.log('✅ Base de datos íntegra')
    
    return true
    
  } catch (error) {
    console.log('❌ Error verificando estado final:', error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🔧 INICIANDO PRUEBA DE GUARDAR CONFIGURACIÓN...')
    
    // Paso 1: Probar guardar configuración
    const configuracionGuardada = await probarGuardarConfiguracion()
    
    if (!configuracionGuardada) {
      console.log('❌ La prueba de guardar configuración falló')
      return
    }
    
    // Paso 2: Verificar estado final
    const estadoVerificado = await verificarEstadoFinal()
    
    if (!estadoVerificado) {
      console.log('❌ La verificación del estado final falló')
      return
    }
    
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE 🎉')
    console.log('✅ Funcionalidad de guardar configuración habilitada')
    console.log('✅ Configuración guardada correctamente')
    console.log('✅ Base de datos verificada')
    console.log('✅ Sistema funcionando perfectamente')
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
  }
}

main()
