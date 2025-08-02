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

// Endpoint para listar todas las rutas disponibles
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  // Función para extraer rutas de un router
  function extractRoutes(stack, basePath = '') {
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push({
          path: basePath + layer.route.path,
          methods: methods,
          description: getRouteDescription(basePath + layer.route.path, methods)
        });
      } else if (layer.name === 'router') {
        const routerPath = layer.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace('^', '')
          .replace('$', '')
          .replace('\\', '');
        extractRoutes(layer.handle.stack, routerPath);
      }
    });
  }

  // Función para obtener descripción de la ruta
  function getRouteDescription(path, methods) {
    if (path === '/health') return 'Health check del servicio';
    if (path === '/api/routes') return 'Lista todas las rutas disponibles';
    if (path.includes('/planes')) return 'Gestión de planes de suscripción';
    if (path.includes('/pagos')) return 'Gestión de pagos';
    if (path.includes('/suscripciones')) return 'Gestión de suscripciones';
    if (path.includes('/mercadopago')) return 'Integración con MercadoPago';
    if (path.includes('/webhook')) return 'Manejo de webhooks';
    return 'Endpoint de la API';
  }

  extractRoutes(app._router.stack);

  res.json({
    success: true,
    message: 'Lista de rutas disponibles',
    data: {
      total: routes.length,
      routes: routes.sort((a, b) => a.path.localeCompare(b.path))
    }
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
