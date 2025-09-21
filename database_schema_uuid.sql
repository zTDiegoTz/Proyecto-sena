-- Schema alternativo con UUIDs para la aplicación de Estación de Gasolina
-- Ejecuta este código en el editor SQL de Supabase

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de usuarios (estructura simplificada con UUID)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT,
  email TEXT UNIQUE,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de surtidores
CREATE TABLE IF NOT EXISTS surtidores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento', 'fuera_servicio')),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de combustibles (precios y stock por surtidor)
CREATE TABLE IF NOT EXISTS combustibles_surtidor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surtidor_id UUID REFERENCES surtidores(id) ON DELETE CASCADE,
  tipo_combustible VARCHAR(20) NOT NULL CHECK (tipo_combustible IN ('extra', 'corriente', 'acpm')),
  precio DECIMAL(10,2) NOT NULL,
  stock DECIMAL(10,3) NOT NULL DEFAULT 0,
  vendido DECIMAL(10,3) NOT NULL DEFAULT 0,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(surtidor_id, tipo_combustible)
);

-- 4. Tabla de configuración global (precios base)
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
  surtidor_id UUID REFERENCES surtidores(id) ON DELETE CASCADE,
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

-- Insertar usuarios iniciales (con los datos que proporcionaste)
INSERT INTO users (id, name, role, username, password_hash, email) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'Administrador', 'admin', 'admin123', 'admin@estacion.com'),
('22222222-2222-2222-2222-222222222222', 'gerente', 'Gerente', 'gerente', 'gerente123', 'gerente@estacion.com'),
('33333333-3333-3333-3333-333333333333', 'bombero1', 'Bombero', 'bombero1', 'bombero123', 'juan@estacion.com')
ON CONFLICT (id) DO NOTHING;

-- Insertar surtidores iniciales con UUIDs fijos
INSERT INTO surtidores (id, nombre) VALUES
('44444444-4444-4444-4444-444444444441', 'Surtidor 1'),
('44444444-4444-4444-4444-444444444442', 'Surtidor 2'),
('44444444-4444-4444-4444-444444444443', 'Surtidor 3'),
('44444444-4444-4444-4444-444444444444', 'Surtidor 4'),
('44444444-4444-4444-4444-444444444445', 'Surtidor 5'),
('44444444-4444-4444-4444-444444444446', 'Surtidor 6')
ON CONFLICT (id) DO NOTHING;

-- Combustibles por surtidor (precios iniciales)
INSERT INTO combustibles_surtidor (surtidor_id, tipo_combustible, precio, stock) VALUES
-- Surtidor 1
('44444444-4444-4444-4444-444444444441', 'extra', 12500.00, 1000.000),
('44444444-4444-4444-4444-444444444441', 'corriente', 11500.00, 1000.000),
('44444444-4444-4444-4444-444444444441', 'acpm', 10500.00, 1000.000),
-- Surtidor 2
('44444444-4444-4444-4444-444444444442', 'extra', 12500.00, 1000.000),
('44444444-4444-4444-4444-444444444442', 'corriente', 11500.00, 1000.000),
('44444444-4444-4444-4444-444444444442', 'acpm', 10500.00, 1000.000),
-- Surtidor 3
('44444444-4444-4444-4444-444444444443', 'extra', 12500.00, 1000.000),
('44444444-4444-4444-4444-444444444443', 'corriente', 11500.00, 1000.000),
('44444444-4444-4444-4444-444444444443', 'acpm', 10500.00, 1000.000),
-- Surtidor 4
('44444444-4444-4444-4444-444444444444', 'extra', 12500.00, 1000.000),
('44444444-4444-4444-4444-444444444444', 'corriente', 11500.00, 1000.000),
('44444444-4444-4444-4444-444444444444', 'acpm', 10500.00, 1000.000),
-- Surtidor 5
('44444444-4444-4444-4444-444444444445', 'extra', 12500.00, 1000.000),
('44444444-4444-4444-4444-444444444445', 'corriente', 11500.00, 1000.000),
('44444444-4444-4444-4444-444444444445', 'acpm', 10500.00, 1000.000),
-- Surtidor 6
('44444444-4444-4444-4444-444444444446', 'extra', 12500.00, 1000.000),
('44444444-4444-4444-4444-444444444446', 'corriente', 11500.00, 1000.000),
('44444444-4444-4444-4444-444444444446', 'acpm', 10500.00, 1000.000)
ON CONFLICT (surtidor_id, tipo_combustible) DO NOTHING;

-- Configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('precios_base', '{"extra": 12500, "corriente": 11500, "acpm": 10500}', 'Precios base de combustibles'),
('configuracion_general', '{"moneda": "COP", "iva": 19}', 'Configuración general del sistema')
ON CONFLICT (clave) DO NOTHING;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_ventas_bombero ON ventas(bombero_id);
CREATE INDEX IF NOT EXISTS idx_ventas_surtidor ON ventas(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_turnos_bombero ON turnos(bombero_id);
CREATE INDEX IF NOT EXISTS idx_turnos_activo ON turnos(activo);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a las tablas que lo necesiten
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surtidores_updated_at BEFORE UPDATE ON surtidores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_combustibles_updated_at BEFORE UPDATE ON combustibles_surtidor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) - opcional pero recomendado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE surtidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE combustibles_surtidor ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS
CREATE POLICY "Usuarios autenticados pueden leer users" ON users FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer surtidores" ON surtidores FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer combustibles" ON combustibles_surtidor FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer configuración" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer turnos" ON turnos FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer ventas" ON ventas FOR SELECT USING (true);

-- Para escritura, políticas permisivas (puedes ajustarlas según tus necesidades)
CREATE POLICY "Administradores pueden escribir en users" ON users FOR ALL USING (true);
CREATE POLICY "Administradores pueden escribir surtidores" ON surtidores FOR ALL USING (true);
CREATE POLICY "Administradores pueden escribir combustibles" ON combustibles_surtidor FOR ALL USING (true);
CREATE POLICY "Administradores pueden escribir configuración" ON configuracion FOR ALL USING (true);
CREATE POLICY "Usuarios pueden escribir turnos" ON turnos FOR ALL USING (true);
CREATE POLICY "Usuarios pueden escribir ventas" ON ventas FOR ALL USING (true);
