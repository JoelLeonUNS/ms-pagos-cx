const express = require('express');
const EstadisticasController = require('../controllers/estadisticas.controller');

const router = express.Router();

// Rutas de estadísticas de ingresos
router.get('/estadisticas/ingresos/por-mes', EstadisticasController.getIngresosPorMes);
router.get('/estadisticas/ingresos/mes-actual', EstadisticasController.getIngresosDelMesActual);
router.get('/estadisticas/ingresos/generales', EstadisticasController.getEstadisticasGenerales);
router.get('/estadisticas/ingresos/por-planes', EstadisticasController.getIngresosPorPlanes);
router.get('/estadisticas/ingresos/rango', EstadisticasController.getIngresosPorRango);

module.exports = router;
