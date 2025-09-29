// ============================================================================
// ANÁLISIS DETALLADO DE LA BASE DE DATOS - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para analizar en detalle la estructura y crear soluciones específicas

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 INICIANDO ANÁLISIS DETALLADO DE LA BASE DE DATOS...')

// ============================================================================
// ANÁLISIS DE DATOS EXISTENTES
// ============================================================================
async function analizarDatosExistentes() {
  console.log('\n📊 ANÁLISIS DE DATOS EXISTENTES...')
  
  // 1. Analizar surtidores
  console.log('\n--- SURTIDORES ---')
  try {
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('*')
      .order('nombre')
    
    if (surtidoresError) {
      console.log('❌ Error:', surtidoresError.message)
    } else {
      console.log(`✅ Total surtidores: ${surtidores.length}`)
      surtidores.forEach((s, index) => {
        console.log(`   ${index + 1}. ${s.nombre} (${s.estado}) - ID: ${s.id}`)
      })
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // 2. Analizar usuarios
  console.log('\n--- USUARIOS ---')
  try {
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('*')
      .order('username')
    
    if (usuariosError) {
      console.log('❌ Error:', usuariosError.message)
    } else {
      console.log(`✅ Total usuarios: ${usuarios.length}`)
      usuarios.forEach((u, index) => {
        console.log(`   ${index + 1}. ${u.username} (${u.role}) - ${u.name}`)
      })
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // 3. Analizar combustibles por surtidor
  console.log('\n--- COMBUSTIBLES POR SURTIDOR ---')
  try {
    const { data: combustibles, error: combustiblesError } = await supabase
      .from('combustibles_surtidor')
      .select(`
        *,
        surtidores!inner(nombre, estado)
      `)
      .order('surtidor_id, tipo_combustible')
    
    if (combustiblesError) {
      console.log('❌ Error:', combustiblesError.message)
    } else {
      console.log(`✅ Total combustibles por surtidor: ${combustibles.length}`)
      
      // Agrupar por surtidor
      const agrupados = combustibles.reduce((acc, c) => {
        const surtidorNombre = c.surtidores?.nombre || 'Desconocido'
        if (!acc[surtidorNombre]) {
          acc[surtidorNombre] = []
        }
        acc[surtidorNombre].push(c)
        return acc
      }, {})
      
      Object.entries(agrupados).forEach(([surtidor, combustibles]) => {
        console.log(`   📍 ${surtidor}:`)
        combustibles.forEach(c => {
          console.log(`      - ${c.tipo_combustible}: ${c.stock}L ($${c.precio})`)
        })
      })
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // 4. Analizar configuración global de combustibles
  console.log('\n--- CONFIGURACIÓN GLOBAL DE COMBUSTIBLES ---')
  try {
    const { data: configCombustibles, error: configError } = await supabase
      .from('configuracion_combustibles')
      .select('*')
      .order('tipo_combustible')
    
    if (configError) {
      console.log('❌ Error:', configError.message)
    } else {
      console.log(`✅ Total configuración: ${configCombustibles.length}`)
      configCombustibles.forEach(c => {
        console.log(`   - ${c.tipo_combustible}: $${c.precio_por_litro} (Stock: ${c.stock_disponible}/${c.stock_total}L)`)
      })
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // 5. Analizar ventas
  console.log('\n--- VENTAS ---')
  try {
    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha_venta', { ascending: false })
      .limit(10)
    
    if (ventasError) {
      console.log('❌ Error:', ventasError.message)
    } else {
      console.log(`✅ Últimas 10 ventas: ${ventas.length}`)
      ventas.forEach((v, index) => {
        const fecha = new Date(v.fecha_venta).toLocaleDateString('es-ES')
        console.log(`   ${index + 1}. ${fecha} - ${v.tipo_combustible} (${v.cantidad}L) - $${v.valor_total}`)
      })
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // 6. Analizar turnos
  console.log('\n--- TURNOS ---')
  try {
    const { data: turnos, error: turnosError } = await supabase
      .from('turnos')
      .select('*')
      .order('fecha_inicio', { ascending: false })
      .limit(10)
    
    if (turnosError) {
      console.log('❌ Error:', turnosError.message)
    } else {
      console.log(`✅ Últimos 10 turnos: ${turnos.length}`)
      turnos.forEach((t, index) => {
        const fechaInicio = new Date(t.fecha_inicio).toLocaleDateString('es-ES')
        const fechaFin = t.fecha_fin ? new Date(t.fecha_fin).toLocaleDateString('es-ES') : 'En curso'
        console.log(`   ${index + 1}. ${t.bombero_nombre} - ${fechaInicio} a ${fechaFin} (${t.estado})`)
      })
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

// ============================================================================
// ANÁLISIS DE PROBLEMAS IDENTIFICADOS
// ============================================================================
async function analizarProblemasIdentificados() {
  console.log('\n⚠️  ANÁLISIS DE PROBLEMAS IDENTIFICADOS...')
  
  // Problema 1: Duplicados en surtidores
  console.log('\n--- PROBLEMA 1: DUPLICADOS EN SURTIDORES ---')
  try {
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('nombre, count(*)')
      .group('nombre')
      .having('count(*)', 'gt', 1)
    
    if (surtidoresError) {
      console.log('❌ Error:', surtidoresError.message)
    } else if (surtidores && surtidores.length > 0) {
      console.log('⚠️  Surtidores duplicados encontrados:')
      surtidores.forEach(s => {
        console.log(`   - ${s.nombre}: ${s.count} registros`)
      })
    } else {
      console.log('✅ No hay surtidores duplicados')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // Problema 2: Inconsistencias en precios
  console.log('\n--- PROBLEMA 2: INCONSISTENCIAS EN PRECIOS ---')
  try {
    const { data: precios, error: preciosError } = await supabase
      .from('combustibles_surtidor')
      .select('tipo_combustible, precio')
      .order('tipo_combustible, precio')
    
    if (preciosError) {
      console.log('❌ Error:', preciosError.message)
    } else {
      // Agrupar por tipo de combustible
      const agrupados = precios.reduce((acc, p) => {
        if (!acc[p.tipo_combustible]) {
          acc[p.tipo_combustible] = []
        }
        acc[p.tipo_combustible].push(p.precio)
        return acc
      }, {})
      
      console.log('📊 Precios por tipo de combustible:')
      Object.entries(agrupados).forEach(([tipo, precios]) => {
        const preciosUnicos = [...new Set(precios)]
        if (preciosUnicos.length > 1) {
          console.log(`   ⚠️  ${tipo}: ${preciosUnicos.join(', ')} (inconsistente)`)
        } else {
          console.log(`   ✅ ${tipo}: $${preciosUnicos[0]} (consistente)`)
        }
      })
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // Problema 3: Verificar integridad referencial
  console.log('\n--- PROBLEMA 3: INTEGRIDAD REFERENCIAL ---')
  try {
    // Verificar ventas con surtidores inexistentes
    const { data: ventasInvalidas, error: ventasError } = await supabase
      .from('ventas')
      .select('surtidor_id, surtidor_nombre')
      .not('surtidor_id', 'in', `(SELECT id FROM surtidores)`)
      .limit(5)
    
    if (ventasError) {
      console.log('❌ Error verificando ventas:', ventasError.message)
    } else if (ventasInvalidas && ventasInvalidas.length > 0) {
      console.log('⚠️  Ventas con surtidores inexistentes:')
      ventasInvalidas.forEach(v => {
        console.log(`   - Surtidor ID: ${v.surtidor_id} (${v.surtidor_nombre})`)
      })
    } else {
      console.log('✅ Todas las ventas tienen surtidores válidos')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

// ============================================================================
// ANÁLISIS DE FUNCIONALIDAD DEL FRONTEND
// ============================================================================
async function analizarFuncionalidadFrontend() {
  console.log('\n🖥️  ANÁLISIS DE FUNCIONALIDAD DEL FRONTEND...')
  
  // Verificar si los datos necesarios para el frontend están disponibles
  console.log('\n--- VERIFICACIÓN DE DATOS PARA FRONTEND ---')
  
  // 1. Verificar datos para Dashboard
  console.log('\n📊 Dashboard:')
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
      console.log('   ❌ Error obteniendo ventas del día:', ventasHoyError.message)
    } else {
      const totalVentas = ventasHoy.reduce((sum, v) => sum + (v.valor_total || 0), 0)
      const totalLitros = ventasHoy.reduce((sum, v) => sum + (v.cantidad || 0), 0)
      console.log(`   ✅ Ventas del día: $${totalVentas} (${totalLitros}L)`)
    }
    
    // Surtidores disponibles
    const { data: surtidoresDisponibles, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('*')
      .eq('estado', 'disponible')
    
    if (surtidoresError) {
      console.log('   ❌ Error obteniendo surtidores:', surtidoresError.message)
    } else {
      console.log(`   ✅ Surtidores disponibles: ${surtidoresDisponibles.length}`)
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message)
  }
  
  // 2. Verificar datos para Módulo de Ventas
  console.log('\n💰 Módulo de Ventas:')
  try {
    // Verificar si hay surtidores con combustibles
    const { data: surtidoresConCombustibles, error: surtidoresCombustiblesError } = await supabase
      .from('surtidores')
      .select(`
        *,
        combustibles_surtidor(*)
      `)
      .eq('estado', 'disponible')
    
    if (surtidoresCombustiblesError) {
      console.log('   ❌ Error:', surtidoresCombustiblesError.message)
    } else {
      const surtidoresValidos = surtidoresConCombustibles.filter(s => 
        s.combustibles_surtidor && s.combustibles_surtidor.length > 0
      )
      console.log(`   ✅ Surtidores con combustibles: ${surtidoresValidos.length}`)
      
      if (surtidoresValidos.length === 0) {
        console.log('   ⚠️  PROBLEMA: No hay surtidores con combustibles configurados')
      }
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
  }
  
  // 3. Verificar datos para Módulo de Usuarios
  console.log('\n👥 Módulo de Usuarios:')
  try {
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('*')
      .eq('activo', true)
    
    if (usuariosError) {
      console.log('   ❌ Error:', usuariosError.message)
    } else {
      const roles = usuarios.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1
        return acc
      }, {})
      
      console.log('   ✅ Usuarios activos por rol:')
      Object.entries(roles).forEach(([rol, cantidad]) => {
        console.log(`      - ${rol}: ${cantidad}`)
      })
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
async function main() {
  try {
    console.log('🔍 INICIANDO ANÁLISIS DETALLADO DE LA BASE DE DATOS...')
    
    // Paso 1: Analizar datos existentes
    await analizarDatosExistentes()
    
    // Paso 2: Analizar problemas identificados
    await analizarProblemasIdentificados()
    
    // Paso 3: Analizar funcionalidad del frontend
    await analizarFuncionalidadFrontend()
    
    console.log('\n🎉 ANÁLISIS DETALLADO FINALIZADO 🎉')
    console.log('📋 Revisa los resultados para identificar problemas específicos')
    console.log('🔧 Los problemas identificados necesitarán corrección')
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error)
  }
}

// Ejecutar el análisis
main()

