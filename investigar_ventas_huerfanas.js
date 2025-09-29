// ============================================================================
// INVESTIGAR VENTAS HUÉRFANAS - ESTACIÓN DE GASOLINA
// ============================================================================

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function investigarVentasHuerfanas() {
  try {
    console.log('🔍 INVESTIGANDO VENTAS HUÉRFANAS...')
    
    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('id, bombero_id, bombero_nombre, fecha_venta')
    
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('id, name, username')
    
    if (ventasError || usuariosError) {
      console.log('❌ Error:', ventasError?.message || usuariosError?.message)
      return
    }
    
    console.log('\n=== ANÁLISIS DETALLADO ===')
    console.log(`📊 Ventas totales: ${ventas.length}`)
    console.log(`📊 Usuarios totales: ${usuarios.length}`)
    
    console.log('\n=== VENTAS ===')
    ventas.forEach((v, i) => {
      console.log(`${i+1}. ID: ${v.id}`)
      console.log(`   Bombero ID: ${v.bombero_id}`)
      console.log(`   Bombero Nombre: ${v.bombero_nombre}`)
      console.log(`   Fecha: ${new Date(v.fecha_venta).toLocaleDateString('es-ES')}`)
      console.log('')
    })
    
    console.log('\n=== USUARIOS ===')
    usuarios.forEach((u, i) => {
      console.log(`${i+1}. ID: ${u.id}`)
      console.log(`   Nombre: ${u.name}`)
      console.log(`   Username: ${u.username}`)
      console.log('')
    })
    
    console.log('\n=== VERIFICACIÓN DE INTEGRIDAD ===')
    const idsUsuariosValidos = usuarios.map(u => u.id)
    const ventasHuerfanas = []
    
    ventas.forEach((v, i) => {
      const existe = idsUsuariosValidos.includes(v.bombero_id)
      console.log(`Venta ${i+1}: ${existe ? '✅' : '❌'} Usuario ${existe ? 'existe' : 'NO EXISTE'}`)
      if (!existe) {
        console.log(`   ⚠️  Bombero ID huérfano: ${v.bombero_id}`)
        console.log(`   ⚠️  Bombero Nombre: ${v.bombero_nombre}`)
        ventasHuerfanas.push(v)
      }
    })
    
    if (ventasHuerfanas.length > 0) {
      console.log(`\n🗑️  ELIMINANDO ${ventasHuerfanas.length} VENTAS HUÉRFANAS...`)
      
      for (const venta of ventasHuerfanas) {
        const { error: deleteError } = await supabase
          .from('ventas')
          .delete()
          .eq('id', venta.id)
        
        if (deleteError) {
          console.log(`❌ Error eliminando venta ${venta.id}: ${deleteError.message}`)
        } else {
          console.log(`✅ Venta eliminada: ${venta.id} (${venta.bombero_nombre})`)
        }
      }
      
      console.log('\n✅ LIMPIEZA COMPLETADA')
    } else {
      console.log('\n✅ NO HAY VENTAS HUÉRFANAS')
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

investigarVentasHuerfanas()

