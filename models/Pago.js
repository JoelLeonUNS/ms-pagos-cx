const db = require('../db');

class Pago {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT p.*, pl.nombre as plan_nombre 
      FROM pagos p 
      LEFT JOIN planes pl ON p.plan_id = pl.id 
      ORDER BY p.fecha_pago DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, pl.nombre as plan_nombre 
      FROM pagos p 
      LEFT JOIN planes pl ON p.plan_id = pl.id 
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  }

  static async getByUsuario(usuarioId) {
    const [rows] = await db.execute(`
      SELECT p.*, pl.nombre as plan_nombre 
      FROM pagos p 
      LEFT JOIN planes pl ON p.plan_id = pl.id 
      WHERE p.usuario_id = ? 
      ORDER BY p.fecha_pago DESC
    `, [usuarioId]);
    return rows;
  }

  static async create(pagoData) {
    const { usuario_id, plan_id, monto, moneda, estado, metodo_pago, referencia_ext } = pagoData;
    const [result] = await db.execute(
      'INSERT INTO pagos (usuario_id, plan_id, monto, moneda, estado, metodo_pago, referencia_ext) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        usuario_id, 
        plan_id, 
        monto, 
        moneda || 'PEN', 
        estado, 
        metodo_pago || null, 
        referencia_ext || null
      ]
    );
    return result.insertId;
  }

  static async update(id, pagoData) {
    const { usuario_id, plan_id, monto, moneda, estado, metodo_pago, referencia_ext } = pagoData;
    const [result] = await db.execute(
      'UPDATE pagos SET usuario_id = ?, plan_id = ?, monto = ?, moneda = ?, estado = ?, metodo_pago = ?, referencia_ext = ? WHERE id = ?',
      [
        usuario_id, 
        plan_id, 
        monto, 
        moneda, 
        estado, 
        metodo_pago || null, 
        referencia_ext || null, 
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async updateEstado(id, estado) {
    const [result] = await db.execute(
      'UPDATE pagos SET estado = ? WHERE id = ?',
      [estado, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM pagos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Pago;
