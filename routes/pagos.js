const express = require('express');
const router = express.Router();
const PagoController = require('../controllers/pago.controller');

// Obtener todos los pagos
router.get('/pagos', PagoController.getAll);

// Obtener pago por ID
router.get('/pagos/:id', PagoController.getById);

// Obtener pagos por usuario
router.get('/pagos/usuario/:usuarioId', PagoController.getByUsuario);

// Crear nuevo pago
router.post('/pagos', PagoController.create);

// Actualizar pago
router.put('/pagos/:id', PagoController.update);

// Actualizar solo el estado del pago
router.patch('/pagos/:id/estado', PagoController.updateEstado);

// Eliminar pago
router.delete('/pagos/:id', PagoController.delete);

// Endpoint de prueba para procesar suscripción manualmente
router.post('/pagos/:id/procesar-suscripcion', PagoController.procesarSuscripcionManual);

module.exports = router;
