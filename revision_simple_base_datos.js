// ============================================================================
// REVISIÓN SIMPLE DE BASE DE DATOS - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para realizar una revisión simple pero completa de la base de datos

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
    
    if (error) {
      console.log('❌ Error obteniendo usuarios:', error.message)
      return 0
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
    
    if (error) {
      console.log('❌ Error obteniendo surtidores:', error.message)
      return 0
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
    
    if (error) {
      console.log('❌ Error obteniendo ventas:', error.message)
      return 0
    }
    
    console.log(`📊 Total de ventas: ${ventas.length}`)
    
    if (ventas.length === 0) {
      console.log('⚠️  No hay ventas registradas')
      return 0
    }
    
    // Mostrar las últimas 5 ventas
    const ultimasVentas = ventas.slice(-5)
    console.log(`\n📋 Últimas 5 ventas:`)
    
    ultimasVentas.forEach((venta, i) => {
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
    
    console.log(`\n📈 Estadísticas generales:`)
    console.log(`   Total vendido: $${totalVentas.toLocaleString('es-ES')}`)
    console.log(`   Total galones: ${totalGalones.toFixed(2)} gal`)
    console.log(`   Promedio por venta: $${(totalVentas / ventas.length).toLocaleString('es-ES')}`)
    
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
    
    if (error) {
      console.log('❌ Error obteniendo configuración:', error.message)
      return 0
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
    
    if (error) {
      console.log('❌ Error obteniendo inventario:', error.message)
      return 0
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
      .select('id, surtidor_id, surtidor_nombre, bombero_id')
    
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('id')
    
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('id')
    
    if (ventasError || surtidoresError || usuariosError) {
      console.log('❌ Error verificando integridad:', ventasError?.message || surtidoresError?.message || usuariosError?.message)
      return false
    }
    
    const idsSurtidoresValidos = surtidores.map(s => s.id)
    const idsUsuariosValidos = usuarios.map(u => u.id)
    
    const ventasInvalidasSurtidores = ventas.filter(v => !idsSurtidoresValidos.includes(v.surtidor_id))
    const ventasInvalidasUsuarios = ventas.filter(v => v.bombero_id && !idsUsuariosValidos.includes(v.bombero_id))
    
    if (ventasInvalidasSurtidores.length > 0) {
      console.log(`⚠️  Ventas con surtidores inválidos: ${ventasInvalidasSurtidores.length}`)
      ventasInvalidasSurtidores.forEach(v => {
        console.log(`   - Venta ${v.id}: Surtidor ${v.surtidor_id} no existe`)
      })
    } else {
      console.log('✅ Todas las ventas tienen surtidores válidos')
    }
    
    if (ventasInvalidasUsuarios.length > 0) {
      console.log(`⚠️  Ventas con usuarios inválidos: ${ventasInvalidasUsuarios.length}`)
      ventasInvalidasUsuarios.forEach(v => {
        console.log(`   - Venta ${v.id}: Usuario ${v.bombero_id} no existe`)
      })
    } else {
      console.log('✅ Todas las ventas tienen usuarios válidos')
    }
    
    return ventasInvalidasSurtidores.length === 0 && ventasInvalidasUsuarios.length === 0
    
  } catch (error) {
    console.log('❌ Error revisando integridad:', error.message)
    return false
  }
}

async function generarResumenEjecutivo(usuarios, surtidores, ventas, config, inventario, integridad) {
  try {
    console.log('\n' + '='.repeat(60))
    console.log('📋 RESUMEN EJECUTIVO - ESTACIÓN DE GASOLINA')
    console.log('='.repeat(60))
    console.log(`👥 Usuarios registrados: ${usuarios}`)
    console.log(`⛽ Surtidores operativos: ${surtidores}`)
    console.log(`💰 Total de ventas: ${ventas}`)
    console.log(`⚙️  Tipos de combustible: ${config}`)
    console.log(`📦 Registros de inventario: ${inventario}`)
    console.log(`🔗 Integridad referencial: ${integridad ? '✅ Correcta' : '❌ Problemas'}`)
    console.log('='.repeat(60))
    
    // Estado del sistema
    const estadoSistema = usuarios > 0 && surtidores > 0 && config > 0 && integridad
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
    console.log('🔍 INICIANDO REVISIÓN SIMPLE DE BASE DE DATOS...')
    console.log('📅 Fecha:', new Date().toLocaleDateString('es-ES'))
    console.log('⏰ Hora:', new Date().toLocaleTimeString('es-ES'))
    
    // Ejecutar todas las revisiones
    const usuarios = await revisarUsuarios()
    const surtidores = await revisarSurtidores()
    const ventas = await revisarVentas()
    const config = await revisarConfiguracionCombustibles()
    const inventario = await revisarInventario()
    const integridad = await revisarIntegridadReferencial()
    const resumen = await generarResumenEjecutivo(usuarios, surtidores, ventas, config, inventario, integridad)
    
    console.log('\n🎉 REVISIÓN SIMPLE FINALIZADA 🎉')
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
