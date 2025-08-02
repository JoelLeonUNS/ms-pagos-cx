const Pago = require('../models/Pago');
const Suscripcion = require('../models/Suscripcion');
const db = require('../db');

class SuscripcionService {
  
  // Procesar pago aprobado y crear/renovar suscripción
  static async procesarPagoAprobado(pagoId) {
    try {
      const pago = await Pago.getById(pagoId);
      
      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      if (pago.estado !== 'approved') {
        throw new Error('El pago no está aprobado');
      }

      // Verificar si el usuario ya tiene una suscripción activa para este plan
      const suscripcionActiva = await Suscripcion.getActiveByUsuario(pago.usuario_id);
      
      if (suscripcionActiva && suscripcionActiva.plan_id === pago.plan_id) {
        // Renovar suscripción existente
        await this.renovarSuscripcion(suscripcionActiva.id);
        console.log(`Suscripción renovada para usuario ${pago.usuario_id}`);
      } else {
        // Crear nueva suscripción
        const suscripcionId = await Suscripcion.createFromPayment(pago.usuario_id, pago.plan_id);
        console.log(`Nueva suscripción creada para usuario ${pago.usuario_id}: ${suscripcionId}`);
      }

      return true;
    } catch (error) {
      console.error('Error al procesar pago aprobado:', error.message);
      throw error;
    }
  }

  // Verificar y procesar vencimientos de suscripciones
  static async procesarVencimientos() {
    try {
      // Marcar como vencidas las suscripciones que ya pasaron su fecha
      const vencidas = await Suscripcion.checkExpiredSuscriptions();
      
      // Obtener suscripciones que necesitan renovación automática
      const paraRenovar = await Suscripcion.getSuscripcionesParaRenovar();
      
      let renovadas = 0;
      
      for (const suscripcion of paraRenovar) {
        try {
          // Crear pago automático para la renovación
          const pagoId = await Pago.create({
            usuario_id: suscripcion.usuario_id,
            plan_id: suscripcion.plan_id,
            monto: suscripcion.precio,
            moneda: 'PEN',
            estado: 'pending',
            metodo_pago: 'renovacion_automatica',
            referencia_ext: `AUTO-REN-${suscripcion.id}-${Date.now()}`
          });

          // Simular aprobación automática (en producción esto vendría de MercadoPago)
          await Pago.updateEstado(pagoId, 'approved');
          
          // Renovar la suscripción
          await Suscripcion.renovarAutomaticamente(suscripcion.id);
          renovadas++;
          
          console.log(`Suscripción ${suscripcion.id} renovada automáticamente`);
        } catch (error) {
          console.error(`Error al renovar suscripción ${suscripcion.id}:`, error.message);
        }
      }

      return {
        vencidas,
        renovadas,
        message: `${vencidas} suscripciones marcadas como vencidas, ${renovadas} renovadas automáticamente`
      };
    } catch (error) {
      console.error('Error al procesar vencimientos:', error.message);
      throw error;
    }
  }

  // Renovar una suscripción específica
  static async renovarSuscripcion(suscripcionId) {
    try {
      await Suscripcion.renovarAutomaticamente(suscripcionId);
      return true;
    } catch (error) {
      console.error(`Error al renovar suscripción ${suscripcionId}:`, error.message);
      throw error;
    }
  }

  // Cancelar renovación automática
  static async cancelarRenovacionAutomatica(suscripcionId) {
    try {
      const updated = await Suscripcion.update(suscripcionId, { 
        renovacion_automatica: false 
      });
      return updated;
    } catch (error) {
      console.error(`Error al cancelar renovación automática ${suscripcionId}:`, error.message);
      throw error;
    }
  }

  // Obtener resumen de suscripciones por usuario
  static async getResumenUsuario(usuarioId) {
    try {
      const suscripcionActiva = await Suscripcion.getActiveByUsuario(usuarioId);
      const todasSuscripciones = await Suscripcion.getByUsuario(usuarioId);
      const pagos = await Pago.getByUsuario(usuarioId);

      return {
        suscripcion_activa: suscripcionActiva,
        historial_suscripciones: todasSuscripciones,
        historial_pagos: pagos,
        tiene_suscripcion_activa: !!suscripcionActiva,
        dias_restantes: suscripcionActiva ? 
          Math.ceil((new Date(suscripcionActiva.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24)) : 0
      };
    } catch (error) {
      console.error(`Error al obtener resumen de usuario ${usuarioId}:`, error.message);
      throw error;
    }
  }
}

module.exports = SuscripcionService;
