// ============================================================================
// ANÁLISIS COMPLETO DE LA BASE DE DATOS - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para analizar la estructura, lógica y conexiones entre tablas

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 INICIANDO ANÁLISIS COMPLETO DE LA BASE DE DATOS...')

// ============================================================================
// FUNCIÓN PARA ANALIZAR ESTRUCTURA DE TABLAS
// ============================================================================
async function analizarEstructuraTablas() {
  console.log('\n📋 ANALIZANDO ESTRUCTURA DE TABLAS...')
  
  const tablas = [
    'users',
    'surtidores', 
    'combustibles_surtidor',
    'configuracion_combustibles',
    'ventas',
    'turnos',
    'configuracion',
    'inventario_historico',
    'precios_historico',
    'reportes',
    'auditoria'
  ]
  
  for (const tabla of tablas) {
    console.log(`\n--- TABLA: ${tabla.toUpperCase()} ---`)
    
    try {
      // Obtener estructura de la tabla
      const { data: columnas, error: columnasError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', tabla)
        .eq('table_schema', 'public')
        .order('ordinal_position')
      
      if (columnasError) {
        console.log(`❌ Error obteniendo estructura de ${tabla}:`, columnasError.message)
        continue
      }
      
      if (!columnas || columnas.length === 0) {
        console.log(`⚠️  Tabla ${tabla} no existe`)
        continue
      }
      
      console.log('📊 Estructura:')
      columnas.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
        console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`)
      })
      
      // Obtener claves primarias
      const { data: pk, error: pkError } = await supabase
        .from('information_schema.key_column_usage')
        .select('column_name')
        .eq('table_name', tabla)
        .eq('table_schema', 'public')
        .eq('constraint_name', `${tabla}_pkey`)
      
      if (!pkError && pk && pk.length > 0) {
        console.log(`🔑 Clave primaria: ${pk.map(p => p.column_name).join(', ')}`)
      }
      
      // Obtener claves foráneas
      const { data: fk, error: fkError } = await supabase
        .from('information_schema.key_column_usage')
        .select('column_name, referenced_table_name, referenced_column_name')
        .eq('table_name', tabla)
        .eq('table_schema', 'public')
        .not('referenced_table_name', 'is', null)
      
      if (!fkError && fk && fk.length > 0) {
        console.log('🔗 Claves foráneas:')
        fk.forEach(f => {
          console.log(`   - ${f.column_name} → ${f.referenced_table_name}.${f.referenced_column_name}`)
        })
      }
      
      // Contar registros
      const { count, error: countError } = await supabase
        .from(tabla)
        .select('*', { count: 'exact', head: true })
      
      if (!countError) {
        console.log(`📊 Registros: ${count}`)
      }
      
    } catch (error) {
      console.log(`❌ Error analizando ${tabla}:`, error.message)
    }
  }
}

// ============================================================================
// FUNCIÓN PARA ANALIZAR CONEXIONES Y RELACIONES
// ============================================================================
async function analizarConexiones() {
  console.log('\n🔗 ANALIZANDO CONEXIONES Y RELACIONES...')
  
  // Analizar relaciones principales
  const relaciones = [
    {
      tabla: 'ventas',
      relaciones: [
        { campo: 'surtidor_id', tabla_ref: 'surtidores', campo_ref: 'id' },
        { campo: 'bombero_id', tabla_ref: 'users', campo_ref: 'id' },
        { campo: 'turno_id', tabla_ref: 'turnos', campo_ref: 'id' }
      ]
    },
    {
      tabla: 'combustibles_surtidor',
      relaciones: [
        { campo: 'surtidor_id', tabla_ref: 'surtidores', campo_ref: 'id' }
      ]
    },
    {
      tabla: 'turnos',
      relaciones: [
        { campo: 'bombero_id', tabla_ref: 'users', campo_ref: 'id' }
      ]
    },
    {
      tabla: 'inventario_historico',
      relaciones: [
        { campo: 'surtidor_id', tabla_ref: 'surtidores', campo_ref: 'id' },
        { campo: 'usuario_id', tabla_ref: 'users', campo_ref: 'id' }
      ]
    }
  ]
  
  for (const rel of relaciones) {
    console.log(`\n--- RELACIONES DE ${rel.tabla.toUpperCase()} ---`)
    
    for (const relacion of rel.relaciones) {
      console.log(`\n🔍 Verificando: ${rel.tabla}.${relacion.campo} → ${relacion.tabla_ref}.${relacion.campo_ref}`)
      
      try {
        // Verificar si la tabla de referencia existe
        const { data: tablaRef, error: tablaRefError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', relacion.tabla_ref)
          .eq('table_schema', 'public')
          .single()
        
        if (tablaRefError) {
          console.log(`   ❌ Tabla de referencia ${relacion.tabla_ref} no existe`)
          continue
        }
        
        // Verificar si el campo de referencia existe
        const { data: campoRef, error: campoRefError } = await supabase
          .from('information_schema.columns')
          .select('data_type')
          .eq('table_name', relacion.tabla_ref)
          .eq('column_name', relacion.campo_ref)
          .eq('table_schema', 'public')
          .single()
        
        if (campoRefError) {
          console.log(`   ❌ Campo de referencia ${relacion.tabla_ref}.${relacion.campo_ref} no existe`)
          continue
        }
        
        // Verificar si el campo origen existe
        const { data: campoOrigen, error: campoOrigenError } = await supabase
          .from('information_schema.columns')
          .select('data_type')
          .eq('table_name', rel.tabla)
          .eq('column_name', relacion.campo)
          .eq('table_schema', 'public')
          .single()
        
        if (campoOrigenError) {
          console.log(`   ❌ Campo origen ${rel.tabla}.${relacion.campo} no existe`)
          continue
        }
        
        // Verificar compatibilidad de tipos
        const tipoOrigen = campoOrigen.data_type
        const tipoReferencia = campoRef.data_type
        
        if (tipoOrigen === tipoReferencia) {
          console.log(`   ✅ Compatible: ${tipoOrigen} = ${tipoReferencia}`)
        } else {
          console.log(`   ⚠️  Incompatible: ${tipoOrigen} ≠ ${tipoReferencia}`)
        }
        
        // Verificar si hay datos que violan la relación
        const { data: violaciones, error: violacionesError } = await supabase
          .from(rel.tabla)
          .select(relacion.campo)
          .not(relacion.campo, 'is', null)
          .limit(5)
        
        if (!violacionesError && violaciones && violaciones.length > 0) {
          console.log(`   📊 Datos de ejemplo en ${rel.tabla}.${relacion.campo}:`)
          violaciones.forEach(v => {
            console.log(`      - ${v[relacion.campo]} (${typeof v[relacion.campo]})`)
          })
        }
        
      } catch (error) {
        console.log(`   ❌ Error verificando relación:`, error.message)
      }
    }
  }
}

// ============================================================================
// FUNCIÓN PARA ANALIZAR PROBLEMAS ESPECÍFICOS
// ============================================================================
async function analizarProblemasEspecificos() {
  console.log('\n⚠️  ANALIZANDO PROBLEMAS ESPECÍFICOS...')
  
  // Problema 1: Verificar tipos de datos en surtidores
  console.log('\n--- PROBLEMA 1: TIPOS DE DATOS EN SURTIDORES ---')
  try {
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select('id, nombre, estado')
      .limit(3)
    
    if (surtidoresError) {
      console.log('❌ Error obteniendo surtidores:', surtidoresError.message)
    } else if (surtidores && surtidores.length > 0) {
      console.log('📊 Surtidores existentes:')
      surtidores.forEach(s => {
        console.log(`   - ID: ${s.id} (tipo: ${typeof s.id})`)
        console.log(`     Nombre: ${s.nombre}`)
        console.log(`     Estado: ${s.estado}`)
      })
    } else {
      console.log('⚠️  No hay surtidores en la base de datos')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // Problema 2: Verificar combustibles_surtidor
  console.log('\n--- PROBLEMA 2: COMBUSTIBLES POR SURTIDOR ---')
  try {
    const { data: combustibles, error: combustiblesError } = await supabase
      .from('combustibles_surtidor')
      .select('surtidor_id, tipo_combustible, stock, precio')
      .limit(5)
    
    if (combustiblesError) {
      console.log('❌ Error obteniendo combustibles:', combustiblesError.message)
    } else if (combustibles && combustibles.length > 0) {
      console.log('📊 Combustibles por surtidor:')
      combustibles.forEach(c => {
        console.log(`   - Surtidor ID: ${c.surtidor_id} (tipo: ${typeof c.surtidor_id})`)
        console.log(`     Tipo: ${c.tipo_combustible}`)
        console.log(`     Stock: ${c.stock}`)
        console.log(`     Precio: ${c.precio}`)
      })
    } else {
      console.log('⚠️  No hay combustibles por surtidor en la base de datos')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // Problema 3: Verificar configuracion_combustibles
  console.log('\n--- PROBLEMA 3: CONFIGURACIÓN GLOBAL DE COMBUSTIBLES ---')
  try {
    const { data: configCombustibles, error: configError } = await supabase
      .from('configuracion_combustibles')
      .select('*')
    
    if (configError) {
      console.log('❌ Error obteniendo configuración de combustibles:', configError.message)
    } else if (configCombustibles && configCombustibles.length > 0) {
      console.log('📊 Configuración global de combustibles:')
      configCombustibles.forEach(c => {
        console.log(`   - Tipo: ${c.tipo_combustible}`)
        console.log(`     Precio: ${c.precio_por_litro}`)
        console.log(`     Stock Total: ${c.stock_total}`)
        console.log(`     Stock Disponible: ${c.stock_disponible}`)
        console.log(`     Activo: ${c.activo}`)
      })
    } else {
      console.log('⚠️  No hay configuración global de combustibles')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // Problema 4: Verificar usuarios
  console.log('\n--- PROBLEMA 4: USUARIOS ---')
  try {
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('id, username, name, role, activo')
      .limit(5)
    
    if (usuariosError) {
      console.log('❌ Error obteniendo usuarios:', usuariosError.message)
    } else if (usuarios && usuarios.length > 0) {
      console.log('📊 Usuarios existentes:')
      usuarios.forEach(u => {
        console.log(`   - ID: ${u.id} (tipo: ${typeof u.id})`)
        console.log(`     Username: ${u.username}`)
        console.log(`     Nombre: ${u.name}`)
        console.log(`     Rol: ${u.role}`)
        console.log(`     Activo: ${u.activo}`)
      })
    } else {
      console.log('⚠️  No hay usuarios en la base de datos')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

// ============================================================================
// FUNCIÓN PARA ANALIZAR VISTAS Y FUNCIONES
// ============================================================================
async function analizarVistasYFunciones() {
  console.log('\n👁️  ANALIZANDO VISTAS Y FUNCIONES...')
  
  // Verificar vistas existentes
  try {
    const { data: vistas, error: vistasError } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (vistasError) {
      console.log('❌ Error obteniendo vistas:', vistasError.message)
    } else if (vistas && vistas.length > 0) {
      console.log('📊 Vistas existentes:')
      vistas.forEach(v => {
        console.log(`   - ${v.table_name}`)
      })
    } else {
      console.log('⚠️  No hay vistas en la base de datos')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // Verificar funciones existentes
  try {
    const { data: funciones, error: funcionesError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_schema', 'public')
    
    if (funcionesError) {
      console.log('❌ Error obteniendo funciones:', funcionesError.message)
    } else if (funciones && funciones.length > 0) {
      console.log('📊 Funciones existentes:')
      funciones.forEach(f => {
        console.log(`   - ${f.routine_name} (${f.routine_type})`)
      })
    } else {
      console.log('⚠️  No hay funciones en la base de datos')
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
    console.log('🔍 INICIANDO ANÁLISIS COMPLETO DE LA BASE DE DATOS...')
    
    // Paso 1: Analizar estructura de tablas
    await analizarEstructuraTablas()
    
    // Paso 2: Analizar conexiones y relaciones
    await analizarConexiones()
    
    // Paso 3: Analizar problemas específicos
    await analizarProblemasEspecificos()
    
    // Paso 4: Analizar vistas y funciones
    await analizarVistasYFunciones()
    
    console.log('\n🎉 ANÁLISIS COMPLETO FINALIZADO 🎉')
    console.log('📋 Revisa los resultados anteriores para identificar problemas')
    console.log('🔧 Los problemas identificados necesitarán corrección manual')
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error)
  }
}

// Ejecutar el análisis
main()

