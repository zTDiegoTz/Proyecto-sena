import { createClient } from '@supabase/supabase-js'

// ✅ CONFIGURACIÓN ACTUALIZADA CON TUS CREDENCIALES REALES

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'

// 🔑 Tu clave API real:
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función de prueba simple
export const testSimpleConnection = async () => {
  try {
    console.log('🔄 Probando conexión a Supabase...')
    console.log('📍 URL:', supabaseUrl)
    console.log('🔑 Key length:', supabaseAnonKey.length)
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error:', error)
      throw error
    }
    
    console.log('✅ Conexión exitosa:', data)
    return { success: true, data }
  } catch (error) {
    console.error('💥 Error completo:', error)
    return { 
      success: false, 
      message: error.message,
      details: error
    }
  }
}
