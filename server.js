const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

const pagosRoutes = require('./routes/pagos');
app.use('/', pagosRoutes);

const mercadoPagoRoutes = require('./routes/mercadopago');
app.use('/', mercadoPagoRoutes);

const webhookRoutes = require('./routes/webhook');
app.use('/', webhookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Microservicio de pagos activo en http://localhost:${PORT}`);
});
