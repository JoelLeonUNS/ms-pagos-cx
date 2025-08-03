-- Migración: Agregar columna beneficios a la tabla planes
-- Ejecutar este script en tu cliente MySQL

USE bd_cx_ms_pagos;

-- Agregar columna beneficios
ALTER TABLE planes ADD COLUMN IF NOT EXISTS beneficios JSON AFTER descripcion;

-- Actualizar planes existentes con beneficios por defecto
UPDATE planes SET beneficios = JSON_ARRAY('Acceso básico', 'Soporte por email', '5 proyectos', 'Almacenamiento 10GB') 
WHERE nombre = 'Plan Standard' AND (beneficios IS NULL OR JSON_LENGTH(beneficios) = 0);

UPDATE planes SET beneficios = JSON_ARRAY('Acceso completo', 'Soporte prioritario', '25 proyectos', 'Almacenamiento 100GB', 'Colaboradores ilimitados') 
WHERE nombre = 'Plan Business' AND (beneficios IS NULL OR JSON_LENGTH(beneficios) = 0);

UPDATE planes SET beneficios = JSON_ARRAY('Acceso premium', 'Soporte 24/7', 'Proyectos ilimitados', 'Almacenamiento 1TB', 'API dedicada', 'Backup automático') 
WHERE nombre = 'Plan Enterprise' AND (beneficios IS NULL OR JSON_LENGTH(beneficios) = 0);

-- Verificar que la migración fue exitosa
SELECT id, nombre, precio, frecuencia, descripcion, beneficios FROM planes;
