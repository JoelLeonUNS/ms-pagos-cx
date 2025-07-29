const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const pagosRoutes = require('./routes/mercadopago');
app.use('/', pagosRoutes);

const mercadoPagoRoutes = require('./routes/mercadopago');
app.use('/', mercadoPagoRoutes);

const webhookRoutes = require('./routes/webhook');
app.use('/', webhookRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Microservicio de pagos activo en http://localhost:${PORT}`);
});
