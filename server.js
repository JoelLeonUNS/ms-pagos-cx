const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Rutas principales CRUD
const planesRoutes = require('./routes/planes');
app.use('/api', planesRoutes);

const pagosRoutes = require('./routes/pagos');
app.use('/api', pagosRoutes);

const suscripcionesRoutes = require('./routes/suscripciones');
app.use('/api', suscripcionesRoutes);

// Rutas específicas de integración
const mercadoPagoRoutes = require('./routes/mercadopago');
app.use('/api', mercadoPagoRoutes);

const webhookRoutes = require('./routes/webhook');
app.use('/api', webhookRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Microservicio de pagos activo',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Microservicio de pagos activo en http://localhost:${PORT}`);
  console.log('Rutas disponibles:');
  console.log('- GET /health - Health check');
  console.log('- CRUD /api/planes - Gestión de planes');
  console.log('- CRUD /api/pagos - Gestión de pagos');
  console.log('- CRUD /api/suscripciones - Gestión de suscripciones');
  console.log('- /api/mercadopago - Integración MercadoPago');
  console.log('- /api/webhook - Webhooks');
});
