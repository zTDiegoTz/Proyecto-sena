// ============================================================================
// PRUEBA DE VENTA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para probar que la funcionalidad de ventas funcione correctamente

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🧪 PROBANDO FUNCIONALIDAD DE VENTAS...')

// ============================================================================
// FUNCIÓN PARA PROBAR VENTA
// ============================================================================
async function probarVenta() {
  console.log('\n💰 PROBANDO CREACIÓN DE VENTA...')
  
  try {
    // Obtener datos necesarios
    const { data: surtidor, error: surtidorError } = await supabase
      .from('surtidores')
      .select('*')
      .eq('estado', 'disponible')
      .limit(1)
      .single()
    
    if (surtidorError) {
      console.log('❌ Error obteniendo surtidor:', surtidorError.message)
      return
    }
    
    const { data: bombero, error: bomberoError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'bombero')
      .eq('activo', true)
      .limit(1)
      .single()
    
    if (bomberoError) {
      console.log('❌ Error obteniendo bombero:', bomberoError.message)
      return
    }
    
    console.log(`⛽ Usando surtidor: ${surtidor.nombre}`)
    console.log(`👤 Usando bombero: ${bombero.name}`)
    
    // Datos de la venta de prueba
    const ventaData = {
      surtidor_id: surtidor.id,
      surtidor_nombre: surtidor.nombre,
      bombero_id: bombero.id,
      bombero_nombre: bombero.name,
      tipo_combustible: 'extra',
      cantidad: 10, // 10 litros
      cantidad_galones: 2.64, // 10 litros = 2.64 galones
      precio_por_galon: 12500,
      precio_unitario: 3300, // Precio por litro
      valor_total: 33000, // 10 litros * 3300 = 33000
      metodo_pago: 'efectivo',
      cliente_nombre: 'Cliente de Prueba',
      fecha_venta: new Date().toISOString()
    }
    
    console.log('\n📊 Datos de la venta:')
    console.log(`   - Tipo: ${ventaData.tipo_combustible}`)
    console.log(`   - Cantidad: ${ventaData.cantidad}L (${ventaData.cantidad_galones} gal)`)
    console.log(`   - Precio por galón: $${ventaData.precio_por_galon}`)
    console.log(`   - Precio por litro: $${ventaData.precio_unitario}`)
    console.log(`   - Total: $${ventaData.valor_total}`)
    console.log(`   - Método de pago: ${ventaData.metodo_pago}`)
    
    // Intentar crear la venta
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert([ventaData])
      .select()
      .single()
    
    if (ventaError) {
      console.log('\n❌ Error creando venta:', ventaError.message)
      console.log('Código de error:', ventaError.code)
      console.log('Detalles:', ventaError.details)
      console.log('Hint:', ventaError.hint)
    } else {
      console.log('\n✅ Venta creada exitosamente!')
      console.log(`   - ID: ${venta.id}`)
      console.log(`   - Fecha: ${new Date(venta.fecha_venta).toLocaleString('es-ES')}`)
      console.log(`   - Total: $${venta.valor_total}`)
    }
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
  }
}

// ============================================================================
// FUNCIÓN PARA VERIFICAR ESTRUCTURA DE VENTAS
// ============================================================================
async function verificarEstructuraVentas() {
  console.log('\n🔍 VERIFICANDO ESTRUCTURA DE LA TABLA VENTAS...')
  
  try {
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error:', error.message)
    } else if (ventas && ventas.length > 0) {
      console.log('✅ Estructura de la tabla ventas:')
      Object.keys(ventas[0]).forEach(key => {
        const valor = ventas[0][key]
        const tipo = typeof valor
        console.log(`   - ${key}: ${tipo} (${valor})`)
      })
    } else {
      console.log('⚠️  No hay ventas para verificar la estructura')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
async function main() {
  try {
    console.log('🧪 INICIANDO PRUEBA DE FUNCIONALIDAD DE VENTAS...')
    
    // Paso 1: Verificar estructura
    await verificarEstructuraVentas()
    
    // Paso 2: Probar venta
    await probarVenta()
    
    console.log('\n🎉 PRUEBA COMPLETADA 🎉')
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error)
  }
}

// Ejecutar la prueba
main()

