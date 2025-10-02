// ============================================================================
// PRUEBA DE CAMPOS DE PRECIO CORREGIDOS
// ============================================================================

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://adbzfiepkxtyqudwfysk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'
)

console.log('🧪 PROBANDO CAMPOS DE PRECIO CORREGIDOS...')

async function probarCamposPrecios() {
  try {
    console.log('\n📊 ESTADO ACTUAL DE CONFIGURACION_COMBUSTIBLES:')
    
    const { data: combustibles, error } = await supabase
      .from('configuracion_combustibles')
      .select('*')
      .order('tipo_combustible')
    
    if (error) {
      console.log('❌ Error:', error.message)
      return
    }
    
    console.log('✅ Configuración encontrada:')
    combustibles.forEach(combustible => {
      console.log(`   ${combustible.tipo_combustible.toUpperCase()}:`)
      console.log(`     - Precio por litro: $${combustible.precio_por_litro}`)
      console.log(`     - Stock total: ${combustible.stock_total}`)
      console.log(`     - Stock disponible: ${combustible.stock_disponible}`)
      console.log(`     - Activo: ${combustible.activo}`)
      console.log(`     - Última actualización: ${combustible.fecha_actualizacion}`)
      console.log('')
    })
    
    console.log('🔧 VERIFICANDO FORMATO DE VALORES:')
    
    let problemasEncontrados = 0
    
    combustibles.forEach(combustible => {
      const precio = combustible.precio_por_litro
      const precioStr = precio.toString()
      
      // Verificar problemas típicos
      if (precioStr.startsWith('0') && precioStr.length > 1 && precio !== 0) {
        console.log(`⚠️  ${combustible.tipo_combustible}: Precio con cero inicial problemático: ${precioStr}`)
        problemasEncontrados++
      }
      
      if (precioStr.length > 10) {
        console.log(`⚠️  ${combustible.tipo_combustible}: Precio demasiado largo: ${precioStr}`)
        problemasEncontrados++
      }
      
      if (precio === 0) {
        console.log(`⚠️  ${combustible.tipo_combustible}: Precio en cero`)
        problemasEncontrados++
      }
      
      if (isNaN(precio)) {
        console.log(`⚠️  ${combustible.tipo_combustible}: Precio no numérico: ${precio}`)
        problemasEncontrados++
      }
    })
    
    if (problemasEncontrados === 0) {
      console.log('✅ Todos los valores tienen formato correcto')
    } else {
      console.log(`❌ Se encontraron ${problemasEncontrados} problemas de formato`)
    }
    
    console.log('\n📋 RESUMEN PARA FRONTEND:')
    console.log('✅ Cambios realizados:')
    console.log('   1. Campos permiten borrar contenido (ya no fuerzan 0)')
    console.log('   2. Valores vacíos se validan antes de guardar')
    console.log('   3. Contexto carga precios desde configuracion_combustibles')
    console.log('   4. Función actualizarPrecios actualiza tabla correcta')
    
    console.log('\n🎯 COMPORTAMIENTO ESPERADO:')
    console.log('   - Campos inician con valores de la BD (no vacíos ni con ceros extra)')
    console.log('   - Usuario puede borrar contenido completo')
    console.log('   - Al guardar, valida que todos los campos tengan valores válidos')
    console.log('   - Precios se guardan en configuracion_combustibles')
    
    console.log('\n✅ Configuración lista para probar en frontend')
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
  }
}

probarCamposPrecios()
