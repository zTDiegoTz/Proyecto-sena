-- =====================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS - ESTACIÓN DE GASOLINA
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'administrador', 'bombero')),
  email VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA DE SURTIDORES
-- =====================================================
CREATE TABLE IF NOT EXISTS surtidores (
  id BIGINT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento', 'fuera_servicio')),
  ubicacion VARCHAR(100),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA DE COMBUSTIBLES POR SURTIDOR
-- =====================================================
CREATE TABLE IF NOT EXISTS combustibles_surtidor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surtidor_id BIGINT NOT NULL REFERENCES surtidores(id) ON DELETE CASCADE,
  tipo_combustible VARCHAR(20) NOT NULL CHECK (tipo_combustible IN ('extra', 'corriente', 'acpm')),
  stock DECIMAL(10,3) NOT NULL DEFAULT 0, -- En litros
  vendido DECIMAL(10,3) NOT NULL DEFAULT 0, -- En litros
  precio DECIMAL(10,2) NOT NULL DEFAULT 0, -- Precio por galón
  capacidad_maxima DECIMAL(10,3) NOT NULL DEFAULT 1000, -- Capacidad del tanque en litros
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(surtidor_id, tipo_combustible)
);

-- =====================================================
-- 4. TABLA DE TURNOS
-- =====================================================
CREATE TABLE IF NOT EXISTS turnos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bombero_id UUID NOT NULL REFERENCES users(id),
  bombero_nombre VARCHAR(100) NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado')),
  observaciones TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TABLA DE VENTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información del surtidor
  surtidor_id BIGINT NOT NULL REFERENCES surtidores(id),
  surtidor_nombre VARCHAR(100) NOT NULL,
  
  -- Información del bombero
  bombero_id UUID NOT NULL REFERENCES users(id),
  bombero_nombre VARCHAR(100) NOT NULL,
  
  -- Información del combustible
  tipo_combustible VARCHAR(20) NOT NULL CHECK (tipo_combustible IN ('extra', 'corriente', 'acpm')),
  cantidad DECIMAL(10,3) NOT NULL, -- Cantidad en litros (para stock)
  cantidad_galones DECIMAL(10,3) NOT NULL, -- Cantidad en galones (para mostrar)
  precio_por_galon DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL, -- Precio por litro (para cálculos)
  
  -- Información financiera
  valor_total DECIMAL(12,2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'credito')),
  
  -- Información del cliente (opcional)
  cliente_nombre VARCHAR(100),
  cliente_documento VARCHAR(20),
  placa_vehiculo VARCHAR(10),
  
  -- Información del turno
  turno_id UUID REFERENCES turnos(id),
  
  -- Timestamps
  fecha_venta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TABLA DE CONFIGURACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave VARCHAR(50) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(20) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA DE INVENTARIO (HISTÓRICO)
-- =====================================================
CREATE TABLE IF NOT EXISTS inventario_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surtidor_id BIGINT NOT NULL REFERENCES surtidores(id),
  tipo_combustible VARCHAR(20) NOT NULL,
  stock_anterior DECIMAL(10,3) NOT NULL,
  stock_nuevo DECIMAL(10,3) NOT NULL,
  diferencia DECIMAL(10,3) NOT NULL,
  motivo VARCHAR(100) NOT NULL, -- 'venta', 'reposicion', 'ajuste', 'mantenimiento'
  usuario_id UUID REFERENCES users(id),
  observaciones TEXT,
  fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 8. TABLA DE PRECIOS (HISTÓRICO)
-- =====================================================
CREATE TABLE IF NOT EXISTS precios_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_combustible VARCHAR(20) NOT NULL,
  precio_anterior DECIMAL(10,2) NOT NULL,
  precio_nuevo DECIMAL(10,2) NOT NULL,
  usuario_id UUID REFERENCES users(id),
  motivo VARCHAR(100),
  fecha_cambio TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 9. TABLA DE REPORTES
-- =====================================================
CREATE TABLE IF NOT EXISTS reportes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_reporte VARCHAR(50) NOT NULL, -- 'ventas_diarias', 'inventario', 'turnos', etc.
  parametros JSONB, -- Parámetros del reporte (fechas, filtros, etc.)
  resultado JSONB, -- Resultado del reporte
  usuario_id UUID REFERENCES users(id),
  fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 10. TABLA DE AUDITORÍA
-- =====================================================
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabla_afectada VARCHAR(50) NOT NULL,
  accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id VARCHAR(100) NOT NULL,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  fecha_accion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_activo ON users(activo);

-- Índices para surtidores
CREATE INDEX IF NOT EXISTS idx_surtidores_estado ON surtidores(estado);

-- Índices para combustibles_surtidor
CREATE INDEX IF NOT EXISTS idx_combustibles_surtidor_id ON combustibles_surtidor(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_combustibles_tipo ON combustibles_surtidor(tipo_combustible);

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_ventas_surtidor_id ON ventas(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_ventas_bombero_id ON ventas(bombero_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_venta ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_tipo_combustible ON ventas(tipo_combustible);
CREATE INDEX IF NOT EXISTS idx_ventas_metodo_pago ON ventas(metodo_pago);

-- Índices para turnos
CREATE INDEX IF NOT EXISTS idx_turnos_bombero_id ON turnos(bombero_id);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_inicio ON turnos(fecha_inicio);

-- Índices para configuración
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON configuracion(clave);

-- Índices para inventario_historico
CREATE INDEX IF NOT EXISTS idx_inventario_surtidor_id ON inventario_historico(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_inventario_fecha ON inventario_historico(fecha_movimiento);

-- Índices para precios_historico
CREATE INDEX IF NOT EXISTS idx_precios_tipo ON precios_historico(tipo_combustible);
CREATE INDEX IF NOT EXISTS idx_precios_fecha ON precios_historico(fecha_cambio);

-- Índices para reportes
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON reportes(tipo_reporte);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha_generacion);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);

-- =====================================================
-- FUNCIONES DE ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER trigger_users_actualizar_fecha
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_surtidores_actualizar_fecha
  BEFORE UPDATE ON surtidores
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_combustibles_actualizar_fecha
  BEFORE UPDATE ON combustibles_surtidor
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_ventas_actualizar_fecha
  BEFORE UPDATE ON ventas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_turnos_actualizar_fecha
  BEFORE UPDATE ON turnos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_configuracion_actualizar_fecha
  BEFORE UPDATE ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR STOCK EN VENTAS
-- =====================================================
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

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontro el combustible especificado';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar usuarios iniciales
INSERT INTO users (id, username, password_hash, name, role, email, activo) VALUES
  (uuid_generate_v4(), 'admin', 'admin123', 'Administrador Principal', 'super_admin', 'admin@estacion.com', true),
  (uuid_generate_v4(), 'gerente', 'gerente123', 'Gerente de Estación', 'administrador', 'gerente@estacion.com', true),
  (uuid_generate_v4(), 'bombero1', 'bombero123', 'Juan Pérez', 'bombero', 'juan@estacion.com', true)
ON CONFLICT (username) DO NOTHING;

-- Insertar surtidor inicial
INSERT INTO surtidores (id, nombre, estado, ubicacion) VALUES
  (1, 'Surtidor 1', 'disponible', 'Entrada principal')
ON CONFLICT (id) DO NOTHING;

-- Insertar combustibles para el surtidor
INSERT INTO combustibles_surtidor (surtidor_id, tipo_combustible, stock, precio, capacidad_maxima) VALUES
  (1, 'extra', 1000, 12500, 1000),
  (1, 'corriente', 1000, 12000, 1000),
  (1, 'acpm', 1000, 11000, 1000)
ON CONFLICT (surtidor_id, tipo_combustible) DO NOTHING;

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, descripcion, tipo) VALUES
  ('precio_extra', '12500', 'Precio por galón de gasolina extra', 'number'),
  ('precio_corriente', '12000', 'Precio por galón de gasolina corriente', 'number'),
  ('precio_acpm', '11000', 'Precio por galón de ACPM', 'number'),
  ('nombre_estacion', 'Estación de Gasolina SENA', 'Nombre de la estación', 'string'),
  ('direccion_estacion', 'Calle 123 #45-67', 'Dirección de la estación', 'string'),
  ('telefono_estacion', '300-123-4567', 'Teléfono de la estación', 'string')
ON CONFLICT (clave) DO NOTHING;

-- =====================================================
-- DESHABILITAR RLS PARA DESARROLLO
-- =====================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE surtidores DISABLE ROW LEVEL SECURITY;
ALTER TABLE combustibles_surtidor DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE turnos DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE precios_historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE reportes DISABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Esquema de base de datos creado exitosamente' as mensaje;
