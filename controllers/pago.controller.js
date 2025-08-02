const Pago = require('../models/Pago');
const SuscripcionService = require('../services/SuscripcionService');

class PagoController {
  static async getAll(req, res) {
    try {
      const pagos = await Pago.getAll();
      res.json({
        success: true,
        data: pagos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const pago = await Pago.getById(id);
      
      if (!pago) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: pago
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el pago',
        error: error.message
      });
    }
  }

  static async getByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const pagos = await Pago.getByUsuario(usuarioId);
      
      res.json({
        success: true,
        data: pagos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos del usuario',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { usuario_id, plan_id, monto, moneda, estado, metodo_pago, referencia_ext } = req.body;

      // Validaciones básicas
      if (!usuario_id || !plan_id || !monto || !estado) {
        return res.status(400).json({
          success: false,
          message: 'Usuario ID, Plan ID, monto y estado son requeridos'
        });
      }

      if (!['pending', 'approved', 'rejected'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'El estado debe ser "pending", "approved" o "rejected"'
        });
      }

      const pagoId = await Pago.create({ 
        usuario_id, 
        plan_id, 
        monto, 
        moneda: moneda || 'PEN', 
        estado, 
        metodo_pago, 
        referencia_ext 
      });
      
      const nuevoPago = await Pago.getById(pagoId);

      // Si el pago se crea directamente como "approved", procesar suscripción
      if (estado === 'approved') {
        try {
          await SuscripcionService.procesarPagoAprobado(pagoId);
          console.log(`Nueva suscripción creada automáticamente para pago ${pagoId}`);
        } catch (error) {
          console.error('Error al procesar suscripción:', error.message);
          // No fallar la respuesta si hay error en la suscripción
        }
      }

      res.status(201).json({
        success: true,
        message: 'Pago creado exitosamente',
        data: nuevoPago
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el pago',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { usuario_id, plan_id, monto, moneda, estado, metodo_pago, referencia_ext } = req.body;

      // Validaciones básicas
      if (!usuario_id || !plan_id || !monto || !estado) {
        return res.status(400).json({
          success: false,
          message: 'Usuario ID, Plan ID, monto y estado son requeridos'
        });
      }

      if (!['pending', 'approved', 'rejected'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'El estado debe ser "pending", "approved" o "rejected"'
        });
      }

      const updated = await Pago.update(id, { 
        usuario_id, 
        plan_id, 
        monto, 
        moneda, 
        estado, 
        metodo_pago, 
        referencia_ext 
      });
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      const pagoActualizado = await Pago.getById(id);

      res.json({
        success: true,
        message: 'Pago actualizado exitosamente',
        data: pagoActualizado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el pago',
        error: error.message
      });
    }
  }

  static async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado || !['pending', 'approved', 'rejected'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado debe ser "pending", "approved" o "rejected"'
        });
      }

      const updated = await Pago.updateEstado(id, estado);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      const pagoActualizado = await Pago.getById(id);

      // Si el pago fue aprobado, procesar la suscripción automáticamente
      if (estado === 'approved') {
        try {
          await SuscripcionService.procesarPagoAprobado(id);
          console.log(`Suscripción procesada automáticamente para pago ${id}`);
        } catch (error) {
          console.error('Error al procesar suscripción:', error.message);
          // No fallar la respuesta si hay error en la suscripción
        }
      }

      res.json({
        success: true,
        message: 'Estado del pago actualizado exitosamente',
        data: pagoActualizado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado del pago',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Pago.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Pago eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el pago',
        error: error.message
      });
    }
  }
}

module.exports = PagoController;
