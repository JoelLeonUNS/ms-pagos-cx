-- Script para corregir datos de beneficios en la tabla planes
-- Ejecutar este script para limpiar datos corruptos en la columna beneficios

USE bd_cx_ms_pagos;

-- Primero, revisar los datos actuales
SELECT id, nombre, beneficios, cant_usuarios FROM planes;

-- Limpiar datos corruptos y establecer valores por defecto
UPDATE planes SET beneficios = NULL WHERE beneficios IS NOT NULL AND beneficios != '' AND beneficios NOT LIKE '[%';

-- Actualizar planes con beneficios por defecto según el tipo
UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso basico', 'Soporte por email', '5 proyectos', 'Almacenamiento 10GB'),
    cant_usuarios = COALESCE(cant_usuarios, 1)
WHERE nombre LIKE '%Standard%' AND (beneficios IS NULL OR beneficios = '');

UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso completo', 'Soporte prioritario', '25 proyectos', 'Almacenamiento 100GB', 'Colaboradores ilimitados'),
    cant_usuarios = COALESCE(cant_usuarios, 10)
WHERE nombre LIKE '%Business%' AND (beneficios IS NULL OR beneficios = '');

UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso premium', 'Soporte 24/7', 'Proyectos ilimitados', 'Almacenamiento 1TB', 'API dedicada', 'Backup automatico'),
    cant_usuarios = COALESCE(cant_usuarios, -1)
WHERE nombre LIKE '%Enterprise%' AND (beneficios IS NULL OR beneficios = '');

UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso premium', 'Soporte 24/7', 'Proyectos ilimitados', 'Almacenamiento 1TB', 'API dedicada', 'Backup automatico'),
    cant_usuarios = COALESCE(cant_usuarios, -1)
WHERE nombre LIKE '%Premium%' AND (beneficios IS NULL OR beneficios = '');

-- Para cualquier plan que no tenga beneficios definidos, asignar un valor por defecto
UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso basico', 'Soporte incluido'),
    cant_usuarios = COALESCE(cant_usuarios, 1)
WHERE beneficios IS NULL OR beneficios = '';

-- Verificar que todos los planes tengan beneficios válidos y cant_usuarios
SELECT id, nombre, beneficios, cant_usuarios, JSON_VALID(beneficios) as is_valid_json FROM planes;
