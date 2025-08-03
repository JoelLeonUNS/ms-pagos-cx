require('dotenv').config();
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function migrate() {
  try {
    console.log('🔄 Iniciando migración...');
    
    // Agregar columna beneficios
    try {
      await db.execute('ALTER TABLE planes ADD COLUMN beneficios JSON AFTER descripcion');
      console.log('✅ Columna beneficios agregada');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ Columna beneficios ya existe');
      } else {
        throw error;
      }
    }
    
    // Agregar columna cant_usuarios
    try {
      await db.execute('ALTER TABLE planes ADD COLUMN cant_usuarios INT DEFAULT 1 AFTER beneficios');
      console.log('✅ Columna cant_usuarios agregada');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ Columna cant_usuarios ya existe');
      } else {
        throw error;
      }
    }
    
    // Verificar estructura
    const [rows] = await db.execute('DESCRIBE planes');
    console.log('\n📋 Estructura actual de la tabla planes:');
    console.log('==========================================');
    rows.forEach(row => {
      console.log(`${row.Field.padEnd(15)} | ${row.Type.padEnd(20)} | ${row.Null.padEnd(5)} | ${row.Default || 'NULL'}`);
    });
    
    // Actualizar planes existentes con datos por defecto
    console.log('\n🔄 Actualizando planes con datos por defecto...');
    
    await db.execute(`
      UPDATE planes SET 
        beneficios = JSON_ARRAY('Acceso básico', 'Soporte por email', '5 proyectos', 'Almacenamiento 10GB'),
        cant_usuarios = 1
      WHERE beneficios IS NULL AND nombre LIKE '%Standard%'
    `);
    
    await db.execute(`
      UPDATE planes SET 
        beneficios = JSON_ARRAY('Acceso completo', 'Soporte prioritario', '25 proyectos', 'Almacenamiento 100GB', 'Colaboradores ilimitados'),
        cant_usuarios = 10
      WHERE beneficios IS NULL AND nombre LIKE '%Business%'
    `);
    
    await db.execute(`
      UPDATE planes SET 
        beneficios = JSON_ARRAY('Acceso premium', 'Soporte 24/7', 'Proyectos ilimitados', 'Almacenamiento 1TB', 'API dedicada', 'Backup automático'),
        cant_usuarios = -1
      WHERE beneficios IS NULL AND (nombre LIKE '%Enterprise%' OR nombre LIKE '%Premium%')
    `);
    
    // Para cualquier plan restante sin beneficios
    await db.execute(`
      UPDATE planes SET 
        beneficios = JSON_ARRAY('Acceso básico', 'Soporte incluido'),
        cant_usuarios = 1
      WHERE beneficios IS NULL
    `);
    
    console.log('✅ Datos actualizados');
    
    // Mostrar datos finales
    const [finalRows] = await db.execute('SELECT id, nombre, beneficios, cant_usuarios FROM planes');
    console.log('\n📊 Datos finales:');
    console.log('=================');
    finalRows.forEach(row => {
      console.log(`ID: ${row.id} | ${row.nombre} | Usuarios: ${row.cant_usuarios}`);
      console.log(`   Beneficios: ${JSON.stringify(row.beneficios)}`);
    });
    
    console.log('\n🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
  } finally {
    await db.end();
  }
}

migrate();
