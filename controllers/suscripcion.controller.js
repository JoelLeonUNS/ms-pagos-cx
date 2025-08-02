const Suscripcion = require('../models/Suscripcion');
const SuscripcionService = require('../services/SuscripcionService');

class SuscripcionController {
  static async getAll(req, res) {
    try {
      const suscripciones = await Suscripcion.getAll();
      res.json({
        success: true,
        data: suscripciones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las suscripciones',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const suscripcion = await Suscripcion.getById(id);
      
      if (!suscripcion) {
        return res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada'
        });
      }

      res.json({
        success: true,
        data: suscripcion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la suscripción',
        error: error.message
      });
    }
  }

  static async getByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const suscripciones = await Suscripcion.getByUsuario(usuarioId);
      
      res.json({
        success: true,
        data: suscripciones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las suscripciones del usuario',
        error: error.message
      });
    }
  }

  static async getActiveByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const suscripcion = await Suscripcion.getActiveByUsuario(usuarioId);
      
      res.json({
        success: true,
        data: suscripcion || null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la suscripción activa del usuario',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { usuario_id, plan_id, fecha_inicio, fecha_fin, renovacion_automatica } = req.body;

      // Validaciones básicas
      if (!usuario_id || !plan_id || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Usuario ID, Plan ID, fecha inicio y fecha fin son requeridos'
        });
      }

      // Validar que fecha_fin sea posterior a fecha_inicio
      if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
        return res.status(400).json({
          success: false,
          message: 'La fecha fin debe ser posterior a la fecha inicio'
        });
      }

      const suscripcionId = await Suscripcion.create({ 
        usuario_id, 
        plan_id, 
        fecha_inicio, 
        fecha_fin, 
        renovacion_automatica: renovacion_automatica !== undefined ? renovacion_automatica : true
      });
      
      const nuevaSuscripcion = await Suscripcion.getById(suscripcionId);

      res.status(201).json({
        success: true,
        message: 'Suscripción creada exitosamente',
        data: nuevaSuscripcion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la suscripción',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { usuario_id, plan_id, estado, fecha_inicio, fecha_fin, renovacion_automatica } = req.body;

      // Validaciones básicas
      if (!usuario_id || !plan_id || !estado || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Usuario ID, Plan ID, estado, fecha inicio y fecha fin son requeridos'
        });
      }

      if (!['activa', 'vencida', 'cancelada'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'El estado debe ser "activa", "vencida" o "cancelada"'
        });
      }

      // Validar que fecha_fin sea posterior a fecha_inicio
      if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
        return res.status(400).json({
          success: false,
          message: 'La fecha fin debe ser posterior a la fecha inicio'
        });
      }

      const updated = await Suscripcion.update(id, { 
        usuario_id, 
        plan_id, 
        estado, 
        fecha_inicio, 
        fecha_fin, 
        renovacion_automatica 
      });
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada'
        });
      }

      const suscripcionActualizada = await Suscripcion.getById(id);

      res.json({
        success: true,
        message: 'Suscripción actualizada exitosamente',
        data: suscripcionActualizada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la suscripción',
        error: error.message
      });
    }
  }

  static async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado || !['activa', 'vencida', 'cancelada'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado debe ser "activa", "vencida" o "cancelada"'
        });
      }

      const updated = await Suscripcion.updateEstado(id, estado);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada'
        });
      }

      const suscripcionActualizada = await Suscripcion.getById(id);

      res.json({
        success: true,
        message: 'Estado de la suscripción actualizado exitosamente',
        data: suscripcionActualizada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado de la suscripción',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Suscripcion.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Suscripción eliminada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la suscripción',
        error: error.message
      });
    }
  }

  static async checkExpiredSuscriptions(req, res) {
    try {
      const resultado = await SuscripcionService.procesarVencimientos();
      
      res.json({
        success: true,
        message: resultado.message,
        data: resultado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar suscripciones vencidas',
        error: error.message
      });
    }
  }

  static async getResumenUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const resumen = await SuscripcionService.getResumenUsuario(usuarioId);
      
      res.json({
        success: true,
        data: resumen
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen del usuario',
        error: error.message
      });
    }
  }

  static async renovarSuscripcion(req, res) {
    try {
      const { id } = req.params;
      await SuscripcionService.renovarSuscripcion(id);
      const suscripcionActualizada = await Suscripcion.getById(id);
      
      res.json({
        success: true,
        message: 'Suscripción renovada exitosamente',
        data: suscripcionActualizada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al renovar la suscripción',
        error: error.message
      });
    }
  }

  static async cancelarRenovacion(req, res) {
    try {
      const { id } = req.params;
      const updated = await Suscripcion.update(id, { renovacion_automatica: false });
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada'
        });
      }

      const suscripcionActualizada = await Suscripcion.getById(id);
      
      res.json({
        success: true,
        message: 'Renovación automática cancelada',
        data: suscripcionActualizada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al cancelar la renovación automática',
        error: error.message
      });
    }
  }
}

module.exports = SuscripcionController;
