const mercadopago = require('mercadopago');
require('dotenv').config();

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
      success: 'https://tuapp.com/success',
      failure: 'https://tuapp.com/failure',
      pending: 'https://tuapp.com/pending'
    },
    auto_return: 'approved',
    notification_url: 'http://34.173.216.37:3000/api/webhook',
    metadata: {
      plan_id,          // 👈 Aquí va el plan_id real
      usuario_id        // (opcional) también puedes duplicarlo aquí
    }
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    return res.json({
      init_point: response.body.init_point,
      id_preferencia: response.body.id
    });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    return res.status(500).json({ error: 'No se pudo crear la preferencia de pago' });
  }
}

module.exports = {
  generarPreferencia
};
