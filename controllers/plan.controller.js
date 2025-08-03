const Plan = require('../models/Plan');

class PlanController {
  static async getAll(req, res) {
    try {
      const planes = await Plan.getAll();
      res.json({
        success: true,
        data: planes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los planes',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const plan = await Plan.getById(id);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el plan',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, precio, frecuencia, descripcion, beneficios, cant_usuarios } = req.body;

      // Validaciones básicas
      if (!nombre || !precio || !frecuencia) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, precio y frecuencia son requeridos'
        });
      }

      if (!['mensual', 'anual'].includes(frecuencia)) {
        return res.status(400).json({
          success: false,
          message: 'La frecuencia debe ser "mensual" o "anual"'
        });
      }

      // Validar beneficios si se proporcionan
      if (beneficios && !Array.isArray(beneficios)) {
        return res.status(400).json({
          success: false,
          message: 'Los beneficios deben ser un array de strings'
        });
      }

      // Validar cant_usuarios si se proporciona
      if (cant_usuarios !== undefined && (!Number.isInteger(cant_usuarios) || cant_usuarios < -1 || cant_usuarios === 0)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad de usuarios debe ser un número entero positivo o -1 (ilimitado)'
        });
      }

      const planId = await Plan.create({ nombre, precio, frecuencia, descripcion, beneficios, cant_usuarios });
      const nuevoPlan = await Plan.getById(planId);

      res.status(201).json({
        success: true,
        message: 'Plan creado exitosamente',
        data: nuevoPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el plan',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, precio, frecuencia, descripcion, beneficios, cant_usuarios } = req.body;

      // Validaciones básicas
      if (!nombre || !precio || !frecuencia) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, precio y frecuencia son requeridos'
        });
      }

      if (!['mensual', 'anual'].includes(frecuencia)) {
        return res.status(400).json({
          success: false,
          message: 'La frecuencia debe ser "mensual" o "anual"'
        });
      }

      // Validar beneficios si se proporcionan
      if (beneficios && !Array.isArray(beneficios)) {
        return res.status(400).json({
          success: false,
          message: 'Los beneficios deben ser un array de strings'
        });
      }

      // Validar cant_usuarios si se proporciona
      if (cant_usuarios !== undefined && (!Number.isInteger(cant_usuarios) || cant_usuarios < -1 || cant_usuarios === 0)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad de usuarios debe ser un número entero positivo o -1 (ilimitado)'
        });
      }

      const updated = await Plan.update(id, { nombre, precio, frecuencia, descripcion, beneficios, cant_usuarios });
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      const planActualizado = await Plan.getById(id);

      res.json({
        success: true,
        message: 'Plan actualizado exitosamente',
        data: planActualizado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el plan',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Plan.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Plan eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el plan',
        error: error.message
      });
    }
  }
}

module.exports = PlanController;
