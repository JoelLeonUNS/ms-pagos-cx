const mercadopago = require('mercadopago');

// Configura el SDK
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

async function generarPreferencia(req, res) {
  const { usuario_id, plan_id, descripcion, monto } = req.body;

  if (!usuario_id || !plan_id || !monto) {
    return res.status(400).json({ error: 'Faltan datos necesarios' });
  }

  const preference = {
    items: [
      {
        title: descripcion || `Pago plan ${plan_id}`,
        unit_price: parseFloat(monto),
        quantity: 1
      }
    ],
    external_reference: String(usuario_id),
    back_urls: {
      success: process.env.SUCCESS_URL,
      failure: process.env.FAILURE_URL,
      pending: process.env.PENDING_URL
    },
    notification_url: process.env.WEBHOOK_NOTIFICATION_URL,
    metadata: {
      plan_id,          // 👈 Aquí va el plan_id real
      usuario_id        // (opcional) también puedes duplicarlo aquí
    }
  };

  // auto_return es opcional - solo se agrega si está configurado en el .env
  if (process.env.MERCADOPAGO_AUTO_RETURN) {
    preference.auto_return = process.env.MERCADOPAGO_AUTO_RETURN;
  }

  try {
    const response = await mercadopago.preferences.create(preference);
    return res.json({
      init_point: response.body.init_point,
      id_preferencia: response.body.id
    });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    return res.status(500).json({ 
      error: 'No se pudo crear la preferencia de pago',
      details: error.message 
    });
  }
}

module.exports = {
  generarPreferencia
};
