const express = require('express');
const router = express.Router();
const PlanController = require('../controllers/plan.controller');

// Obtener todos los planes
router.get('/planes', PlanController.getAll);

// Obtener plan por ID
router.get('/planes/:id', PlanController.getById);

// Crear nuevo plan
router.post('/planes', PlanController.create);

// Actualizar plan
router.put('/planes/:id', PlanController.update);

// Eliminar plan
router.delete('/planes/:id', PlanController.delete);

module.exports = router;
