const express = require('express');
const router = express.Router();
const { recibirWebhook } = require('../controllers/webhook.controller');

// MercadoPago notificará aquí (POST)
router.post('/webhook', recibirWebhook);

module.exports = router;
