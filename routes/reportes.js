const express = require('express');
const ReportesController = require('../controllers/reportes.controller');

const router = express.Router();

// Rutas de reportes formateados para tablas/exportación
router.get('/reportes/ingresos', ReportesController.getReporteIngresos);
router.get('/reportes/transacciones', ReportesController.getReporteTransacciones);
router.get('/reportes/rendimiento-planes', ReportesController.getReporteRendimientoPlanes);

module.exports = router;
