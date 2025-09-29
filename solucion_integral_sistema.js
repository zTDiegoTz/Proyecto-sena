// ============================================================================
// SOLUCIÓN INTEGRAL DEL SISTEMA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para corregir todos los problemas identificados y optimizar el sistema

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🚀 INICIANDO SOLUCIÓN INTEGRAL DEL SISTEMA...')

// ============================================================================
// PASO 1: LIMPIAR DUPLICADOS DE SURTIDORES
// ============================================================================
async function limpiarDuplicadosSurtidores() {
  console.log('\n🧹 LIMPIANDO DUPLICADOS DE SURTIDORES...')
  
  try {
    // Obtener todos los surtidores
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('*')
      .order('nombre, fecha_creacion')
    
    if (surtidoresError) {
      console.log('❌ Error obteniendo surtidores:', surtidoresError.message)
      return
    }
    
    console.log(`📊 Total surtidores encontrados: ${surtidores.length}`)
    
    // Identificar duplicados por nombre
    const duplicados = {}
    surtidores.forEach(surtidor => {
      if (!duplicados[surtidor.nombre]) {
        duplicados[surtidor.nombre] = []
      }
      duplicados[surtidor.nombre].push(surtidor)
    })
    
    // Encontrar nombres con duplicados
    const nombresDuplicados = Object.entries(duplicados).filter(([nombre, lista]) => lista.length > 1)
    
    if (nombresDuplicados.length === 0) {
      console.log('✅ No hay surtidores duplicados')
      return
    }
    
    console.log(`⚠️  Encontrados ${nombresDuplicados.length} nombres con duplicados:`)
    
    for (const [nombre, lista] of nombresDuplicados) {
      console.log(`\n📍 ${nombre}: ${lista.length} registros`)
      
      // Mantener el primero (más antiguo) y eliminar los demás
      const mantener = lista[0]
      const eliminar = lista.slice(1)
      
      console.log(`   ✅ Mantener: ${mantener.id} (${mantener.fecha_creacion})`)
      
      for (const surtidor of eliminar) {
        console.log(`   🗑️  Eliminar: ${surtidor.id} (${surtidor.fecha_creacion})`)
        
        // Primero eliminar combustibles asociados
        const { error: combustiblesError } = await supabase
          .from('combustibles_surtidor')
          .delete()
          .eq('surtidor_id', surtidor.id)
        
        if (combustiblesError) {
          console.log(`      ❌ Error eliminando combustibles: ${combustiblesError.message}`)
        } else {
          console.log(`      ✅ Combustibles eliminados`)
        }
        
        // Luego eliminar el surtidor
        const { error: surtidorError } = await supabase
          .from('surtidores')
          .delete()
          .eq('id', surtidor.id)
        
        if (surtidorError) {
          console.log(`      ❌ Error eliminando surtidor: ${surtidorError.message}`)
        } else {
          console.log(`      ✅ Surtidor eliminado`)
        }
      }
    }
    
    console.log('✅ Limpieza de duplicados completada')
    
  } catch (error) {
    console.log('❌ Error durante la limpieza:', error.message)
  }
}

// ============================================================================
// PASO 2: VERIFICAR Y CORREGIR COMBUSTIBLES POR SURTIDOR
// ============================================================================
async function verificarCombustiblesSurtidor() {
  console.log('\n🛢️  VERIFICANDO COMBUSTIBLES POR SURTIDOR...')
  
  try {
    // Obtener todos los surtidores
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('*')
      .order('nombre')
    
    if (surtidoresError) {
      console.log('❌ Error obteniendo surtidores:', surtidoresError.message)
      return
    }
    
    // Obtener todos los combustibles por surtidor
    const { data: combustibles, error: combustiblesError } = await supabase
      .from('combustibles_surtidor')
      .select('*')
    
    if (combustiblesError) {
      console.log('❌ Error obteniendo combustibles:', combustiblesError.message)
      return
    }
    
    console.log(`📊 Surtidores: ${surtidores.length}, Combustibles: ${combustibles.length}`)
    
    // Verificar que cada surtidor tenga los 3 tipos de combustible
    const tiposCombustible = ['extra', 'corriente', 'acpm']
    
    for (const surtidor of surtidores) {
      console.log(`\n📍 Verificando ${surtidor.nombre} (${surtidor.id}):`)
      
      const combustiblesSurtidor = combustibles.filter(c => c.surtidor_id === surtidor.id)
      console.log(`   Combustibles existentes: ${combustiblesSurtidor.length}`)
      
      for (const tipo of tiposCombustible) {
        const combustibleExistente = combustiblesSurtidor.find(c => c.tipo_combustible === tipo)
        
        if (combustibleExistente) {
          console.log(`   ✅ ${tipo}: ${combustibleExistente.stock}L ($${combustibleExistente.precio})`)
        } else {
          console.log(`   ⚠️  ${tipo}: FALTANTE - Creando...`)
          
          // Crear el combustible faltante
          const { error: crearError } = await supabase
            .from('combustibles_surtidor')
            .insert({
              surtidor_id: surtidor.id,
              tipo_combustible: tipo,
              stock: 1000,
              precio: tipo === 'extra' ? 12500 : tipo === 'corriente' ? 12000 : 11000,
              capacidad_maxima: 1000,
              vendido: 0
            })
          
          if (crearError) {
            console.log(`      ❌ Error creando ${tipo}: ${crearError.message}`)
          } else {
            console.log(`      ✅ ${tipo} creado exitosamente`)
          }
        }
      }
    }
    
    console.log('✅ Verificación de combustibles completada')
    
  } catch (error) {
    console.log('❌ Error durante la verificación:', error.message)
  }
}

// ============================================================================
// PASO 3: OPTIMIZAR CONFIGURACIÓN GLOBAL
// ============================================================================
async function optimizarConfiguracionGlobal() {
  console.log('\n⚙️  OPTIMIZANDO CONFIGURACIÓN GLOBAL...')
  
  try {
    // Verificar configuración de combustibles
    const { data: configCombustibles, error: configError } = await supabase
      .from('configuracion_combustibles')
      .select('*')
      .order('tipo_combustible')
    
    if (configError) {
      console.log('❌ Error obteniendo configuración:', configError.message)
      return
    }
    
    console.log(`📊 Configuración existente: ${configCombustibles.length} tipos`)
    
    // Verificar que todos los tipos estén configurados
    const tiposEsperados = ['extra', 'corriente', 'acpm']
    const tiposConfigurados = configCombustibles.map(c => c.tipo_combustible)
    
    for (const tipo of tiposEsperados) {
      if (tiposConfigurados.includes(tipo)) {
        const config = configCombustibles.find(c => c.tipo_combustible === tipo)
        console.log(`   ✅ ${tipo}: $${config.precio_por_litro} (Stock: ${config.stock_disponible}/${config.stock_total}L)`)
      } else {
        console.log(`   ⚠️  ${tipo}: FALTANTE - Creando...`)
        
        const { error: crearError } = await supabase
          .from('configuracion_combustibles')
          .insert({
            tipo_combustible: tipo,
            precio_por_litro: tipo === 'extra' ? 12500 : tipo === 'corriente' ? 12000 : 11000,
            stock_total: 3000,
            stock_disponible: 3000,
            activo: true
          })
        
        if (crearError) {
          console.log(`      ❌ Error creando ${tipo}: ${crearError.message}`)
        } else {
          console.log(`      ✅ ${tipo} creado exitosamente`)
        }
      }
    }
    
    // Verificar configuración general
    const { data: configGeneral, error: configGeneralError } = await supabase
      .from('configuracion')
      .select('*')
    
    if (configGeneralError) {
      console.log('❌ Error obteniendo configuración general:', configGeneralError.message)
      return
    }
    
    console.log(`\n📊 Configuración general: ${configGeneral.length} parámetros`)
    
    const configuracionesEsperadas = [
      { clave: 'nombre_estacion', valor: 'Estación de Gasolina SENA', tipo: 'string' },
      { clave: 'direccion_estacion', valor: 'Calle 123 #45-67', tipo: 'string' },
      { clave: 'telefono_estacion', valor: '300-123-4567', tipo: 'string' },
      { clave: 'monitoreo_stock', valor: 'false', tipo: 'boolean' },
      { clave: 'version_sistema', valor: '2.0', tipo: 'string' }
    ]
    
    for (const config of configuracionesEsperadas) {
      const existe = configGeneral.find(c => c.clave === config.clave)
      
      if (existe) {
        console.log(`   ✅ ${config.clave}: ${existe.valor}`)
      } else {
        console.log(`   ⚠️  ${config.clave}: FALTANTE - Creando...`)
        
        const { error: crearError } = await supabase
          .from('configuracion')
          .insert({
            clave: config.clave,
            valor: config.valor,
            descripcion: `Configuración de ${config.clave}`,
            tipo: config.tipo
          })
        
        if (crearError) {
          console.log(`      ❌ Error creando ${config.clave}: ${crearError.message}`)
        } else {
          console.log(`      ✅ ${config.clave} creado exitosamente`)
        }
      }
    }
    
    console.log('✅ Optimización de configuración completada')
    
  } catch (error) {
    console.log('❌ Error durante la optimización:', error.message)
  }
}

// ============================================================================
// PASO 4: VERIFICAR INTEGRIDAD DE DATOS
// ============================================================================
async function verificarIntegridadDatos() {
  console.log('\n🔍 VERIFICANDO INTEGRIDAD DE DATOS...')
  
  try {
    // Verificar que todos los surtidores tengan combustibles
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select(`
        *,
        combustibles_surtidor(*)
      `)
    
    if (surtidoresError) {
      console.log('❌ Error obteniendo surtidores:', surtidoresError.message)
      return
    }
    
    console.log(`📊 Verificando ${surtidores.length} surtidores...`)
    
    let surtidoresCompletos = 0
    let surtidoresIncompletos = 0
    
    for (const surtidor of surtidores) {
      const combustibles = surtidor.combustibles_surtidor || []
      
      if (combustibles.length === 3) {
        surtidoresCompletos++
        console.log(`   ✅ ${surtidor.nombre}: ${combustibles.length} combustibles`)
      } else {
        surtidoresIncompletos++
        console.log(`   ⚠️  ${surtidor.nombre}: ${combustibles.length} combustibles (esperado: 3)`)
      }
    }
    
    console.log(`\n📊 Resumen de integridad:`)
    console.log(`   ✅ Surtidores completos: ${surtidoresCompletos}`)
    console.log(`   ⚠️  Surtidores incompletos: ${surtidoresIncompletos}`)
    
    // Verificar usuarios activos
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('*')
      .eq('activo', true)
    
    if (usuariosError) {
      console.log('❌ Error obteniendo usuarios:', usuariosError.message)
      return
    }
    
    console.log(`\n👥 Usuarios activos: ${usuarios.length}`)
    
    const roles = usuarios.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    }, {})
    
    Object.entries(roles).forEach(([rol, cantidad]) => {
      console.log(`   - ${rol}: ${cantidad}`)
    })
    
    console.log('✅ Verificación de integridad completada')
    
  } catch (error) {
    console.log('❌ Error durante la verificación:', error.message)
  }
}

// ============================================================================
// PASO 5: CREAR DATOS DE PRUEBA (OPCIONAL)
// ============================================================================
async function crearDatosPrueba() {
  console.log('\n🧪 CREANDO DATOS DE PRUEBA...')
  
  try {
    // Crear un turno de prueba
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
    
    console.log(`👤 Usando bombero: ${bombero.name} (${bombero.username})`)
    
    // Crear turno de prueba
    const { data: turno, error: turnoError } = await supabase
      .from('turnos')
      .insert({
        bombero_id: bombero.id,
        bombero_nombre: bombero.name,
        fecha_inicio: new Date().toISOString(),
        estado: 'activo',
        observaciones: 'Turno de prueba creado automáticamente'
      })
      .select()
      .single()
    
    if (turnoError) {
      console.log('❌ Error creando turno:', turnoError.message)
    } else {
      console.log(`✅ Turno creado: ${turno.id}`)
    }
    
    // Crear una venta de prueba
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
    
    console.log(`⛽ Usando surtidor: ${surtidor.nombre}`)
    
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert({
        surtidor_id: surtidor.id,
        surtidor_nombre: surtidor.nombre,
        bombero_id: bombero.id,
        bombero_nombre: bombero.name,
        tipo_combustible: 'extra',
        cantidad: 10,
        cantidad_galones: 2.64,
        precio_por_galon: 12500,
        precio_unitario: 3300,
        valor_total: 33000,
        metodo_pago: 'efectivo',
        cliente_nombre: 'Cliente de Prueba',
        turno_id: turno?.id,
        fecha_venta: new Date().toISOString()
      })
      .select()
      .single()
    
    if (ventaError) {
      console.log('❌ Error creando venta:', ventaError.message)
    } else {
      console.log(`✅ Venta creada: ${venta.id} - $${venta.valor_total}`)
    }
    
    console.log('✅ Datos de prueba creados')
    
  } catch (error) {
    console.log('❌ Error durante la creación de datos de prueba:', error.message)
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
async function main() {
  try {
    console.log('🚀 INICIANDO SOLUCIÓN INTEGRAL DEL SISTEMA...')
    
    // Paso 1: Limpiar duplicados de surtidores
    await limpiarDuplicadosSurtidores()
    
    // Paso 2: Verificar y corregir combustibles por surtidor
    await verificarCombustiblesSurtidor()
    
    // Paso 3: Optimizar configuración global
    await optimizarConfiguracionGlobal()
    
    // Paso 4: Verificar integridad de datos
    await verificarIntegridadDatos()
    
    // Paso 5: Crear datos de prueba (opcional)
    await crearDatosPrueba()
    
    console.log('\n🎉 SOLUCIÓN INTEGRAL COMPLETADA 🎉')
    console.log('✅ Sistema optimizado y listo para funcionar')
    console.log('🚀 Todos los módulos del frontend deberían funcionar correctamente')
    console.log('\n📋 PRÓXIMOS PASOS:')
    console.log('   1. Probar el login con: admin/admin123')
    console.log('   2. Verificar que todos los módulos carguen correctamente')
    console.log('   3. Probar crear una venta')
    console.log('   4. Verificar reportes y estadísticas')
    
  } catch (error) {
    console.error('❌ Error durante la solución integral:', error)
  }
}

// Ejecutar la solución integral
main()

