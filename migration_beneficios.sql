-- Migración: Agregar columnas beneficios y cant_usuarios a la tabla planes
-- Ejecutar este script en tu cliente MySQL

USE bd_cx_ms_pagos;

-- Agregar columna beneficios (compatible con MySQL 5.7 y anteriores)
ALTER TABLE planes ADD COLUMN beneficios JSON AFTER descripcion;

-- Agregar columna cant_usuarios para límite de usuarios por plan
ALTER TABLE planes ADD COLUMN cant_usuarios INT DEFAULT 1 AFTER beneficios;

-- Actualizar planes existentes con beneficios y límites de usuarios
UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso básico', 'Soporte por email', '5 proyectos', 'Almacenamiento 10GB'),
    cant_usuarios = 1
WHERE nombre = 'Plan Standard';

UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso completo', 'Soporte prioritario', '25 proyectos', 'Almacenamiento 100GB', 'Colaboradores ilimitados'),
    cant_usuarios = 10
WHERE nombre = 'Plan Business';

UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso premium', 'Soporte 24/7', 'Proyectos ilimitados', 'Almacenamiento 1TB', 'API dedicada', 'Backup automático'),
    cant_usuarios = -1
WHERE nombre = 'Plan Enterprise';

-- Verificar que la migración fue exitosa
SELECT id, nombre, precio, frecuencia, descripcion, beneficios, cant_usuarios FROM planes;
