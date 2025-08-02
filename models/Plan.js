const db = require('../db');

class Plan {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM planes');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM planes WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(planData) {
    const { nombre, precio, frecuencia, descripcion } = planData;
    const [result] = await db.execute(
      'INSERT INTO planes (nombre, precio, frecuencia, descripcion) VALUES (?, ?, ?, ?)',
      [nombre, precio, frecuencia, descripcion]
    );
    return result.insertId;
  }

  static async update(id, planData) {
    const { nombre, precio, frecuencia, descripcion } = planData;
    const [result] = await db.execute(
      'UPDATE planes SET nombre = ?, precio = ?, frecuencia = ?, descripcion = ? WHERE id = ?',
      [nombre, precio, frecuencia, descripcion, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM planes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Plan;
