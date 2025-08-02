const db = require('../db');

class Suscripcion {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT s.*, pl.nombre as plan_nombre, pl.precio, pl.frecuencia 
      FROM suscripciones s 
      LEFT JOIN planes pl ON s.plan_id = pl.id 
      ORDER BY s.fecha_inicio DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`
      SELECT s.*, pl.nombre as plan_nombre, pl.precio, pl.frecuencia 
      FROM suscripciones s 
      LEFT JOIN planes pl ON s.plan_id = pl.id 
      WHERE s.id = ?
    `, [id]);
    return rows[0];
  }

  static async getByUsuario(usuarioId) {
    const [rows] = await db.execute(`
      SELECT s.*, pl.nombre as plan_nombre, pl.precio, pl.frecuencia 
      FROM suscripciones s 
      LEFT JOIN planes pl ON s.plan_id = pl.id 
      WHERE s.usuario_id = ? 
      ORDER BY s.fecha_inicio DESC
    `, [usuarioId]);
    return rows;
  }

  static async getActiveByUsuario(usuarioId) {
    const [rows] = await db.execute(`
      SELECT s.*, pl.nombre as plan_nombre, pl.precio, pl.frecuencia 
      FROM suscripciones s 
      LEFT JOIN planes pl ON s.plan_id = pl.id 
      WHERE s.usuario_id = ? AND s.estado = 'activa'
    `, [usuarioId]);
    return rows[0];
  }

  static async create(suscripcionData) {
    const { usuario_id, plan_id, fecha_inicio, fecha_fin, renovacion_automatica } = suscripcionData;
    
    // Primero cancelar suscripción activa existente
    await db.execute(
      'UPDATE suscripciones SET estado = "cancelada" WHERE usuario_id = ? AND estado = "activa"',
      [usuario_id]
    );

    const [result] = await db.execute(
      'INSERT INTO suscripciones (usuario_id, plan_id, fecha_inicio, fecha_fin, renovacion_automatica) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, plan_id, fecha_inicio, fecha_fin, renovacion_automatica || true]
    );
    return result.insertId;
  }

  static async update(id, suscripcionData) {
    const { usuario_id, plan_id, estado, fecha_inicio, fecha_fin, renovacion_automatica } = suscripcionData;
    const [result] = await db.execute(
      'UPDATE suscripciones SET usuario_id = ?, plan_id = ?, estado = ?, fecha_inicio = ?, fecha_fin = ?, renovacion_automatica = ? WHERE id = ?',
      [usuario_id, plan_id, estado, fecha_inicio, fecha_fin, renovacion_automatica, id]
    );
    return result.affectedRows > 0;
  }

  static async updateEstado(id, estado) {
    const [result] = await db.execute(
      'UPDATE suscripciones SET estado = ? WHERE id = ?',
      [estado, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM suscripciones WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async checkExpiredSuscriptions() {
    const [result] = await db.execute(
      'UPDATE suscripciones SET estado = "vencida" WHERE fecha_fin < CURDATE() AND estado = "activa"'
    );
    return result.affectedRows;
  }
}

module.exports = Suscripcion;
