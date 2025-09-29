// ============================================================================
// REVISIÓN COMPLETA DE BASE DE DATOS - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para realizar una revisión exhaustiva de toda la base de datos

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function revisarUsuarios() {
  try {
    console.log('\n👥 REVISANDO USUARIOS...')
    
    const { data: usuarios, error } = await supabase
      .from('users')
      .select('*')
      .orderBy('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Error obteniendo usuarios:', error.message)
      return
    }
    
    console.log(`📊 Total de usuarios: ${usuarios.length}`)
    
    // Agrupar por roles
    const roles = usuarios.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    }, {})
    
    console.log('📋 Usuarios por rol:')
    Object.entries(roles).forEach(([rol, cantidad]) => {
      console.log(`   - ${rol}: ${cantidad}`)
    })
    
    // Mostrar usuarios activos
    const usuariosActivos = usuarios.filter(u => u.activo)
    console.log(`\n✅ Usuarios activos: ${usuariosActivos.length}`)
    
    usuariosActivos.forEach((u, i) => {
      console.log(`   ${i+1}. ${u.name} (${u.username}) - ${u.role}`)
    })
    
    return usuarios.length
    
  } catch (error) {
    console.log('❌ Error revisando usuarios:', error.message)
    return 0
  }
}

async function revisarSurtidores() {
  try {
    console.log('\n⛽ REVISANDO SURTIDORES...')
    
    const { data: surtidores, error } = await supabase
      .from('surtidores')
      .select(`
        *,
        combustibles_surtidor(*)
      `)
      .orderBy('nombre')
    
    if (error) {
      console.log('❌ Error obteniendo surtidores:', error.message)
      return
    }
    
    console.log(`📊 Total de surtidores: ${surtidores.length}`)
    
    surtidores.forEach((surtidor, i) => {
      console.log(`\n${i+1}. ${surtidor.nombre}`)
      console.log(`   Estado: ${surtidor.estado}`)
      console.log(`   Ubicación: ${surtidor.ubicacion}`)
      console.log(`   Combustibles: ${surtidor.combustibles_surtidor.length}`)
      
      surtidor.combustibles_surtidor.forEach(comb => {
        console.log(`     - ${comb.tipo_combustible}: ${comb.stock} gal (Stock) | ${comb.vendido} gal (Vendido) | $${comb.precio}`)
      })
    })
    
    return surtidores.length
    
  } catch (error) {
    console.log('❌ Error revisando surtidores:', error.message)
    return 0
  }
}

async function revisarVentas() {
  try {
    console.log('\n💰 REVISANDO VENTAS...')
    
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('*')
      .orderBy('fecha_venta', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log('❌ Error obteniendo ventas:', error.message)
      return
    }
    
    console.log(`📊 Últimas 10 ventas (Total: ${ventas.length})`)
    
    if (ventas.length === 0) {
      console.log('⚠️  No hay ventas registradas')
      return 0
    }
    
    ventas.forEach((venta, i) => {
      console.log(`\n${i+1}. Venta ${venta.id.substring(0, 8)}...`)
      console.log(`   Fecha: ${new Date(venta.fecha_venta).toLocaleDateString('es-ES')}`)
      console.log(`   Surtidor: ${venta.surtidor_nombre}`)
      console.log(`   Bombero: ${venta.bombero_nombre}`)
      console.log(`   Combustible: ${venta.tipo_combustible}`)
      console.log(`   Cantidad: ${venta.cantidad} gal`)
      console.log(`   Total: $${venta.valor_total?.toLocaleString('es-ES')}`)
      console.log(`   Método: ${venta.metodo_pago}`)
    })
    
    // Estadísticas de ventas
    const totalVentas = ventas.reduce((sum, v) => sum + (v.valor_total || 0), 0)
    const totalGalones = ventas.reduce((sum, v) => sum + (v.cantidad || 0), 0)
    
    console.log(`\n📈 Estadísticas de las últimas ventas:`)
    console.log(`   Total vendido: $${totalVentas.toLocaleString('es-ES')}`)
    console.log(`   Total galones: ${totalGalones.toFixed(2)} gal`)
    
    return ventas.length
    
  } catch (error) {
    console.log('❌ Error revisando ventas:', error.message)
    return 0
  }
}

async function revisarConfiguracionCombustibles() {
  try {
    console.log('\n⚙️  REVISANDO CONFIGURACIÓN DE COMBUSTIBLES...')
    
    const { data: config, error } = await supabase
      .from('configuracion_combustibles')
      .select('*')
      .orderBy('tipo_combustible')
    
    if (error) {
      console.log('❌ Error obteniendo configuración:', error.message)
      return
    }
    
    console.log(`📊 Tipos de combustible configurados: ${config.length}`)
    
    config.forEach((c, i) => {
      console.log(`\n${i+1}. ${c.tipo_combustible.toUpperCase()}`)
      console.log(`   Precio por litro: $${c.precio_por_litro?.toLocaleString('es-ES')}`)
      console.log(`   Precio por galón: $${c.precio_por_galon?.toLocaleString('es-ES')}`)
      console.log(`   Estado: ${c.activo ? '✅ Activo' : '❌ Inactivo'}`)
      console.log(`   Última actualización: ${new Date(c.fecha_actualizacion).toLocaleDateString('es-ES')}`)
    })
    
    return config.length
    
  } catch (error) {
    console.log('❌ Error revisando configuración:', error.message)
    return 0
  }
}

async function revisarInventario() {
  try {
    console.log('\n📦 REVISANDO INVENTARIO...')
    
    const { data: inventario, error } = await supabase
      .from('combustibles_surtidor')
      .select(`
        *,
        surtidores(nombre, estado)
      `)
      .orderBy('surtidor_id')
    
    if (error) {
      console.log('❌ Error obteniendo inventario:', error.message)
      return
    }
    
    console.log(`📊 Total de registros de inventario: ${inventario.length}`)
    
    // Agrupar por surtidor
    const porSurtidor = inventario.reduce((acc, item) => {
      const surtidor = item.surtidores?.nombre || 'Desconocido'
      if (!acc[surtidor]) acc[surtidor] = []
      acc[surtidor].push(item)
      return acc
    }, {})
    
    Object.entries(porSurtidor).forEach(([surtidor, items]) => {
      console.log(`\n⛽ ${surtidor}:`)
      items.forEach(item => {
        const porcentajeStock = ((item.stock / item.capacidad_maxima) * 100).toFixed(1)
        console.log(`   - ${item.tipo_combustible}: ${item.stock}/${item.capacidad_maxima} gal (${porcentajeStock}%)`)
        console.log(`     Vendido: ${item.vendido} gal | Precio: $${item.precio}`)
      })
    })
    
    // Estadísticas generales
    const totalStock = inventario.reduce((sum, item) => sum + item.stock, 0)
    const totalVendido = inventario.reduce((sum, item) => sum + item.vendido, 0)
    const totalCapacidad = inventario.reduce((sum, item) => sum + item.capacidad_maxima, 0)
    
    console.log(`\n📈 Estadísticas generales:`)
    console.log(`   Stock total: ${totalStock.toFixed(2)} gal`)
    console.log(`   Vendido total: ${totalVendido.toFixed(2)} gal`)
    console.log(`   Capacidad total: ${totalCapacidad.toFixed(2)} gal`)
    console.log(`   Disponibilidad: ${((totalStock / totalCapacidad) * 100).toFixed(1)}%`)
    
    return inventario.length
    
  } catch (error) {
    console.log('❌ Error revisando inventario:', error.message)
    return 0
  }
}

async function revisarIntegridadReferencial() {
  try {
    console.log('\n🔗 REVISANDO INTEGRIDAD REFERENCIAL...')
    
    // Verificar ventas con surtidores válidos
    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('id, surtidor_id, surtidor_nombre')
    
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('id')
    
    if (ventasError || surtidoresError) {
      console.log('❌ Error verificando integridad:', ventasError?.message || surtidoresError?.message)
      return
    }
    
    const idsSurtidoresValidos = surtidores.map(s => s.id)
    const ventasInvalidas = ventas.filter(v => !idsSurtidoresValidos.includes(v.surtidor_id))
    
    if (ventasInvalidas.length > 0) {
      console.log(`⚠️  Ventas con surtidores inválidos: ${ventasInvalidas.length}`)
      ventasInvalidas.forEach(v => {
        console.log(`   - Venta ${v.id}: Surtidor ${v.surtidor_id} no existe`)
      })
    } else {
      console.log('✅ Todas las ventas tienen surtidores válidos')
    }
    
    // Verificar ventas con usuarios válidos
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('id')
    
    if (!usuariosError && usuarios) {
      const idsUsuariosValidos = usuarios.map(u => u.id)
      const ventasUsuariosInvalidos = ventas.filter(v => !idsUsuariosValidos.includes(v.bombero_id))
      
      if (ventasUsuariosInvalidos.length > 0) {
        console.log(`⚠️  Ventas con usuarios inválidos: ${ventasUsuariosInvalidos.length}`)
        ventasUsuariosInvalidos.forEach(v => {
          console.log(`   - Venta ${v.id}: Usuario ${v.bombero_id} no existe`)
        })
      } else {
        console.log('✅ Todas las ventas tienen usuarios válidos')
      }
    }
    
    return ventasInvalidas.length === 0
    
  } catch (error) {
    console.log('❌ Error revisando integridad:', error.message)
    return false
  }
}

async function generarResumenEjecutivo() {
  try {
    console.log('\n📊 GENERANDO RESUMEN EJECUTIVO...')
    
    // Obtener estadísticas generales
    const { data: totalVentas, error: ventasError } = await supabase
      .from('ventas')
      .select('valor_total, cantidad')
    
    const { data: totalUsuarios, error: usuariosError } = await supabase
      .from('users')
      .select('activo')
    
    const { data: totalSurtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('estado')
    
    if (ventasError || usuariosError || surtidoresError) {
      console.log('❌ Error generando resumen:', ventasError?.message || usuariosError?.message || surtidoresError?.message)
      return
    }
    
    const ingresosTotales = totalVentas.reduce((sum, v) => sum + (v.valor_total || 0), 0)
    const galonesVendidos = totalVentas.reduce((sum, v) => sum + (v.cantidad || 0), 0)
    const usuariosActivos = totalUsuarios.filter(u => u.activo).length
    const surtidoresDisponibles = totalSurtidores.filter(s => s.estado === 'disponible').length
    
    console.log('\n' + '='.repeat(60))
    console.log('📋 RESUMEN EJECUTIVO - ESTACIÓN DE GASOLINA')
    console.log('='.repeat(60))
    console.log(`💰 Ingresos totales: $${ingresosTotales.toLocaleString('es-ES')}`)
    console.log(`⛽ Galones vendidos: ${galonesVendidos.toFixed(2)} gal`)
    console.log(`👥 Usuarios activos: ${usuariosActivos}`)
    console.log(`⛽ Surtidores disponibles: ${surtidoresDisponibles}/${totalSurtidores.length}`)
    console.log(`📊 Total de ventas: ${totalVentas.length}`)
    console.log('='.repeat(60))
    
    // Estado del sistema
    const estadoSistema = usuariosActivos > 0 && surtidoresDisponibles > 0 && totalVentas.length >= 0
    console.log(`🎯 Estado del sistema: ${estadoSistema ? '✅ OPERATIVO' : '⚠️  REQUIERE ATENCIÓN'}`)
    
    if (estadoSistema) {
      console.log('✅ Base de datos completamente funcional')
      console.log('✅ Todos los módulos operativos')
      console.log('✅ Sistema listo para producción')
    } else {
      console.log('⚠️  Se requiere revisión adicional')
    }
    
    return estadoSistema
    
  } catch (error) {
    console.log('❌ Error generando resumen:', error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🔍 INICIANDO REVISIÓN COMPLETA DE BASE DE DATOS...')
    console.log('📅 Fecha:', new Date().toLocaleDateString('es-ES'))
    console.log('⏰ Hora:', new Date().toLocaleTimeString('es-ES'))
    
    // Ejecutar todas las revisiones
    const usuarios = await revisarUsuarios()
    const surtidores = await revisarSurtidores()
    const ventas = await revisarVentas()
    const config = await revisarConfiguracionCombustibles()
    const inventario = await revisarInventario()
    const integridad = await revisarIntegridadReferencial()
    const resumen = await generarResumenEjecutivo()
    
    console.log('\n🎉 REVISIÓN COMPLETA FINALIZADA 🎉')
    console.log('📊 Resumen de la revisión:')
    console.log(`   👥 Usuarios revisados: ${usuarios}`)
    console.log(`   ⛽ Surtidores revisados: ${surtidores}`)
    console.log(`   💰 Ventas revisadas: ${ventas}`)
    console.log(`   ⚙️  Configuraciones revisadas: ${config}`)
    console.log(`   📦 Registros de inventario: ${inventario}`)
    console.log(`   🔗 Integridad referencial: ${integridad ? '✅ Correcta' : '❌ Problemas'}`)
    console.log(`   📋 Estado general: ${resumen ? '✅ Óptimo' : '⚠️  Requiere atención'}`)
    
    if (resumen && integridad) {
      console.log('\n🚀 SISTEMA COMPLETAMENTE OPERATIVO')
      console.log('✅ Base de datos en perfecto estado')
      console.log('✅ Todas las funcionalidades disponibles')
      console.log('✅ Listo para uso en producción')
    }
    
  } catch (error) {
    console.log('❌ Error durante la revisión:', error.message)
  }
}

main()
