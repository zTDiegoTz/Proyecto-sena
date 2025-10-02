// ============================================================================
// PROBAR ACTUALIZACIÓN DE PRECIOS EN COMBUSTIBLES_SURTIDOR
// ============================================================================

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://adbzfiepkxtyqudwfysk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'
)

console.log('🧪 PROBANDO ACTUALIZACIÓN DIRECTA DE PRECIOS EN SURTIDORES...')

async function probarActualizacionSurtidores() {
  try {
    console.log('\n1️⃣ ESTADO ACTUAL DE COMBUSTIBLES_SURTIDOR:')
    
    const { data: estadoActual, error: errorActual } = await supabase
      .from('combustibles_surtidor')
      .select('surtidor_id, tipo_combustible, precio')
      .order('surtidor_id, tipo_combustible')
    
    if (errorActual) {
      console.log('❌ Error:', errorActual.message)
      return
    }
    
    console.log('📊 Precios actuales en combustibles_surtidor:')
    estadoActual.forEach(combustible => {
      console.log(`   Surtidor ${combustible.surtidor_id.slice(0, 8)}... - ${combustible.tipo_combustible}: $${combustible.precio}`)
    })
    
    console.log('\n2️⃣ PROBAR ACTUALIZACIÓN COMO LO HACE EL FRONTEND:')
    
    const nuevosPrecios = {
      extra: 16000,
      corriente: 15000,
      acpm: 14000
    }
    
    console.log('Precios a actualizar:', nuevosPrecios)
    
    // Simular la función surtidoresService.actualizarPrecios
    console.log('\n   Ejecutando actualizaciones...')
    const updates = []
    
    for (const [tipoCombustible, precio] of Object.entries(nuevosPrecios)) {
      console.log(`\n     🔄 Actualizando ${tipoCombustible} a $${precio}...`)
      
      const { data, error } = await supabase
        .from('combustibles_surtidor')
        .update({ precio })
        .eq('tipo_combustible', tipoCombustible)
        .select()
      
      if (error) {
        console.log(`     ❌ Error actualizando ${tipoCombustible}:`, error.message)
        console.log('     📋 Detalles:', error)
      } else {
        console.log(`     ✅ ${tipoCombustible} actualizado - ${data.length} registros afectados`)
        data.forEach(registro => {
          console.log(`       - Surtidor ${registro.surtidor_id.slice(0, 8)}...: $${registro.precio}`)
        })
        updates.push(data)
      }
    }
    
    console.log('\n3️⃣ VERIFICAR CAMBIOS:')
    
    const { data: estadoNuevo, error: errorNuevo } = await supabase
      .from('combustibles_surtidor')
      .select('surtidor_id, tipo_combustible, precio')
      .order('surtidor_id, tipo_combustible')
    
    if (errorNuevo) {
      console.log('❌ Error verificando:', errorNuevo.message)
      return
    }
    
    console.log('📊 Precios después de actualización:')
    estadoNuevo.forEach(combustible => {
      console.log(`   Surtidor ${combustible.surtidor_id.slice(0, 8)}... - ${combustible.tipo_combustible}: $${combustible.precio}`)
    })
    
    console.log('\n4️⃣ ANÁLISIS DE RESULTADOS:')
    
    let cambiosDetectados = 0
    Object.keys(nuevosPrecios).forEach(tipo => {
      const precioEsperado = nuevosPrecios[tipo]
      const registrosTipo = estadoNuevo.filter(c => c.tipo_combustible === tipo)
      
      const todosActualizados = registrosTipo.every(registro => registro.precio === precioEsperado)
      
      if (todosActualizados) {
        console.log(`   ✅ ${tipo}: Todos los surtidores actualizados correctamente a $${precioEsperado}`)
        cambiosDetectados++
      } else {
        console.log(`   ❌ ${tipo}: Algunos surtidores NO se actualizaron`)
        registrosTipo.forEach(registro => {
          const status = registro.precio === precioEsperado ? '✅' : '❌'
          console.log(`      ${status} Surtidor ${registro.surtidor_id.slice(0, 8)}...: $${registro.precio} (esperado: $${precioEsperado})`)
        })
      }
    })
    
    if (cambiosDetectados === Object.keys(nuevosPrecios).length) {
      console.log('\n🎉 ¡ACTUALIZACIÓN EXITOSA! Todos los precios se actualizaron correctamente')
    } else {
      console.log('\n⚠️  PROBLEMA: No todos los precios se actualizaron')
    }
    
    return { success: true, updates }
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
    console.log('📋 Stack:', error.stack)
    return { success: false, error: error.message }
  }
}

probarActualizacionSurtidores()
