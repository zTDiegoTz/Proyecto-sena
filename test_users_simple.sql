-- Prueba simple con la estructura que solicitas
-- Ejecuta esto en el editor SQL de Supabase

-- Habilitar extensión para UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la tabla users tal como la solicitas
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT
);

-- Insertar los datos que proporcionaste
INSERT INTO users (id, name, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Administrador'),
  ('22222222-2222-2222-2222-222222222222', 'gerente', 'Gerente'),
  ('33333333-3333-3333-3333-333333333333', 'bombero1', 'Bombero')
ON CONFLICT (id) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT * FROM users ORDER BY name;
