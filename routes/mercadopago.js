const express = require('express');
const router = express.Router();
const { generarPreferencia } = require('../controllers/mercadopago.controller');

// POST /mercadopago/preferencia
router.post('/mercadopago/preferencia', generarPreferencia);

module.exports = router;
