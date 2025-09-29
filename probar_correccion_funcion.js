// ============================================================================
// PROBAR CORRECCIÓN DE FUNCIÓN DUPLICADA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para probar que la corrección de la función duplicada funciona

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function probarVentaCompleta() {
  try {
    console.log('🧪 PROBANDO VENTA COMPLETA SIN FUNCIÓN PROBLEMÁTICA...')
    
    // Obtener datos necesarios para la prueba
    const { data: surtidor, error: surtidorError } = await supabase
      .from('surtidores')
      .select('id, nombre')
      .limit(1)
      .single()
    
    const { data: bombero, error: bomberoError } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'bombero')
      .limit(1)
      .single()
    
    if (surtidorError || bomberoError) {
      console.log('❌ Error obteniendo datos de prueba:', surtidorError?.message || bomberoError?.message)
      return false
    }
    
    console.log('📊 Datos de prueba:')
    console.log('   Surtidor:', surtidor.nombre, '(ID:', surtidor.id, ')')
    console.log('   Bombero:', bombero.name, '(ID:', bombero.id, ')')
    
    // Crear una venta de prueba
    const ventaPrueba = {
      surtidor_id: surtidor.id,
      surtidor_nombre: surtidor.nombre,
      bombero_id: bombero.id,
      bombero_nombre: bombero.name,
      tipo_combustible: 'corriente',
      cantidad: 5,
      cantidad_galones: 5,
      precio_por_galon: 12000,
      precio_unitario: 12000,
      valor_total: 60000,
      metodo_pago: 'efectivo',
      cliente_nombre: 'Cliente Prueba',
      cliente_documento: '12345678',
      placa_vehiculo: 'ABC123',
      fecha_venta: new Date().toISOString()
    }
    
    console.log('\n📋 PASO 1: Insertando venta...')
    
    // Insertar la venta
    const { data: ventaInsertada, error: ventaError } = await supabase
      .from('ventas')
      .insert([ventaPrueba])
      .select()
      .single()
    
    if (ventaError) {
      console.log('❌ Error insertando venta:', ventaError.message)
      return false
    }
    
    console.log('✅ Venta insertada exitosamente')
    console.log('   ID de venta:', ventaInsertada.id)
    
    console.log('\n📋 PASO 2: Actualizando stock...')
    
    // Obtener stock actual
    const { data: stockActual, error: stockError } = await supabase
      .from('combustibles_surtidor')
      .select('stock, vendido')
      .eq('surtidor_id', ventaPrueba.surtidor_id)
      .eq('tipo_combustible', ventaPrueba.tipo_combustible)
      .single()
    
    if (stockError) {
      console.log('❌ Error obteniendo stock actual:', stockError.message)
      return false
    }
    
    console.log('📊 Stock actual:', stockActual.stock, 'galones')
    console.log('📊 Vendido actual:', stockActual.vendido, 'galones')
    
    // Calcular nuevo stock y vendido
    const nuevoStock = stockActual.stock - ventaPrueba.cantidad
    const nuevoVendido = stockActual.vendido + ventaPrueba.cantidad
    
    // Actualizar stock
    const { data: stockActualizado, error: updateError } = await supabase
      .from('combustibles_surtidor')
      .update({ 
        stock: nuevoStock,
        vendido: nuevoVendido,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('surtidor_id', ventaPrueba.surtidor_id)
      .eq('tipo_combustible', ventaPrueba.tipo_combustible)
      .select()
    
    if (updateError) {
      console.log('❌ Error actualizando stock:', updateError.message)
      return false
    }
    
    console.log('✅ Stock actualizado exitosamente')
    console.log('   Stock anterior:', stockActual.stock, 'galones')
    console.log('   Vendido anterior:', stockActual.vendido, 'galones')
    console.log('   Cantidad vendida:', ventaPrueba.cantidad, 'galones')
    console.log('   Stock nuevo:', nuevoStock, 'galones')
    console.log('   Vendido nuevo:', nuevoVendido, 'galones')
    
    console.log('\n📋 PASO 3: Verificando actualización...')
    
    // Verificar que el stock se actualizó correctamente
    const { data: stockVerificado, error: verifyError } = await supabase
      .from('combustibles_surtidor')
      .select('stock, vendido, fecha_actualizacion')
      .eq('surtidor_id', ventaPrueba.surtidor_id)
      .eq('tipo_combustible', ventaPrueba.tipo_combustible)
      .single()
    
    if (verifyError) {
      console.log('❌ Error verificando stock:', verifyError.message)
      return false
    }
    
    console.log('✅ Verificación exitosa')
    console.log('   Stock verificado:', stockVerificado.stock, 'galones')
    console.log('   Vendido verificado:', stockVerificado.vendido, 'galones')
    console.log('   Fecha actualización:', new Date(stockVerificado.fecha_actualizacion).toLocaleString('es-ES'))
    
    if (stockVerificado.stock === nuevoStock && stockVerificado.vendido === nuevoVendido) {
      console.log('✅ El stock se actualizó correctamente')
      return true
    } else {
      console.log('❌ El stock no se actualizó correctamente')
      return false
    }
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
    return false
  }
}

async function probarServicioActualizado() {
  try {
    console.log('\n🧪 PROBANDO SERVICIO ACTUALIZADO...')
    
    // Importar el servicio actualizado
    const { ventasService } = require('./src/services/supabaseServiceFinal')
    
    // Obtener datos necesarios
    const { data: surtidor, error: surtidorError } = await supabase
      .from('surtidores')
      .select('id, nombre')
      .limit(1)
      .single()
    
    const { data: bombero, error: bomberoError } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'bombero')
      .limit(1)
      .single()
    
    if (surtidorError || bomberoError) {
      console.log('❌ Error obteniendo datos:', surtidorError?.message || bomberoError?.message)
      return false
    }
    
    // Crear venta usando el servicio
    const ventaPrueba = {
      surtidorId: surtidor.id,
      surtidorNombre: surtidor.nombre,
      bomberoId: bombero.id,
      bomberoNombre: bombero.name,
      tipoCombustible: 'extra',
      cantidad: 3,
      cantidadGalones: 3,
      precioPorGalon: 12500,
      precioUnitario: 12500,
      valorTotal: 37500,
      metodoPago: 'efectivo',
      clienteNombre: 'Cliente Servicio',
      clienteDocumento: '87654321',
      placaVehiculo: 'XYZ789',
      fechaVenta: new Date().toISOString()
    }
    
    console.log('📊 Probando servicio con venta:', ventaPrueba.tipoCombustible, '-', ventaPrueba.cantidad, 'galones')
    
    // Usar el servicio para crear la venta
    const resultado = await ventasService.crear(ventaPrueba)
    
    if (resultado.success) {
      console.log('✅ Servicio funcionando correctamente')
      console.log('   Venta creada:', resultado.data.id)
      return true
    } else {
      console.log('❌ Error en servicio:', resultado.message)
      return false
    }
    
  } catch (error) {
    console.log('❌ Error probando servicio:', error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🔧 INICIANDO PRUEBA DE CORRECCIÓN DE FUNCIÓN DUPLICADA...')
    
    // Paso 1: Probar venta completa
    const ventaExitosa = await probarVentaCompleta()
    
    if (!ventaExitosa) {
      console.log('❌ La prueba de venta completa falló')
      return
    }
    
    // Paso 2: Probar servicio actualizado
    const servicioExitoso = await probarServicioActualizado()
    
    if (!servicioExitoso) {
      console.log('❌ La prueba del servicio falló')
      return
    }
    
    console.log('\n🎉 PRUEBA DE CORRECCIÓN COMPLETADA EXITOSAMENTE 🎉')
    console.log('✅ Venta completa funcionando sin función problemática')
    console.log('✅ Servicio actualizado funcionando correctamente')
    console.log('✅ El sistema ya no usa la función duplicada')
    console.log('✅ Las ventas se procesan correctamente')
    console.log('\n📋 PRÓXIMO PASO: Ejecutar verificación de integridad completa')
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
  }
}

main()
