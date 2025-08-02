const mercadopago = require('mercadopago');
const Pago = require('../models/Pago');
const SuscripcionService = require('../services/SuscripcionService');
require('dotenv').config();

// Ya debe estar configurado globalmente en mercadopago.controller.js,
// pero por si acaso lo repetimos aquí
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

async function recibirWebhook(req, res) {
  console.log("🔔 Webhook recibido:", JSON.stringify(req.body, null, 2));

  const topic = req.body.topic;
  const paymentId = req.body?.data?.id || req.body?.resource;

  // 👉 Evitar errores si el webhook no es del tipo 'payment'
  if (topic !== 'payment') {
    console.log(`📭 Webhook ignorado (topic: ${topic})`);
    return res.sendStatus(200);
  }

  try {
    if (!paymentId) {
      return res.status(400).json({ error: 'ID de pago no recibido' });
    }

    console.log(`🔍 Consultando pago ${paymentId} en MercadoPago...`);
    const response = await mercadopago.payment.findById(paymentId);
    const pago = response.body;
    const plan_id = pago.metadata?.plan_id || null;

    const {
      id,
      external_reference,
      status,
      transaction_amount,
      currency_id,
      payment_method_id
    } = pago;

    console.log(`💳 Datos del pago de MercadoPago:`, {
      id,
      external_reference,
      status,
      transaction_amount,
      currency_id,
      payment_method_id,
      plan_id
    });

    // Mapear estados de MercadoPago a nuestros estados
    let estadoInterno;
    switch (status) {
      case 'approved':
        estadoInterno = 'approved';
        break;
      case 'pending':
      case 'in_process':
        estadoInterno = 'pending';
        break;
      case 'rejected':
      case 'cancelled':
        estadoInterno = 'rejected';
        break;
      default:
        estadoInterno = 'pending';
    }

    // Verificar si el pago ya existe por referencia externa
    const pagoExistente = await Pago.getByReferenciaExt(String(id));

    if (pagoExistente) {
      console.log(`⚠️ Pago ${id} ya existe, actualizando estado...`);
      
      // Actualizar solo el estado si cambió
      if (pagoExistente.estado !== estadoInterno) {
        await Pago.updateEstado(pagoExistente.id, estadoInterno);
        console.log(`✅ Estado actualizado: ${pagoExistente.estado} → ${estadoInterno}`);
        
        // Si se aprobó, procesar suscripción
        if (estadoInterno === 'approved') {
          try {
            await SuscripcionService.procesarPagoAprobado(pagoExistente.id);
            console.log(`🎉 Suscripción procesada para pago ${pagoExistente.id}`);
          } catch (error) {
            console.error('❌ Error al procesar suscripción:', error.message);
          }
        }
      } else {
        console.log(`ℹ️ Estado sin cambios (${estadoInterno}), no se requiere actualización`);
      }
      
      return res.sendStatus(200);
    }

    // Crear nuevo pago usando el modelo correcto
    console.log(`🆕 Creando nuevo pago...`);
    const pagoData = {
      usuario_id: external_reference, // El usuario_id viene en external_reference
      plan_id: plan_id,
      monto: transaction_amount,
      moneda: currency_id || 'PEN',
      estado: estadoInterno,
      metodo_pago: payment_method_id,
      referencia_ext: String(id)
    };

    const pagoId = await Pago.create(pagoData);
    console.log(`✅ Pago creado con ID: ${pagoId}`);

    // Si el pago se crea directamente como aprobado, procesar suscripción
    if (estadoInterno === 'approved') {
      try {
        await SuscripcionService.procesarPagoAprobado(pagoId);
        console.log(`🎉 Suscripción procesada automáticamente para pago ${pagoId}`);
      } catch (error) {
        console.error('❌ Error al procesar suscripción:', error.message);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error al procesar webhook:', err);
    res.status(500).json({ error: 'Error interno en webhook' });
  }
}


module.exports = {
  recibirWebhook
};
