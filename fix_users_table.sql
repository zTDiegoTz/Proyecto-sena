-- Script para arreglar la tabla users
-- Ejecutar en Supabase SQL Editor

-- Verificar estructura actual de la tabla users
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Agregar columna activo si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Actualizar todos los usuarios existentes para que estén activos
UPDATE users SET activo = true WHERE activo IS NULL;

-- Verificar la estructura final
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar datos de usuarios
SELECT id, name, username, role, activo FROM users;
