-- Crear base de datos
CREATE DATABASE IF NOT EXISTS bd_cx_ms_pagos DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bd_cx_ms_pagos;

-- Tabla: planes
CREATE TABLE IF NOT EXISTS planes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  frecuencia ENUM('mensual', 'anual') NOT NULL,
  descripcion TEXT,
  beneficios JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pre-carga de planes
INSERT INTO planes (nombre, precio, frecuencia, descripcion, beneficios) VALUES
  ('Plan Standard',   29.90, 'mensual',  'Ideal para uso básico', 
   JSON_ARRAY('Acceso básico', 'Soporte por email', '5 proyectos', 'Almacenamiento 10GB')),
  ('Plan Business',   59.90, 'mensual',  'Para pequeñas empresas', 
   JSON_ARRAY('Acceso completo', 'Soporte prioritario', '25 proyectos', 'Almacenamiento 100GB', 'Colaboradores ilimitados')),
  ('Plan Enterprise',99.90, 'mensual',  'Para organizaciones grandes', 
   JSON_ARRAY('Acceso premium', 'Soporte 24/7', 'Proyectos ilimitados', 'Almacenamiento 1TB', 'API dedicada', 'Backup automático'));

-- Migración para bases de datos existentes: Agregar columna beneficios
ALTER TABLE planes ADD COLUMN IF NOT EXISTS beneficios JSON AFTER descripcion;

-- Actualizar planes existentes con beneficios por defecto (solo si no tienen beneficios)
UPDATE planes SET beneficios = JSON_ARRAY('Acceso básico', 'Soporte por email', '5 proyectos', 'Almacenamiento 10GB') 
WHERE nombre = 'Plan Standard' AND (beneficios IS NULL OR JSON_LENGTH(beneficios) = 0);

UPDATE planes SET beneficios = JSON_ARRAY('Acceso completo', 'Soporte prioritario', '25 proyectos', 'Almacenamiento 100GB', 'Colaboradores ilimitados') 
WHERE nombre = 'Plan Business' AND (beneficios IS NULL OR JSON_LENGTH(beneficios) = 0);

UPDATE planes SET beneficios = JSON_ARRAY('Acceso premium', 'Soporte 24/7', 'Proyectos ilimitados', 'Almacenamiento 1TB', 'API dedicada', 'Backup automático') 
WHERE nombre = 'Plan Enterprise' AND (beneficios IS NULL OR JSON_LENGTH(beneficios) = 0);

-- Tabla: pagos
CREATE TABLE IF NOT EXISTS pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  plan_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(5) NOT NULL DEFAULT 'PEN',
  estado ENUM('pending', 'approved', 'rejected') NOT NULL,
  metodo_pago VARCHAR(30),
  referencia_ext VARCHAR(100),
  fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_usuario_id (usuario_id),
  INDEX idx_fecha_pago (fecha_pago),
  INDEX idx_estado (estado),
  INDEX idx_referencia_ext (referencia_ext),
  FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE RESTRICT
);

-- Tabla: suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  plan_id INT NOT NULL,
  estado ENUM('activa', 'vencida', 'cancelada') NOT NULL DEFAULT 'activa',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  renovacion_automatica BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_usuario_id (usuario_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_fin (fecha_fin),
  UNIQUE KEY unique_usuario_activa (usuario_id, estado),
  FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE RESTRICT,
  
  CONSTRAINT check_fechas CHECK (fecha_fin > fecha_inicio)
);

-- Vistas útiles
CREATE OR REPLACE VIEW vista_suscripciones_activas AS
SELECT 
  s.id,
  s.usuario_id,
  s.plan_id,
  p.nombre as plan_nombre,
  p.precio,
  p.frecuencia,
  s.fecha_inicio,
  s.fecha_fin,
  s.renovacion_automatica,
  DATEDIFF(s.fecha_fin, CURDATE()) as dias_restantes
FROM suscripciones s
JOIN planes p ON s.plan_id = p.id
WHERE s.estado = 'activa';

CREATE OR REPLACE VIEW vista_pagos_detallados AS
SELECT 
  p.id,
  p.usuario_id,
  p.plan_id,
  pl.nombre as plan_nombre,
  p.monto,
  p.moneda,
  p.estado,
  p.metodo_pago,
  p.referencia_ext,
  p.fecha_pago,
  MONTHNAME(p.fecha_pago) as mes_pago,
  YEAR(p.fecha_pago) as año_pago
FROM pagos p
JOIN planes pl ON p.plan_id = pl.id;
