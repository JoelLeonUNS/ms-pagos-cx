-- Migración: Agregar columnas beneficios y cant_usuarios a la tabla planes
-- Ejecutar este script en tu cliente MySQL

USE bd_cx_ms_pagos;

-- Verificar estructura actual antes de la migración
SELECT 'Estructura ANTES de la migración:' as info;
DESCRIBE planes;

-- Agregar columna beneficios (compatible con MySQL 5.7 y anteriores)
-- Usar procedimiento para evitar errores si la columna ya existe
DELIMITER $$
CREATE PROCEDURE AddBeneficiosColumn()
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLSTATE '42S21' BEGIN END;
    ALTER TABLE planes ADD COLUMN beneficios JSON AFTER descripcion;
END$$
DELIMITER ;

CALL AddBeneficiosColumn();
DROP PROCEDURE AddBeneficiosColumn;

-- Agregar columna cant_usuarios para límite de usuarios por plan
DELIMITER $$
CREATE PROCEDURE AddCantUsuariosColumn()
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLSTATE '42S21' BEGIN END;
    ALTER TABLE planes ADD COLUMN cant_usuarios INT DEFAULT 1 AFTER beneficios;
END$$
DELIMITER ;

CALL AddCantUsuariosColumn();
DROP PROCEDURE AddCantUsuariosColumn;

-- Verificar estructura después de agregar columnas
SELECT 'Estructura DESPUÉS de agregar columnas:' as info;
DESCRIBE planes;

-- Actualizar planes existentes con beneficios y límites de usuarios
-- Solo actualizar si los valores son NULL para preservar datos existentes
UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso basico', 'Soporte por email', '5 proyectos', 'Almacenamiento 10GB'),
    cant_usuarios = COALESCE(cant_usuarios, 1)
WHERE nombre = 'Plan Standard' AND beneficios IS NULL;

UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso completo', 'Soporte prioritario', '25 proyectos', 'Almacenamiento 100GB', 'Colaboradores ilimitados'),
    cant_usuarios = COALESCE(cant_usuarios, 10)
WHERE nombre = 'Plan Business' AND beneficios IS NULL;

UPDATE planes SET 
    beneficios = JSON_ARRAY('Acceso premium', 'Soporte 24/7', 'Proyectos ilimitados', 'Almacenamiento 1TB', 'API dedicada', 'Backup automatico'),
    cant_usuarios = COALESCE(cant_usuarios, -1)
WHERE nombre = 'Plan Enterprise' AND beneficios IS NULL;

-- Verificar que la migración fue exitosa
SELECT 'Resultado final de la migración:' as info;
SELECT id, nombre, precio, frecuencia, descripcion, 
       JSON_EXTRACT(beneficios, '$') as beneficios_json, 
       cant_usuarios,
       JSON_VALID(beneficios) as json_valido
FROM planes;
