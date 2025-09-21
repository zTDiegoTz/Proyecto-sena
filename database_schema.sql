-- Schema para la aplicación de Estación de Gasolina
-- Ejecuta este código en el editor SQL de Supabase

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('super_admin', 'administrador', 'bombero')),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de surtidores
CREATE TABLE IF NOT EXISTS surtidores (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento', 'fuera_servicio')),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de combustibles (precios y stock por surtidor)
CREATE TABLE IF NOT EXISTS combustibles_surtidor (
  id BIGSERIAL PRIMARY KEY,
  surtidor_id BIGINT REFERENCES surtidores(id) ON DELETE CASCADE,
  tipo_combustible VARCHAR(20) NOT NULL CHECK (tipo_combustible IN ('extra', 'corriente', 'acpm')),
  precio DECIMAL(10,2) NOT NULL,
  stock DECIMAL(10,3) NOT NULL DEFAULT 0,
  vendido DECIMAL(10,3) NOT NULL DEFAULT 0,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(surtidor_id, tipo_combustible)
);

-- 4. Tabla de configuración global (precios base)
CREATE TABLE IF NOT EXISTS configuracion (
  id BIGSERIAL PRIMARY KEY,
  clave VARCHAR(50) UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  descripcion TEXT,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
  id BIGSERIAL PRIMARY KEY,
  bombero_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
  bombero_nombre VARCHAR(100) NOT NULL,
  hora_entrada TIMESTAMPTZ NOT NULL,
  hora_salida TIMESTAMPTZ,
  activo BOOLEAN DEFAULT TRUE,
  observaciones TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id BIGSERIAL PRIMARY KEY,
  surtidor_id BIGINT REFERENCES surtidores(id) ON DELETE CASCADE,
  surtidor_nombre VARCHAR(50) NOT NULL,
  tipo_combustible VARCHAR(20) NOT NULL CHECK (tipo_combustible IN ('extra', 'corriente', 'acpm')),
  cantidad DECIMAL(10,3) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  bombero_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  bombero_nombre VARCHAR(100),
  turno_id BIGINT REFERENCES turnos(id) ON DELETE SET NULL,
  fecha_hora TIMESTAMPTZ DEFAULT NOW(),
  observaciones TEXT
);

-- Insertar datos iniciales

-- Usuarios iniciales
INSERT INTO usuarios (username, password_hash, nombre, email, rol) VALUES
('admin', 'admin123', 'Administrador Principal', 'admin@estacion.com', 'super_admin'),
('gerente', 'gerente123', 'Gerente de Estación', 'gerente@estacion.com', 'administrador'),
('bombero1', 'bombero123', 'Juan Pérez', 'juan@estacion.com', 'bombero')
ON CONFLICT (username) DO NOTHING;

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

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_ventas_bombero ON ventas(bombero_id);
CREATE INDEX IF NOT EXISTS idx_ventas_surtidor ON ventas(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_turnos_bombero ON turnos(bombero_id);
CREATE INDEX IF NOT EXISTS idx_turnos_activo ON turnos(activo);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a las tablas que lo necesiten
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surtidores_updated_at BEFORE UPDATE ON surtidores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_combustibles_updated_at BEFORE UPDATE ON combustibles_surtidor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) - opcional pero recomendado
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE surtidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE combustibles_surtidor ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS (puedes ajustarlas según tus necesidades)
-- Permitir lectura y escritura para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer todos los datos" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer surtidores" ON surtidores FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer combustibles" ON combustibles_surtidor FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer configuración" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer turnos" ON turnos FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados pueden leer ventas" ON ventas FOR SELECT USING (true);

-- Para escritura, puedes agregar políticas más específicas según roles
CREATE POLICY "Administradores pueden escribir en todas las tablas" ON usuarios FOR ALL USING (true);
CREATE POLICY "Administradores pueden escribir surtidores" ON surtidores FOR ALL USING (true);
CREATE POLICY "Administradores pueden escribir combustibles" ON combustibles_surtidor FOR ALL USING (true);
CREATE POLICY "Administradores pueden escribir configuración" ON configuracion FOR ALL USING (true);
CREATE POLICY "Usuarios pueden escribir turnos" ON turnos FOR ALL USING (true);
CREATE POLICY "Usuarios pueden escribir ventas" ON ventas FOR ALL USING (true);
