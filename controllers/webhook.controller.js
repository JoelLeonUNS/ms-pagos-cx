const mercadopago = require('mercadopago');
const db = require('../db');
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

    await db.query(`
      INSERT INTO pagos (usuario_id, plan_id, monto, moneda, estado, metodo_pago, referencia_ext)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      external_reference,
      plan_id,
      transaction_amount,
      currency_id || 'PEN',
      status,
      payment_method_id,
      String(id)
    ]);

    console.log(`✅ Pago registrado: ${id}`);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error al procesar webhook:', err);
    res.status(500).json({ error: 'Error interno en webhook' });
  }
}


module.exports = {
  recibirWebhook
};
