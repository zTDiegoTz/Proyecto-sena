import { createClient } from '@supabase/supabase-js'

// ✅ Configuración de Supabase - CREDENCIALES CORRECTAS
// Tu project reference: adbzfiepkxtyqudwfysk
const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funciones auxiliares para manejo de errores
export const handleSupabaseError = (error) => {
  console.error('Error de Supabase:', error)
  return {
    success: false,
    message: error.message || 'Error en la base de datos'
  }
}

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (error) throw error
    
    return { success: true, message: 'Conexión exitosa' }
  } catch (error) {
    return handleSupabaseError(error)
  }
}
