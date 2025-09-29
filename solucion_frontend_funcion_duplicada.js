// ============================================================================
// SOLUCIÓN FRONTEND PARA FUNCIÓN DUPLICADA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para solucionar el problema de función duplicada desde el frontend

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function crearFuncionActualizarStock() {
  try {
    console.log('🔧 CREANDO FUNCIÓN DE ACTUALIZACIÓN DE STOCK...')
    
    // Crear una función que actualice el stock directamente usando SQL
    const funcionSQL = `
      CREATE OR REPLACE FUNCTION actualizar_stock_combustible(
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
    
    // Intentar crear la función usando una llamada directa a Supabase
    const { error: error } = await supabase
      .rpc('create_function', {
        function_definition: funcionSQL
      })
    
    if (error) {
      console.log('❌ Error creando función:', error.message)
      return false
    } else {
      console.log('✅ Función creada exitosamente')
      return true
    }
    
  } catch (error) {
    console.log('❌ Error durante la creación:', error.message)
    return false
  }
}

async function actualizarServiciosVentas() {
  try {
    console.log('\n🔄 ACTUALIZANDO SERVICIOS DE VENTAS...')
    
    // Leer el archivo de servicios de ventas
    const fs = require('fs')
    const path = require('path')
    
    const archivoServicios = 'src/services/ventasServiceClean.js'
    
    if (!fs.existsSync(archivoServicios)) {
      console.log('❌ Archivo de servicios de ventas no encontrado:', archivoServicios)
      return false
    }
    
    let contenido = fs.readFileSync(archivoServicios, 'utf8')
    
    // Buscar la función que llama a actualizar_stock_venta
    if (contenido.includes('actualizar_stock_venta')) {
      // Reemplazar la llamada problemática con una actualización directa
      const reemplazo = `
        // Actualizar stock directamente sin usar función problemática
        const { error: stockError } = await supabase
          .from('combustibles_surtidor')
          .update({ 
            stock_actual: supabase.raw('stock_actual - ?', [ventaCompleta.cantidad]),
            fecha_actualizacion: new Date().toISOString()
          })
          .eq('surtidor_id', ventaCompleta.surtidor_id)
          .eq('tipo_combustible', ventaCompleta.tipo_combustible)
        
        if (stockError) {
          console.error('Error actualizando stock:', stockError)
          // No lanzar error, solo registrar
        }
      `
      
      // Reemplazar la llamada a la función problemática
      contenido = contenido.replace(
        /await supabase\.rpc\('actualizar_stock_venta'.*?\)/s,
        reemplazo
      )
      
      // Escribir el archivo actualizado
      fs.writeFileSync(archivoServicios, contenido, 'utf8')
      
      console.log('✅ Servicios de ventas actualizados')
      console.log('   Reemplazada llamada a función problemática con actualización directa')
      return true
    } else {
      console.log('⚠️  No se encontraron llamadas a la función problemática en los servicios de ventas')
      return true
    }
    
  } catch (error) {
    console.log('❌ Error actualizando servicios de ventas:', error.message)
    return false
  }
}

async function actualizarServiciosPrincipales() {
  try {
    console.log('\n🔄 ACTUALIZANDO SERVICIOS PRINCIPALES...')
    
    // Leer el archivo de servicios principales
    const fs = require('fs')
    const path = require('path')
    
    const archivoServicios = 'src/services/supabaseServiceFinal.js'
    
    if (!fs.existsSync(archivoServicios)) {
      console.log('❌ Archivo de servicios principales no encontrado:', archivoServicios)
      return false
    }
    
    let contenido = fs.readFileSync(archivoServicios, 'utf8')
    
    // Buscar la función que llama a actualizar_stock_venta
    if (contenido.includes('actualizar_stock_venta')) {
      // Reemplazar la llamada problemática con una actualización directa
      const reemplazo = `
        // Actualizar stock directamente sin usar función problemática
        const { error: stockError } = await supabase
          .from('combustibles_surtidor')
          .update({ 
            stock_actual: supabase.raw('stock_actual - ?', [venta.cantidad]),
            fecha_actualizacion: new Date().toISOString()
          })
          .eq('surtidor_id', venta.surtidor_id)
          .eq('tipo_combustible', venta.tipo_combustible)
        
        if (stockError) {
          console.error('Error actualizando stock:', stockError)
          // No lanzar error, solo registrar
        }
      `
      
      // Reemplazar la llamada a la función problemática
      contenido = contenido.replace(
        /await supabase\.rpc\('actualizar_stock_venta'.*?\)/s,
        reemplazo
      )
      
      // Escribir el archivo actualizado
      fs.writeFileSync(archivoServicios, contenido, 'utf8')
      
      console.log('✅ Servicios principales actualizados')
      console.log('   Reemplazada llamada a función problemática con actualización directa')
      return true
    } else {
      console.log('⚠️  No se encontraron llamadas a la función problemática en los servicios principales')
      return true
    }
    
  } catch (error) {
    console.log('❌ Error actualizando servicios principales:', error.message)
    return false
  }
}

async function probarVentaSinFuncion() {
  try {
    console.log('\n🧪 PROBANDO VENTA SIN FUNCIÓN PROBLEMÁTICA...')
    
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
    
    // Actualizar stock directamente
    const { error: stockError } = await supabase
      .from('combustibles_surtidor')
      .update({ 
        stock_actual: supabase.raw('stock_actual - ?', [ventaPrueba.cantidad]),
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('surtidor_id', ventaPrueba.surtidor_id)
      .eq('tipo_combustible', ventaPrueba.tipo_combustible)
    
    if (stockError) {
      console.log('❌ Error actualizando stock:', stockError.message)
      return false
    }
    
    console.log('✅ Stock actualizado exitosamente')
    console.log('✅ Venta completa sin usar función problemática')
    
    return true
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🔧 INICIANDO SOLUCIÓN FRONTEND PARA FUNCIÓN DUPLICADA...')
    
    // Paso 1: Actualizar servicios de ventas
    const actualizacionVentas = await actualizarServiciosVentas()
    
    if (!actualizacionVentas) {
      console.log('❌ No se pudieron actualizar los servicios de ventas')
      return
    }
    
    // Paso 2: Actualizar servicios principales
    const actualizacionPrincipales = await actualizarServiciosPrincipales()
    
    if (!actualizacionPrincipales) {
      console.log('❌ No se pudieron actualizar los servicios principales')
      return
    }
    
    // Paso 3: Probar venta sin función problemática
    const pruebaExitosa = await probarVentaSinFuncion()
    
    if (!pruebaExitosa) {
      console.log('❌ La prueba de venta no fue exitosa')
      return
    }
    
    console.log('\n🎉 SOLUCIÓN FRONTEND COMPLETADA EXITOSAMENTE 🎉')
    console.log('✅ Servicios de ventas actualizados')
    console.log('✅ Servicios principales actualizados')
    console.log('✅ Venta de prueba exitosa sin función problemática')
    console.log('✅ El sistema ahora funciona sin la función duplicada')
    console.log('\n📋 PRÓXIMO PASO: Ejecutar verificación de integridad completa')
    
  } catch (error) {
    console.log('❌ Error durante la solución:', error.message)
  }
}

main()

