const db = require('../db');

class EstadisticasController {
  // Obtener ingresos por mes (últimos 12 meses)
  static async getIngresosPorMes(req, res) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          YEAR(p.fecha_pago) as año,
          MONTH(p.fecha_pago) as mes,
          COUNT(p.id) as total_pagos,
          SUM(p.monto) as ingresos_totales,
          AVG(p.monto) as ingreso_promedio
        FROM pagos p
        WHERE p.estado = 'approved' 
          AND p.fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY YEAR(p.fecha_pago), MONTH(p.fecha_pago)
        ORDER BY año DESC, mes DESC
      `);

      // Agregar nombres de meses en JavaScript
      const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      const rowsConNombres = rows.map(row => ({
        ...row,
        nombre_mes: meses[row.mes]
      }));

      res.json({
        success: true,
        data: {
          ingresos_por_mes: rowsConNombres,
          total_meses: rowsConNombres.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener ingresos por mes',
        error: error.message
      });
    }
  }

  // Obtener ingresos del mes actual
  static async getIngresosDelMesActual(req, res) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          YEAR(CURDATE()) as año,
          MONTH(CURDATE()) as mes,
          COUNT(p.id) as total_pagos,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_aprobados,
          SUM(CASE WHEN p.estado = 'pending' THEN p.monto ELSE 0 END) as ingresos_pendientes,
          SUM(CASE WHEN p.estado = 'rejected' THEN p.monto ELSE 0 END) as ingresos_rechazados,
          COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as pagos_aprobados,
          COUNT(CASE WHEN p.estado = 'pending' THEN 1 END) as pagos_pendientes,
          COUNT(CASE WHEN p.estado = 'rejected' THEN 1 END) as pagos_rechazados
        FROM pagos p
        WHERE YEAR(p.fecha_pago) = YEAR(CURDATE()) 
          AND MONTH(p.fecha_pago) = MONTH(CURDATE())
      `);

      // Agregar nombre del mes
      const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      const resumenMesActual = rows[0] ? {
        ...rows[0],
        nombre_mes: meses[rows[0].mes]
      } : {
        año: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        nombre_mes: meses[new Date().getMonth() + 1],
        total_pagos: 0,
        ingresos_aprobados: 0,
        ingresos_pendientes: 0,
        ingresos_rechazados: 0,
        pagos_aprobados: 0,
        pagos_pendientes: 0,
        pagos_rechazados: 0
      };

      // Obtener también los ingresos por plan del mes actual
      const [ingresosPorPlan] = await db.execute(`
        SELECT 
          pl.nombre as plan_nombre,
          pl.precio as plan_precio,
          COUNT(p.id) as total_pagos,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_plan
        FROM pagos p
        INNER JOIN planes pl ON p.plan_id = pl.id
        WHERE YEAR(p.fecha_pago) = YEAR(CURDATE()) 
          AND MONTH(p.fecha_pago) = MONTH(CURDATE())
        GROUP BY pl.id, pl.nombre, pl.precio
        ORDER BY ingresos_plan DESC
      `);

      res.json({
        success: true,
        data: {
          resumen_mes_actual: resumenMesActual,
          ingresos_por_plan: ingresosPorPlan
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener ingresos del mes actual',
        error: error.message
      });
    }
  }

  // Obtener estadísticas generales de ingresos
  static async getEstadisticasGenerales(req, res) {
    try {
      // Ingresos totales históricos
      const [ingresosHistoricos] = await db.execute(`
        SELECT 
          COUNT(p.id) as total_pagos_historicos,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_totales_historicos,
          AVG(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingreso_promedio_historico,
          COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as pagos_aprobados_historicos
        FROM pagos p
      `);

      // Comparación mes actual vs anterior
      const [comparacionMensual] = await db.execute(`
        SELECT 
          'mes_actual' as periodo,
          COUNT(p.id) as total_pagos,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos
        FROM pagos p
        WHERE YEAR(p.fecha_pago) = YEAR(CURDATE()) 
          AND MONTH(p.fecha_pago) = MONTH(CURDATE())
        
        UNION ALL
        
        SELECT 
          'mes_anterior' as periodo,
          COUNT(p.id) as total_pagos,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos
        FROM pagos p
        WHERE YEAR(p.fecha_pago) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
          AND MONTH(p.fecha_pago) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
      `);

      // Calcular crecimiento
      const mesActual = comparacionMensual.find(m => m.periodo === 'mes_actual') || { ingresos: 0, total_pagos: 0 };
      const mesAnterior = comparacionMensual.find(m => m.periodo === 'mes_anterior') || { ingresos: 0, total_pagos: 0 };
      
      const crecimientoIngresos = mesAnterior.ingresos > 0 
        ? ((mesActual.ingresos - mesAnterior.ingresos) / mesAnterior.ingresos * 100).toFixed(2)
        : 0;
      
      const crecimientoPagos = mesAnterior.total_pagos > 0
        ? ((mesActual.total_pagos - mesAnterior.total_pagos) / mesAnterior.total_pagos * 100).toFixed(2)
        : 0;

      // Top 3 planes más vendidos
      const [topPlanes] = await db.execute(`
        SELECT 
          pl.nombre as plan_nombre,
          COUNT(p.id) as total_ventas,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_totales
        FROM pagos p
        INNER JOIN planes pl ON p.plan_id = pl.id
        WHERE p.estado = 'approved'
        GROUP BY pl.id, pl.nombre
        ORDER BY total_ventas DESC
        LIMIT 3
      `);

      res.json({
        success: true,
        data: {
          historicos: ingresosHistoricos[0],
          comparacion_mensual: {
            mes_actual: mesActual,
            mes_anterior: mesAnterior,
            crecimiento_ingresos: `${crecimientoIngresos}%`,
            crecimiento_pagos: `${crecimientoPagos}%`
          },
          top_planes: topPlanes,
          fecha_consulta: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas generales',
        error: error.message
      });
    }
  }

  // Obtener ingresos por rango de fechas personalizado
  static async getIngresosPorRango(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren los parámetros fecha_inicio y fecha_fin (formato: YYYY-MM-DD)'
        });
      }

      const [rows] = await db.execute(`
        SELECT 
          DATE(p.fecha_pago) as fecha,
          COUNT(p.id) as total_pagos,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_aprobados,
          SUM(CASE WHEN p.estado = 'pending' THEN p.monto ELSE 0 END) as ingresos_pendientes,
          COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as pagos_aprobados
        FROM pagos p
        WHERE DATE(p.fecha_pago) >= ? AND DATE(p.fecha_pago) <= ?
        GROUP BY DATE(p.fecha_pago)
        ORDER BY fecha DESC
      `, [fecha_inicio, fecha_fin]);

      // Resumen del período
      const [resumen] = await db.execute(`
        SELECT 
          COUNT(p.id) as total_pagos_periodo,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_totales_periodo,
          AVG(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingreso_promedio_periodo
        FROM pagos p
        WHERE DATE(p.fecha_pago) >= ? AND DATE(p.fecha_pago) <= ?
      `, [fecha_inicio, fecha_fin]);

      res.json({
        success: true,
        data: {
          rango_consultado: {
            fecha_inicio,
            fecha_fin
          },
          resumen_periodo: resumen[0],
          ingresos_por_dia: rows
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener ingresos por rango',
        error: error.message
      });
    }
  }

  // Obtener estadísticas detalladas de ingresos por planes
  static async getIngresosPorPlanes(req, res) {
    try {
      // Estadísticas generales por plan
      const [estadisticasPlanes] = await db.execute(`
        SELECT 
          pl.id as plan_id,
          pl.nombre as plan_nombre,
          pl.precio as plan_precio,
          pl.frecuencia as plan_frecuencia,
          COUNT(p.id) as total_pagos,
          COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as pagos_aprobados,
          COUNT(CASE WHEN p.estado = 'pending' THEN 1 END) as pagos_pendientes,
          COUNT(CASE WHEN p.estado = 'rejected' THEN 1 END) as pagos_rechazados,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_totales,
          SUM(CASE WHEN p.estado = 'pending' THEN p.monto ELSE 0 END) as ingresos_pendientes,
          AVG(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingreso_promedio,
          MIN(p.fecha_pago) as primer_venta,
          MAX(p.fecha_pago) as ultima_venta
        FROM planes pl
        LEFT JOIN pagos p ON pl.id = p.plan_id
        GROUP BY pl.id, pl.nombre, pl.precio, pl.frecuencia
        ORDER BY ingresos_totales DESC
      `);

      // Ingresos por plan en los últimos 6 meses
      const [ingresosMensuales] = await db.execute(`
        SELECT 
          pl.nombre as plan_nombre,
          YEAR(p.fecha_pago) as año,
          MONTH(p.fecha_pago) as mes,
          COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as ventas,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos
        FROM planes pl
        LEFT JOIN pagos p ON pl.id = p.plan_id
        WHERE p.fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
          OR p.fecha_pago IS NULL
        GROUP BY pl.id, pl.nombre, YEAR(p.fecha_pago), MONTH(p.fecha_pago)
        HAVING ventas > 0
        ORDER BY pl.nombre, año DESC, mes DESC
      `);

      // Agregar nombres de meses
      const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      const ingresosMensualesConNombres = ingresosMensuales.map(row => ({
        ...row,
        nombre_mes: meses[row.mes]
      }));

      // Comparación de planes en el mes actual vs anterior
      const [comparacionPlanes] = await db.execute(`
        SELECT 
          pl.nombre as plan_nombre,
          'mes_actual' as periodo,
          COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as ventas,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos
        FROM planes pl
        LEFT JOIN pagos p ON pl.id = p.plan_id
        WHERE YEAR(p.fecha_pago) = YEAR(CURDATE()) 
          AND MONTH(p.fecha_pago) = MONTH(CURDATE())
        GROUP BY pl.id, pl.nombre
        
        UNION ALL
        
        SELECT 
          pl.nombre as plan_nombre,
          'mes_anterior' as periodo,
          COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as ventas,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos
        FROM planes pl
        LEFT JOIN pagos p ON pl.id = p.plan_id
        WHERE YEAR(p.fecha_pago) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
          AND MONTH(p.fecha_pago) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        GROUP BY pl.id, pl.nombre
        ORDER BY plan_nombre, periodo DESC
      `);

      // Procesar comparación mensual por plan
      const comparacionProcesada = {};
      comparacionPlanes.forEach(item => {
        if (!comparacionProcesada[item.plan_nombre]) {
          comparacionProcesada[item.plan_nombre] = {};
        }
        comparacionProcesada[item.plan_nombre][item.periodo] = {
          ventas: item.ventas || 0,
          ingresos: item.ingresos || 0
        };
      });

      // Calcular crecimiento por plan
      const crecimientoPorPlan = Object.keys(comparacionProcesada).map(planNombre => {
        const actual = comparacionProcesada[planNombre]['mes_actual'] || { ventas: 0, ingresos: 0 };
        const anterior = comparacionProcesada[planNombre]['mes_anterior'] || { ventas: 0, ingresos: 0 };
        
        const crecimientoVentas = anterior.ventas > 0 
          ? ((actual.ventas - anterior.ventas) / anterior.ventas * 100).toFixed(2)
          : (actual.ventas > 0 ? 100 : 0);
          
        const crecimientoIngresos = anterior.ingresos > 0 
          ? ((actual.ingresos - anterior.ingresos) / anterior.ingresos * 100).toFixed(2)
          : (actual.ingresos > 0 ? 100 : 0);

        return {
          plan_nombre: planNombre,
          mes_actual: actual,
          mes_anterior: anterior,
          crecimiento_ventas: `${crecimientoVentas}%`,
          crecimiento_ingresos: `${crecimientoIngresos}%`
        };
      });

      // Plan más rentable y más vendido
      const planMasRentable = estadisticasPlanes.reduce((max, plan) => 
        plan.ingresos_totales > max.ingresos_totales ? plan : max, estadisticasPlanes[0]);
      
      const planMasVendido = estadisticasPlanes.reduce((max, plan) => 
        plan.pagos_aprobados > max.pagos_aprobados ? plan : max, estadisticasPlanes[0]);

      res.json({
        success: true,
        data: {
          resumen: {
            total_planes: estadisticasPlanes.length,
            plan_mas_rentable: planMasRentable,
            plan_mas_vendido: planMasVendido
          },
          estadisticas_por_plan: estadisticasPlanes,
          ingresos_mensuales_por_plan: ingresosMensualesConNombres,
          comparacion_mensual: crecimientoPorPlan,
          fecha_consulta: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas de ingresos por planes',
        error: error.message
      });
    }
  }
}

module.exports = EstadisticasController;
