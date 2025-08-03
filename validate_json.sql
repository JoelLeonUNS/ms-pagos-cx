-- Script de validación de JSON para verificar antes de migrar
-- Ejecutar este script para validar que los JSON sean correctos

USE bd_cx_ms_pagos;

-- Probar que los JSON sean válidos usando SELECT
SELECT 'Validando JSON para Plan Standard:' as test;
SELECT JSON_ARRAY('Acceso básico', 'Soporte por email', '5 proyectos', 'Almacenamiento 10GB') as beneficios_standard;

SELECT 'Validando JSON para Plan Business:' as test;
SELECT JSON_ARRAY('Acceso completo', 'Soporte prioritario', '25 proyectos', 'Almacenamiento 100GB', 'Colaboradores ilimitados') as beneficios_business;

SELECT 'Validando JSON para Plan Enterprise:' as test;
SELECT JSON_ARRAY('Acceso premium', 'Soporte 24/7', 'Proyectos ilimitados', 'Almacenamiento 1TB', 'API dedicada', 'Backup automático') as beneficios_enterprise;

-- Verificar que JSON_VALID funcione
SELECT 'Verificando función JSON_VALID:' as test;
SELECT JSON_VALID('["test", "array"]') as valid_json_test;
SELECT JSON_VALID('invalid json') as invalid_json_test;

-- Mostrar estructura actual de planes
SELECT 'Estructura actual de tabla planes:' as info;
DESCRIBE planes;
