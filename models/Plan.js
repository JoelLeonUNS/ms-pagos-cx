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
    const { nombre, precio, frecuencia, descripcion, beneficios } = planData;
    const beneficiosJson = beneficios ? JSON.stringify(beneficios) : null;
    const [result] = await db.execute(
      'INSERT INTO planes (nombre, precio, frecuencia, descripcion, beneficios) VALUES (?, ?, ?, ?, ?)',
      [nombre, precio, frecuencia, descripcion, beneficiosJson]
    );
    return result.insertId;
  }

  static async update(id, planData) {
    const { nombre, precio, frecuencia, descripcion, beneficios } = planData;
    const beneficiosJson = beneficios ? JSON.stringify(beneficios) : null;
    const [result] = await db.execute(
      'UPDATE planes SET nombre = ?, precio = ?, frecuencia = ?, descripcion = ?, beneficios = ? WHERE id = ?',
      [nombre, precio, frecuencia, descripcion, beneficiosJson, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM planes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Plan;
