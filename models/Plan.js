const db = require('../db');

class Plan {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM planes');
    // Parsear beneficios JSON con manejo de errores
    return rows.map(plan => ({
      ...plan,
      beneficios: this.parseBeneficios(plan.beneficios)
    }));
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM planes WHERE id = ?', [id]);
    if (rows[0]) {
      return {
        ...rows[0],
        beneficios: this.parseBeneficios(rows[0].beneficios)
      };
    }
    return null;
  }

  // Método auxiliar para parsear beneficios de forma segura
  static parseBeneficios(beneficios) {
    if (!beneficios) return [];
    
    try {
      // Si ya es un array, devolverlo
      if (Array.isArray(beneficios)) return beneficios;
      
      // Si es string, intentar parsearlo
      if (typeof beneficios === 'string') {
        // Limpiar string si tiene caracteres extraños
        const cleanBeneficios = beneficios.trim();
        
        // Si no parece JSON, tratar como string simple
        if (!cleanBeneficios.startsWith('[') && !cleanBeneficios.startsWith('{')) {
          return [cleanBeneficios];
        }
        
        return JSON.parse(cleanBeneficios);
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing beneficios:', error.message, 'Data:', beneficios);
      
      // Si falla el parsing, intentar tratarlo como string simple
      if (typeof beneficios === 'string' && beneficios.trim()) {
        return [beneficios.trim()];
      }
      
      return ['Beneficios no disponibles'];
    }
  }

  static async create(planData) {
    const { nombre, precio, frecuencia, descripcion, beneficios, cant_usuarios } = planData;
    const beneficiosJson = beneficios ? JSON.stringify(beneficios) : null;
    const cantUsuarios = cant_usuarios !== undefined ? cant_usuarios : 1;
    const [result] = await db.execute(
      'INSERT INTO planes (nombre, precio, frecuencia, descripcion, beneficios, cant_usuarios) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, precio, frecuencia, descripcion, beneficiosJson, cantUsuarios]
    );
    return result.insertId;
  }

  static async update(id, planData) {
    const { nombre, precio, frecuencia, descripcion, beneficios, cant_usuarios } = planData;
    const beneficiosJson = beneficios ? JSON.stringify(beneficios) : null;
    const cantUsuarios = cant_usuarios !== undefined ? cant_usuarios : 1;
    const [result] = await db.execute(
      'UPDATE planes SET nombre = ?, precio = ?, frecuencia = ?, descripcion = ?, beneficios = ?, cant_usuarios = ? WHERE id = ?',
      [nombre, precio, frecuencia, descripcion, beneficiosJson, cantUsuarios, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM planes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Plan;
