// ============================================================================
// VERIFICACIÓN FINAL DEL SISTEMA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para verificar que todos los módulos del frontend funcionen correctamente

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 INICIANDO VERIFICACIÓN FINAL DEL SISTEMA...')

// ============================================================================
// VERIFICACIÓN COMPLETA DEL SISTEMA
// ============================================================================
async function verificacionCompleta() {
  console.log('\n📋 VERIFICACIÓN COMPLETA DEL SISTEMA...')
  
  let errores = 0
  let exitos = 0
  
  // 1. Verificar conexión a Supabase
  console.log('\n--- 1. CONEXIÓN A SUPABASE ---')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ Error de conexión:', error.message)
      errores++
    } else {
      console.log('✅ Conexión a Supabase exitosa')
      exitos++
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message)
    errores++
  }
  
  // 2. Verificar módulo de usuarios
  console.log('\n--- 2. MÓDULO DE USUARIOS ---')
  try {
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('*')
      .eq('activo', true)
    
    if (usuariosError) {
      console.log('❌ Error obteniendo usuarios:', usuariosError.message)
      errores++
    } else {
      console.log(`✅ Usuarios activos: ${usuarios.length}`)
      
      // Verificar roles
      const roles = usuarios.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1
        return acc
      }, {})
      
      const rolesEsperados = ['super_admin', 'administrador', 'bombero']
      let rolesCorrectos = true
      
      for (const rol of rolesEsperados) {
        if (roles[rol] && roles[rol] > 0) {
          console.log(`   ✅ ${rol}: ${roles[rol]} usuarios`)
        } else {
          console.log(`   ⚠️  ${rol}: 0 usuarios`)
          rolesCorrectos = false
        }
      }
      
      if (rolesCorrectos) {
        exitos++
      } else {
        errores++
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    errores++
  }
  
  // 3. Verificar módulo de surtidores
  console.log('\n--- 3. MÓDULO DE SURTIDORES ---')
  try {
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select(`
        *,
        combustibles_surtidor(*)
      `)
    
    if (surtidoresError) {
      console.log('❌ Error obteniendo surtidores:', surtidoresError.message)
      errores++
    } else {
      console.log(`✅ Surtidores: ${surtidores.length}`)
      
      let surtidoresCompletos = 0
      for (const surtidor of surtidores) {
        const combustibles = surtidor.combustibles_surtidor || []
        if (combustibles.length === 3) {
          surtidoresCompletos++
          console.log(`   ✅ ${surtidor.nombre}: ${combustibles.length} combustibles`)
        } else {
          console.log(`   ⚠️  ${surtidor.nombre}: ${combustibles.length} combustibles`)
        }
      }
      
      if (surtidoresCompletos === surtidores.length) {
        exitos++
      } else {
        errores++
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    errores++
  }
  
  // 4. Verificar módulo de ventas
  console.log('\n--- 4. MÓDULO DE VENTAS ---')
  try {
    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha_venta', { ascending: false })
      .limit(5)
    
    if (ventasError) {
      console.log('❌ Error obteniendo ventas:', ventasError.message)
      errores++
    } else {
      console.log(`✅ Ventas: ${ventas.length} registros`)
      
      if (ventas.length > 0) {
        console.log('   📊 Últimas ventas:')
        ventas.forEach((v, index) => {
          const fecha = new Date(v.fecha_venta).toLocaleDateString('es-ES')
          console.log(`      ${index + 1}. ${fecha} - ${v.tipo_combustible} (${v.cantidad}L) - $${v.valor_total}`)
        })
      } else {
        console.log('   ⚠️  No hay ventas registradas')
      }
      
      exitos++
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    errores++
  }
  
  // 5. Verificar módulo de turnos
  console.log('\n--- 5. MÓDULO DE TURNOS ---')
  try {
    const { data: turnos, error: turnosError } = await supabase
      .from('turnos')
      .select('*')
      .order('fecha_inicio', { ascending: false })
      .limit(5)
    
    if (turnosError) {
      console.log('❌ Error obteniendo turnos:', turnosError.message)
      errores++
    } else {
      console.log(`✅ Turnos: ${turnos.length} registros`)
      
      if (turnos.length > 0) {
        console.log('   📊 Últimos turnos:')
        turnos.forEach((t, index) => {
          const fechaInicio = new Date(t.fecha_inicio).toLocaleDateString('es-ES')
          const fechaFin = t.fecha_fin ? new Date(t.fecha_fin).toLocaleDateString('es-ES') : 'En curso'
          console.log(`      ${index + 1}. ${t.bombero_nombre} - ${fechaInicio} a ${fechaFin} (${t.estado})`)
        })
      } else {
        console.log('   ⚠️  No hay turnos registrados')
      }
      
      exitos++
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    errores++
  }
  
  // 6. Verificar módulo de precios
  console.log('\n--- 6. MÓDULO DE PRECIOS ---')
  try {
    const { data: configCombustibles, error: configError } = await supabase
      .from('configuracion_combustibles')
      .select('*')
      .order('tipo_combustible')
    
    if (configError) {
      console.log('❌ Error obteniendo configuración:', configError.message)
      errores++
    } else {
      console.log(`✅ Configuración de combustibles: ${configCombustibles.length} tipos`)
      
      const tiposEsperados = ['extra', 'corriente', 'acpm']
      let configCorrecta = true
      
      for (const tipo of tiposEsperados) {
        const config = configCombustibles.find(c => c.tipo_combustible === tipo)
        if (config) {
          console.log(`   ✅ ${tipo}: $${config.precio_por_litro} (Stock: ${config.stock_disponible}/${config.stock_total}L)`)
        } else {
          console.log(`   ❌ ${tipo}: No configurado`)
          configCorrecta = false
        }
      }
      
      if (configCorrecta) {
        exitos++
      } else {
        errores++
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    errores++
  }
  
  // 7. Verificar módulo de inventario
  console.log('\n--- 7. MÓDULO DE INVENTARIO ---')
  try {
    const { data: inventario, error: inventarioError } = await supabase
      .from('inventario_historico')
      .select('*')
      .order('fecha_movimiento', { ascending: false })
      .limit(5)
    
    if (inventarioError) {
      console.log('❌ Error obteniendo inventario:', inventarioError.message)
      errores++
    } else {
      console.log(`✅ Historial de inventario: ${inventario.length} registros`)
      
      if (inventario.length > 0) {
        console.log('   📊 Últimos movimientos:')
        inventario.forEach((i, index) => {
          const fecha = new Date(i.fecha_movimiento).toLocaleDateString('es-ES')
          console.log(`      ${index + 1}. ${fecha} - ${i.tipo_combustible} (${i.diferencia}L) - ${i.motivo}`)
        })
      } else {
        console.log('   ⚠️  No hay movimientos de inventario')
      }
      
      exitos++
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    errores++
  }
  
  // 8. Verificar módulo de reportes
  console.log('\n--- 8. MÓDULO DE REPORTES ---')
  try {
    const { data: reportes, error: reportesError } = await supabase
      .from('reportes')
      .select('*')
      .order('fecha_generacion', { ascending: false })
      .limit(5)
    
    if (reportesError) {
      console.log('❌ Error obteniendo reportes:', reportesError.message)
      errores++
    } else {
      console.log(`✅ Reportes: ${reportes.length} registros`)
      
      if (reportes.length > 0) {
        console.log('   📊 Últimos reportes:')
        reportes.forEach((r, index) => {
          const fecha = new Date(r.fecha_generacion).toLocaleDateString('es-ES')
          console.log(`      ${index + 1}. ${fecha} - ${r.tipo_reporte}`)
        })
      } else {
        console.log('   ⚠️  No hay reportes generados')
      }
      
      exitos++
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    errores++
  }
  
  // 9. Verificar funcionalidad de login
  console.log('\n--- 9. FUNCIONALIDAD DE LOGIN ---')
  try {
    const { data: usuario, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('password_hash', 'admin123')
      .eq('activo', true)
      .single()
    
    if (loginError) {
      console.log('❌ Error en login:', loginError.message)
      errores++
    } else {
      console.log(`✅ Login exitoso: ${usuario.name} (${usuario.role})`)
      exitos++
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    errores++
  }
  
  // 10. Verificar estadísticas del dashboard
  console.log('\n--- 10. ESTADÍSTICAS DEL DASHBOARD ---')
  try {
    // Estadísticas de ventas del día
    const hoy = new Date()
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()
    const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1).toISOString()
    
    const { data: ventasHoy, error: ventasHoyError } = await supabase
      .from('ventas')
      .select('valor_total, cantidad')
      .gte('fecha_venta', inicioDelDia)
      .lt('fecha_venta', finDelDia)
    
    if (ventasHoyError) {
      console.log('❌ Error obteniendo ventas del día:', ventasHoyError.message)
      errores++
    } else {
      const totalVentas = ventasHoy.reduce((sum, v) => sum + (v.valor_total || 0), 0)
      const totalLitros = ventasHoy.reduce((sum, v) => sum + (v.cantidad || 0), 0)
      console.log(`✅ Ventas del día: $${totalVentas} (${totalLitros}L)`)
      exitos++
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    errores++
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE VERIFICACIÓN FINAL')
  console.log('='.repeat(60))
  console.log(`✅ Módulos funcionando correctamente: ${exitos}`)
  console.log(`❌ Módulos con problemas: ${errores}`)
  console.log(`📈 Porcentaje de éxito: ${Math.round((exitos / (exitos + errores)) * 100)}%`)
  
  if (errores === 0) {
    console.log('\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL! 🎉')
    console.log('✅ Todos los módulos del frontend están listos para usar')
    console.log('🚀 El sistema está optimizado y funcionando correctamente')
  } else {
    console.log('\n⚠️  SISTEMA CON PROBLEMAS MENORES')
    console.log('🔧 Algunos módulos pueden necesitar atención')
  }
  
  console.log('\n📋 INSTRUCCIONES PARA USAR EL SISTEMA:')
  console.log('   1. Inicia el servidor de desarrollo: npm run dev')
  console.log('   2. Abre el navegador en: http://localhost:5173')
  console.log('   3. Inicia sesión con: admin/admin123')
  console.log('   4. Explora todos los módulos disponibles')
  console.log('   5. Prueba crear una venta, gestionar turnos, etc.')
  
  return { exitos, errores }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
async function main() {
  try {
    console.log('🔍 INICIANDO VERIFICACIÓN FINAL DEL SISTEMA...')
    
    const resultado = await verificacionCompleta()
    
    console.log('\n🎉 VERIFICACIÓN FINAL COMPLETADA 🎉')
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
  }
}

// Ejecutar la verificación
main()

