const db = require('../db');

class Suscripcion {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT s.*, pl.nombre as plan_nombre, pl.precio, pl.frecuencia, pl.cant_usuarios 
      FROM suscripciones s 
      LEFT JOIN planes pl ON s.plan_id = pl.id 
      ORDER BY s.fecha_inicio DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`
      SELECT s.*, pl.nombre as plan_nombre, pl.precio, pl.frecuencia, pl.cant_usuarios 
      FROM suscripciones s 
      LEFT JOIN planes pl ON s.plan_id = pl.id 
      WHERE s.id = ?
    `, [id]);
    return rows[0];
  }

  static async getByUsuario(usuarioId) {
    const [rows] = await db.execute(`
      SELECT s.*, pl.nombre as plan_nombre, pl.precio, pl.frecuencia, pl.cant_usuarios 
      FROM suscripciones s 
      LEFT JOIN planes pl ON s.plan_id = pl.id 
      WHERE s.usuario_id = ? 
      ORDER BY s.fecha_inicio DESC
    `, [usuarioId]);
    return rows;
  }

  static async getActiveByUsuario(usuarioId) {
    const [rows] = await db.execute(`
      SELECT s.*, pl.nombre as plan_nombre, pl.precio, pl.frecuencia, pl.cant_usuarios 
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

  // Crear suscripción automáticamente después de un pago aprobado
  static async createFromPayment(usuario_id, plan_id) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Obtener información del plan para calcular fechas
      const [planRows] = await connection.execute(
        'SELECT * FROM planes WHERE id = ?', [plan_id]
      );
      
      if (planRows.length === 0) {
        throw new Error('Plan no encontrado');
      }

      const plan = planRows[0];
      const fechaInicio = new Date();
      const fechaFin = new Date();

      // Calcular fecha fin según la frecuencia del plan
      if (plan.frecuencia === 'mensual') {
        fechaFin.setMonth(fechaFin.getMonth() + 1);
      } else if (plan.frecuencia === 'anual') {
        fechaFin.setFullYear(fechaFin.getFullYear() + 1);
      }

      // Cancelar suscripción activa anterior
      await connection.execute(
        'UPDATE suscripciones SET estado = "cancelada" WHERE usuario_id = ? AND estado = "activa"',
        [usuario_id]
      );

      // Crear nueva suscripción
      const [result] = await connection.execute(
        'INSERT INTO suscripciones (usuario_id, plan_id, fecha_inicio, fecha_fin, renovacion_automatica) VALUES (?, ?, ?, ?, ?)',
        [usuario_id, plan_id, fechaInicio.toISOString().split('T')[0], fechaFin.toISOString().split('T')[0], true]
      );

      await connection.commit();
      return result.insertId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener suscripciones que necesitan renovación automática
  static async getSuscripcionesParaRenovar() {
    const [rows] = await db.execute(`
      SELECT s.*, p.nombre as plan_nombre, p.precio, p.frecuencia, p.cant_usuarios
      FROM suscripciones s
      JOIN planes p ON s.plan_id = p.id
      WHERE s.estado = 'activa' 
      AND s.renovacion_automatica = TRUE 
      AND s.fecha_fin <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
      AND s.fecha_fin > CURDATE()
    `);
    return rows;
  }

  // Renovar suscripción automáticamente
  static async renovarAutomaticamente(suscripcionId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Obtener datos de la suscripción actual
      const [suscRows] = await connection.execute(`
        SELECT s.*, p.frecuencia 
        FROM suscripciones s 
        JOIN planes p ON s.plan_id = p.id 
        WHERE s.id = ?
      `, [suscripcionId]);

      if (suscRows.length === 0) {
        throw new Error('Suscripción no encontrada');
      }

      const suscripcion = suscRows[0];
      const nuevaFechaFin = new Date(suscripcion.fecha_fin);

      // Calcular nueva fecha fin
      if (suscripcion.frecuencia === 'mensual') {
        nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 1);
      } else if (suscripcion.frecuencia === 'anual') {
        nuevaFechaFin.setFullYear(nuevaFechaFin.getFullYear() + 1);
      }

      // Actualizar fecha fin de la suscripción
      await connection.execute(
        'UPDATE suscripciones SET fecha_fin = ? WHERE id = ?',
        [nuevaFechaFin.toISOString().split('T')[0], suscripcionId]
      );

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Suscripcion;
