-- ESQUEMA COMPLETO PARA ESTACIÓN DE GASOLINA EN SUPABASE
-- Ejecuta este código completo en el SQL Editor de Supabase

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de usuarios (ya tienes esta, pero vamos a asegurar los campos necesarios)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT UNIQUE,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de surtidores
CREATE TABLE IF NOT EXISTS surtidores (
  id BIGINT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento', 'fuera_servicio')),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de combustibles (precios y stock por surtidor)
CREATE TABLE IF NOT EXISTS combustibles_surtidor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surtidor_id BIGINT REFERENCES surtidores(id) ON DELETE CASCADE,
  tipo_combustible VARCHAR(20) NOT NULL CHECK (tipo_combustible IN ('extra', 'corriente', 'acpm')),
  precio DECIMAL(10,2) NOT NULL,
  stock DECIMAL(10,3) NOT NULL DEFAULT 0,
  vendido DECIMAL(10,3) NOT NULL DEFAULT 0,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(surtidor_id, tipo_combustible)
);

-- 4. Tabla de configuración global
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave VARCHAR(50) UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  descripcion TEXT,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bombero_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bombero_nombre VARCHAR(100) NOT NULL,
  hora_entrada TIMESTAMPTZ NOT NULL,
  hora_salida TIMESTAMPTZ,
  activo BOOLEAN DEFAULT TRUE,
  observaciones TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surtidor_id BIGINT REFERENCES surtidores(id) ON DELETE CASCADE,
  surtidor_nombre VARCHAR(50) NOT NULL,
  tipo_combustible VARCHAR(20) NOT NULL CHECK (tipo_combustible IN ('extra', 'corriente', 'acpm')),
  cantidad DECIMAL(10,3) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  bombero_id UUID REFERENCES users(id) ON DELETE SET NULL,
  bombero_nombre VARCHAR(100),
  turno_id UUID REFERENCES turnos(id) ON DELETE SET NULL,
  fecha_hora TIMESTAMPTZ DEFAULT NOW(),
  observaciones TEXT
);

-- DATOS INICIALES

-- Actualizar usuarios existentes (agregar campos faltantes si no existen)
-- Primero verificamos si los usuarios ya tienen username y password
UPDATE users SET 
  username = COALESCE(username, LOWER(name)),
  password_hash = COALESCE(password_hash, 
    CASE 
      WHEN name = 'admin' THEN 'admin123'
      WHEN name = 'gerente' THEN 'gerente123'
      WHEN name = 'bombero1' THEN 'bombero123'
      ELSE 'password123'
    END
  ),
  email = COALESCE(email, LOWER(name) || '@estacion.com')
WHERE username IS NULL OR password_hash IS NULL OR email IS NULL;

-- Insertar usuarios adicionales si no existen
INSERT INTO users (id, username, password_hash, name, role, email) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'admin123', 'admin', 'super_admin', 'admin@estacion.com'),
('22222222-2222-2222-2222-222222222222', 'gerente', 'gerente123', 'gerente', 'administrador', 'gerente@estacion.com'),
('33333333-3333-3333-3333-333333333333', 'bombero1', 'bombero123', 'bombero1', 'bombero', 'juan@estacion.com')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  email = EXCLUDED.email;

-- Surtidores iniciales
INSERT INTO surtidores (id, nombre) VALUES
(1, 'Surtidor 1'),
(2, 'Surtidor 2'),
(3, 'Surtidor 3'),
(4, 'Surtidor 4'),
(5, 'Surtidor 5'),
(6, 'Surtidor 6')
ON CONFLICT (id) DO NOTHING;

-- Combustibles por surtidor (precios iniciales)
INSERT INTO combustibles_surtidor (surtidor_id, tipo_combustible, precio, stock) VALUES
-- Surtidor 1
(1, 'extra', 12500.00, 1000.000),
(1, 'corriente', 11500.00, 1000.000),
(1, 'acpm', 10500.00, 1000.000),
-- Surtidor 2
(2, 'extra', 12500.00, 1000.000),
(2, 'corriente', 11500.00, 1000.000),
(2, 'acpm', 10500.00, 1000.000),
-- Surtidor 3
(3, 'extra', 12500.00, 1000.000),
(3, 'corriente', 11500.00, 1000.000),
(3, 'acpm', 10500.00, 1000.000),
-- Surtidor 4
(4, 'extra', 12500.00, 1000.000),
(4, 'corriente', 11500.00, 1000.000),
(4, 'acpm', 10500.00, 1000.000),
-- Surtidor 5
(5, 'extra', 12500.00, 1000.000),
(5, 'corriente', 11500.00, 1000.000),
(5, 'acpm', 10500.00, 1000.000),
-- Surtidor 6
(6, 'extra', 12500.00, 1000.000),
(6, 'corriente', 11500.00, 1000.000),
(6, 'acpm', 10500.00, 1000.000)
ON CONFLICT (surtidor_id, tipo_combustible) DO NOTHING;

-- Configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('precios_base', '{"extra": 12500, "corriente": 11500, "acpm": 10500}', 'Precios base de combustibles'),
('configuracion_general', '{"moneda": "COP", "iva": 19}', 'Configuración general del sistema')
ON CONFLICT (clave) DO NOTHING;

-- FUNCIONES AUXILIARES

-- Función para actualizar stock cuando se realiza una venta
CREATE OR REPLACE FUNCTION actualizar_stock_venta(
  p_surtidor_id BIGINT,
  p_tipo_combustible VARCHAR(20),
  p_cantidad DECIMAL(10,3)
)
RETURNS VOID AS $$
BEGIN
  UPDATE combustibles_surtidor 
  SET 
    stock = stock - p_cantidad,
    vendido = vendido + p_cantidad,
    fecha_actualizacion = NOW()
  WHERE 
    surtidor_id = p_surtidor_id 
    AND tipo_combustible = p_tipo_combustible;
    
  -- Verificar que hay suficiente stock
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el combustible especificado';
  END IF;
  
  -- Verificar que el stock no sea negativo
  IF (SELECT stock FROM combustibles_surtidor 
      WHERE surtidor_id = p_surtidor_id AND tipo_combustible = p_tipo_combustible) < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente para realizar la venta';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a las tablas que lo necesiten
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_surtidores_updated_at ON surtidores;
CREATE TRIGGER update_surtidores_updated_at BEFORE UPDATE ON surtidores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_combustibles_updated_at ON combustibles_surtidor;
CREATE TRIGGER update_combustibles_updated_at BEFORE UPDATE ON combustibles_surtidor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuracion_updated_at ON configuracion;
CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_ventas_bombero ON ventas(bombero_id);
CREATE INDEX IF NOT EXISTS idx_ventas_surtidor ON ventas(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_turnos_bombero ON turnos(bombero_id);
CREATE INDEX IF NOT EXISTS idx_turnos_activo ON turnos(activo);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- DESHABILITAR RLS PARA DESARROLLO (en producción configurar políticas apropiadas)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE surtidores DISABLE ROW LEVEL SECURITY;
ALTER TABLE combustibles_surtidor DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE turnos DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;

-- Verificar que todo se creó correctamente
SELECT 'Usuarios' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'Surtidores' as tabla, COUNT(*) as registros FROM surtidores
UNION ALL
SELECT 'Combustibles' as tabla, COUNT(*) as registros FROM combustibles_surtidor
UNION ALL
SELECT 'Configuración' as tabla, COUNT(*) as registros FROM configuracion;
