// ============================================================================
// DEBUG - INVESTIGAR PROBLEMA DE GUARDADO DE PRECIOS
// ============================================================================

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://adbzfiepkxtyqudwfysk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'
)

console.log('🔍 DEBUG: INVESTIGANDO PROBLEMA DE GUARDADO DE PRECIOS...')

async function debugGuardarPrecios() {
  try {
    console.log('\n1️⃣ VERIFICAR ESTADO ACTUAL DE CONFIGURACION_COMBUSTIBLES:')
    
    const { data: configuracionActual, error: errorActual } = await supabase
      .from('configuracion_combustibles')
      .select('*')
      .order('tipo_combustible')
    
    if (errorActual) {
      console.log('❌ Error obteniendo configuración actual:', errorActual.message)
      return
    }
    
    console.log('✅ Configuración actual:')
    configuracionActual.forEach(config => {
      console.log(`   ${config.tipo_combustible}: $${config.precio_por_litro}`)
    })
    
    console.log('\n2️⃣ SIMULAR ACTUALIZACIÓN DE PRECIOS:')
    
    const nuevosPrecios = {
      extra: 15000,
      corriente: 14000,  
      acpm: 13000
    }
    
    console.log('Precios a actualizar:', nuevosPrecios)
    
    // Actualizar cada precio
    for (const [tipo, precio] of Object.entries(nuevosPrecios)) {
      console.log(`\n   Actualizando ${tipo} a $${precio}...`)
      
      const { data, error } = await supabase
        .from('configuracion_combustibles')
        .update({ 
          precio_por_litro: precio,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('tipo_combustible', tipo)
        .select()
      
      if (error) {
        console.log(`   ❌ Error actualizando ${tipo}:`, error.message)
        console.log('   📋 Detalles del error:', error)
      } else {
        console.log(`   ✅ ${tipo} actualizado exitosamente`)
        if (data && data.length > 0) {
          console.log(`   📊 Nuevo valor: $${data[0].precio_por_litro}`)
        }
      }
    }
    
    console.log('\n3️⃣ VERIFICAR CAMBIOS APLICADOS:')
    
    const { data: configuracionNueva, error: errorNueva } = await supabase
      .from('configuracion_combustibles')
      .select('*')
      .order('tipo_combustible')
    
    if (errorNueva) {
      console.log('❌ Error verificando cambios:', errorNueva.message)
      return
    }
    
    console.log('✅ Configuración después de actualizar:')
    configuracionNueva.forEach(config => {
      console.log(`   ${config.tipo_combustible}: $${config.precio_por_litro}`)
    })
    
    console.log('\n4️⃣ VERIFICAR TAMBIÉN COMBUSTIBLES_SURTIDOR:')
    
    const { data: combustiblesSurtidor, error: errorSurtidor } = await supabase
      .from('combustibles_surtidor')
      .select('surtidor_id, tipo_combustible, precio')
      .order('surtidor_id, tipo_combustible')
    
    if (errorSurtidor) {
      console.log('❌ Error obteniendo combustibles por surtidor:', errorSurtidor.message)
    } else {
      console.log('📊 Precios en combustibles_surtidor:')
      combustiblesSurtidor.forEach(combustible => {
        console.log(`   Surtidor ${combustible.surtidor_id} - ${combustible.tipo_combustible}: $${combustible.precio}`)
      })
    }
    
    console.log('\n5️⃣ DIAGNÓSTICO:')
    
    // Comparar configuracion_combustibles vs combustibles_surtidor
    const preciosConfig = configuracionNueva.reduce((acc, config) => {
      acc[config.tipo_combustible] = config.precio_por_litro
      return acc
    }, {})
    
    const preciosSurtidor = {}
    combustiblesSurtidor.forEach(combustible => {
      if (!preciosSurtidor[combustible.tipo_combustible]) {
        preciosSurtidor[combustible.tipo_combustible] = []
      }
      preciosSurtidor[combustible.tipo_combustible].push(combustible.precio)
    })
    
    console.log('🔍 Comparación de precios:')
    Object.keys(preciosConfig).forEach(tipo => {
      const precioConfig = preciosConfig[tipo]
      const preciosSurt = preciosSurtidor[tipo] || []
      const preciosUnicos = [...new Set(preciosSurt)]
      
      console.log(`   ${tipo}:`)
      console.log(`     - Configuración: $${precioConfig}`)
      console.log(`     - Surtidores: ${preciosUnicos.map(p => '$' + p).join(', ')}`)
      
      if (preciosUnicos.length > 1) {
        console.log(`     ⚠️  INCONSISTENCIA: Diferentes precios en surtidores`)
      } else if (preciosUnicos.length === 1 && preciosUnicos[0] !== precioConfig) {
        console.log(`     ⚠️  DESINCRONIZACIÓN: Precio config vs surtidor`)
      } else {
        console.log(`     ✅ SINCRONIZADO`)
      }
    })
    
  } catch (error) {
    console.log('❌ Error durante el debug:', error.message)
    console.log('📋 Stack trace:', error.stack)
  }
}

debugGuardarPrecios()
