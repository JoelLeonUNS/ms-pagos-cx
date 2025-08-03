const db = require('../db');

class Plan {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM planes');
    // Parsear beneficios JSON
    return rows.map(plan => ({
      ...plan,
      beneficios: plan.beneficios ? JSON.parse(plan.beneficios) : []
    }));
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM planes WHERE id = ?', [id]);
    if (rows[0]) {
      return {
        ...rows[0],
        beneficios: rows[0].beneficios ? JSON.parse(rows[0].beneficios) : []
      };
    }
    return null;
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
