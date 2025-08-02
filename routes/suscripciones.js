const express = require('express');
const router = express.Router();
const SuscripcionController = require('../controllers/suscripcion.controller');

// Obtener todas las suscripciones
router.get('/suscripciones', SuscripcionController.getAll);

// Obtener suscripción por ID
router.get('/suscripciones/:id', SuscripcionController.getById);

// Obtener suscripciones por usuario
router.get('/suscripciones/usuario/:usuarioId', SuscripcionController.getByUsuario);

// Obtener suscripción activa por usuario
router.get('/suscripciones/usuario/:usuarioId/activa', SuscripcionController.getActiveByUsuario);

// Crear nueva suscripción
router.post('/suscripciones', SuscripcionController.create);

// Actualizar suscripción
router.put('/suscripciones/:id', SuscripcionController.update);

// Actualizar solo el estado de la suscripción
router.patch('/suscripciones/:id/estado', SuscripcionController.updateEstado);

// Eliminar suscripción
router.delete('/suscripciones/:id', SuscripcionController.delete);

// Verificar y actualizar suscripciones vencidas
router.post('/suscripciones/check-expired', SuscripcionController.checkExpiredSuscriptions);

module.exports = router;
