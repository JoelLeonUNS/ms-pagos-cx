const db = require('../db');

class ReportesController {
  // Reporte de ingresos formateado para tablas/exportación
  static async getReporteIngresos(req, res) {
    try {
      const { 
        formato = 'tabla',  // 'tabla', 'resumen', 'detallado'
        periodo = 'mes-actual',  // 'mes-actual', 'ultimos-3-meses', 'ultimos-6-meses', 'anual', 'personalizado'
        agrupacion = 'fecha',  // 'fecha', 'plan', 'estado', 'mes'
        fecha_inicio,
        fecha_fin,
        plan_id,
        estado
      } = req.query;

      let whereClause = '1=1';
      let groupByClause = '';
      let selectClause = '';
      let params = [];

      // Construir filtros de fecha según el período
      switch (periodo) {
        case 'mes-actual':
          whereClause += ' AND YEAR(p.fecha_pago) = YEAR(CURDATE()) AND MONTH(p.fecha_pago) = MONTH(CURDATE())';
          break;
        case 'ultimos-3-meses':
          whereClause += ' AND p.fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
          break;
        case 'ultimos-6-meses':
          whereClause += ' AND p.fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';
          break;
        case 'anual':
          whereClause += ' AND YEAR(p.fecha_pago) = YEAR(CURDATE())';
          break;
        case 'personalizado':
          if (fecha_inicio && fecha_fin) {
            whereClause += ' AND DATE(p.fecha_pago) >= ? AND DATE(p.fecha_pago) <= ?';
            params.push(fecha_inicio, fecha_fin);
          }
          break;
      }

      // Filtros adicionales
      if (plan_id) {
        whereClause += ' AND p.plan_id = ?';
        params.push(plan_id);
      }

      if (estado) {
        whereClause += ' AND p.estado = ?';
        params.push(estado);
      }

      // Construir SELECT y GROUP BY según la agrupación
      switch (agrupacion) {
        case 'fecha':
          selectClause = `
            DATE(p.fecha_pago) as fecha,
            DAYNAME(p.fecha_pago) as dia_semana,
            COUNT(p.id) as total_transacciones,
            COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as pagos_aprobados,
            COUNT(CASE WHEN p.estado = 'pending' THEN 1 END) as pagos_pendientes,
            COUNT(CASE WHEN p.estado = 'rejected' THEN 1 END) as pagos_rechazados,
            SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_aprobados,
            SUM(CASE WHEN p.estado = 'pending' THEN p.monto ELSE 0 END) as ingresos_pendientes,
            SUM(p.monto) as monto_total_transacciones,
            ROUND(AVG(CASE WHEN p.estado = 'approved' THEN p.monto END), 2) as ticket_promedio
          `;
          groupByClause = 'GROUP BY DATE(p.fecha_pago) ORDER BY fecha DESC';
          break;

        case 'plan':
          selectClause = `
            pl.id as plan_id,
            pl.nombre as plan_nombre,
            pl.precio as plan_precio,
            pl.frecuencia as plan_frecuencia,
            pl.cant_usuarios as plan_cant_usuarios,
            COUNT(p.id) as total_transacciones,
            COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as pagos_aprobados,
            COUNT(CASE WHEN p.estado = 'pending' THEN 1 END) as pagos_pendientes,
            COUNT(CASE WHEN p.estado = 'rejected' THEN 1 END) as pagos_rechazados,
            SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_aprobados,
            SUM(CASE WHEN p.estado = 'pending' THEN p.monto ELSE 0 END) as ingresos_pendientes,
            ROUND((COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0)), 2) as tasa_aprobacion,
            ROUND(AVG(CASE WHEN p.estado = 'approved' THEN p.monto END), 2) as ticket_promedio
          `;
          groupByClause = 'GROUP BY pl.id, pl.nombre, pl.precio, pl.frecuencia, pl.cant_usuarios ORDER BY ingresos_aprobados DESC';
          break;

        case 'estado':
          selectClause = `
            p.estado,
            COUNT(p.id) as total_transacciones,
            SUM(p.monto) as monto_total,
            ROUND(AVG(p.monto), 2) as monto_promedio,
            ROUND((COUNT(p.id) * 100.0 / (SELECT COUNT(*) FROM pagos WHERE ${whereClause})), 2) as porcentaje_total
          `;
          groupByClause = 'GROUP BY p.estado ORDER BY total_transacciones DESC';
          break;

        case 'mes':
          selectClause = `
            YEAR(p.fecha_pago) as año,
            MONTH(p.fecha_pago) as mes,
            MONTHNAME(p.fecha_pago) as nombre_mes,
            COUNT(p.id) as total_transacciones,
            COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as pagos_aprobados,
            SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_aprobados,
            ROUND(AVG(CASE WHEN p.estado = 'approved' THEN p.monto END), 2) as ticket_promedio,
            COUNT(DISTINCT p.usuario_id) as usuarios_unicos
          `;
          groupByClause = 'GROUP BY YEAR(p.fecha_pago), MONTH(p.fecha_pago) ORDER BY año DESC, mes DESC';
          break;
      }

      const query = `
        SELECT ${selectClause}
        FROM pagos p
        LEFT JOIN planes pl ON p.plan_id = pl.id
        WHERE ${whereClause}
        ${groupByClause}
      `;

      const [rows] = await db.execute(query, params);

      // Calcular totales generales
      const [totales] = await db.execute(`
        SELECT 
          COUNT(p.id) as total_transacciones_periodo,
          COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as total_pagos_aprobados,
          COUNT(CASE WHEN p.estado = 'pending' THEN 1 END) as total_pagos_pendientes,
          COUNT(CASE WHEN p.estado = 'rejected' THEN 1 END) as total_pagos_rechazados,
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_totales_periodo,
          SUM(CASE WHEN p.estado = 'pending' THEN p.monto ELSE 0 END) as pendientes_totales_periodo,
          ROUND(AVG(CASE WHEN p.estado = 'approved' THEN p.monto END), 2) as ticket_promedio_periodo,
          COUNT(DISTINCT p.usuario_id) as usuarios_unicos_periodo
        FROM pagos p
        WHERE ${whereClause}
      `, params);

      // Formato de respuesta según el tipo solicitado
      let response = {
        success: true,
        data: {
          configuracion: {
            formato,
            periodo,
            agrupacion,
            filtros: {
              fecha_inicio: fecha_inicio || null,
              fecha_fin: fecha_fin || null,
              plan_id: plan_id || null,
              estado: estado || null
            }
          },
          resumen_periodo: totales[0],
          filas: rows,
          total_filas: rows.length,
          fecha_generacion: new Date().toISOString()
        }
      };

      // Si es formato tabla, agregar metadatos para headers
      if (formato === 'tabla') {
        const headers = [];
        
        switch (agrupacion) {
          case 'fecha':
            headers.push(
              { key: 'fecha', label: 'Fecha', tipo: 'date' },
              { key: 'dia_semana', label: 'Día', tipo: 'string' },
              { key: 'total_transacciones', label: 'Total Trans.', tipo: 'number' },
              { key: 'pagos_aprobados', label: 'Aprobados', tipo: 'number' },
              { key: 'pagos_pendientes', label: 'Pendientes', tipo: 'number' },
              { key: 'pagos_rechazados', label: 'Rechazados', tipo: 'number' },
              { key: 'ingresos_aprobados', label: 'Ingresos', tipo: 'currency' },
              { key: 'ticket_promedio', label: 'Ticket Prom.', tipo: 'currency' }
            );
            break;
          case 'plan':
            headers.push(
              { key: 'plan_nombre', label: 'Plan', tipo: 'string' },
              { key: 'plan_precio', label: 'Precio', tipo: 'currency' },
              { key: 'plan_frecuencia', label: 'Frecuencia', tipo: 'string' },
              { key: 'total_transacciones', label: 'Total Trans.', tipo: 'number' },
              { key: 'pagos_aprobados', label: 'Aprobados', tipo: 'number' },
              { key: 'ingresos_aprobados', label: 'Ingresos', tipo: 'currency' },
              { key: 'tasa_aprobacion', label: 'Tasa Aprob. %', tipo: 'percentage' },
              { key: 'ticket_promedio', label: 'Ticket Prom.', tipo: 'currency' }
            );
            break;
          case 'mes':
            headers.push(
              { key: 'año', label: 'Año', tipo: 'number' },
              { key: 'nombre_mes', label: 'Mes', tipo: 'string' },
              { key: 'total_transacciones', label: 'Total Trans.', tipo: 'number' },
              { key: 'pagos_aprobados', label: 'Aprobados', tipo: 'number' },
              { key: 'ingresos_aprobados', label: 'Ingresos', tipo: 'currency' },
              { key: 'usuarios_unicos', label: 'Usuarios Únicos', tipo: 'number' },
              { key: 'ticket_promedio', label: 'Ticket Prom.', tipo: 'currency' }
            );
            break;
        }
        
        response.data.metadatos_tabla = {
          headers,
          total_columnas: headers.length,
          tipos_dato: ['string', 'number', 'currency', 'date', 'percentage']
        };
      }

      res.json(response);

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de ingresos',
        error: error.message
      });
    }
  }

  // Reporte detallado de transacciones (para exportar a Excel/CSV)
  static async getReporteTransacciones(req, res) {
    try {
      const { 
        fecha_inicio,
        fecha_fin,
        plan_id,
        estado,
        usuario_id,
        limite = 1000
      } = req.query;

      let whereClause = '1=1';
      let params = [];

      // Filtros
      if (fecha_inicio && fecha_fin) {
        whereClause += ' AND DATE(p.fecha_pago) >= ? AND DATE(p.fecha_pago) <= ?';
        params.push(fecha_inicio, fecha_fin);
      }

      if (plan_id) {
        whereClause += ' AND p.plan_id = ?';
        params.push(plan_id);
      }

      if (estado) {
        whereClause += ' AND p.estado = ?';
        params.push(estado);
      }

      if (usuario_id) {
        whereClause += ' AND p.usuario_id = ?';
        params.push(usuario_id);
      }

      const [transacciones] = await db.execute(`
        SELECT 
          p.id as pago_id,
          p.usuario_id,
          p.plan_id,
          pl.nombre as plan_nombre,
          pl.precio as plan_precio,
          pl.frecuencia as plan_frecuencia,
          p.monto,
          p.moneda,
          p.estado,
          p.metodo_pago,
          p.referencia_ext,
          DATE(p.fecha_pago) as fecha_pago,
          TIME(p.fecha_pago) as hora_pago,
          DAYNAME(p.fecha_pago) as dia_semana,
          DATE(p.fecha_creacion) as fecha_creacion,
          p.observaciones
        FROM pagos p
        LEFT JOIN planes pl ON p.plan_id = pl.id
        WHERE ${whereClause}
        ORDER BY p.fecha_pago DESC
        LIMIT ?
      `, [...params, parseInt(limite)]);

      res.json({
        success: true,
        data: {
          configuracion: {
            filtros: {
              fecha_inicio: fecha_inicio || null,
              fecha_fin: fecha_fin || null,
              plan_id: plan_id || null,
              estado: estado || null,
              usuario_id: usuario_id || null
            },
            limite_resultados: limite
          },
          transacciones,
          total_transacciones: transacciones.length,
          headers_excel: [
            'ID Pago', 'Usuario ID', 'Plan', 'Precio Plan', 'Frecuencia',
            'Monto', 'Moneda', 'Estado', 'Método Pago', 'Referencia',
            'Fecha Pago', 'Hora', 'Día Semana', 'Fecha Creación', 'Observaciones'
          ],
          fecha_generacion: new Date().toISOString()
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de transacciones',
        error: error.message
      });
    }
  }

  // Reporte de rendimiento por planes (para análisis de producto)
  static async getReporteRendimientoPlanes(req, res) {
    try {
      const [rendimiento] = await db.execute(`
        SELECT 
          pl.id as plan_id,
          pl.nombre as plan_nombre,
          pl.precio as plan_precio,
          pl.frecuencia as plan_frecuencia,
          pl.cant_usuarios as plan_cant_usuarios,
          
          -- Métricas de volumen
          COUNT(p.id) as total_intentos_pago,
          COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) as pagos_exitosos,
          COUNT(CASE WHEN p.estado = 'pending' THEN 1 END) as pagos_pendientes,
          COUNT(CASE WHEN p.estado = 'rejected' THEN 1 END) as pagos_fallidos,
          
          -- Métricas de conversión
          ROUND((COUNT(CASE WHEN p.estado = 'approved' THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0)), 2) as tasa_conversion,
          ROUND((COUNT(CASE WHEN p.estado = 'rejected' THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0)), 2) as tasa_rechazo,
          
          -- Métricas financieras
          SUM(CASE WHEN p.estado = 'approved' THEN p.monto ELSE 0 END) as ingresos_totales,
          ROUND(AVG(CASE WHEN p.estado = 'approved' THEN p.monto END), 2) as ticket_promedio,
          SUM(CASE WHEN p.estado = 'pending' THEN p.monto ELSE 0 END) as ingresos_en_riesgo,
          
          -- Métricas temporales
          MIN(p.fecha_pago) as primera_venta,
          MAX(p.fecha_pago) as ultima_venta,
          COUNT(DISTINCT DATE(p.fecha_pago)) as dias_con_ventas,
          COUNT(DISTINCT p.usuario_id) as usuarios_unicos,
          
          -- Análisis de temporada
          COUNT(CASE WHEN MONTH(p.fecha_pago) IN (12, 1, 2) THEN 1 END) as ventas_temporada_alta,
          COUNT(CASE WHEN MONTH(p.fecha_pago) IN (6, 7, 8) THEN 1 END) as ventas_temporada_baja
          
        FROM planes pl
        LEFT JOIN pagos p ON pl.id = p.plan_id
        GROUP BY pl.id, pl.nombre, pl.precio, pl.frecuencia, pl.cant_usuarios
        ORDER BY ingresos_totales DESC
      `);

      // Calcular métricas adicionales
      const planesConMetricas = rendimiento.map(plan => {
        const diasDesdeCreacion = plan.primera_venta 
          ? Math.ceil((new Date() - new Date(plan.primera_venta)) / (1000 * 60 * 60 * 24))
          : 0;
          
        return {
          ...plan,
          ingresos_por_dia: diasDesdeCreacion > 0 
            ? Math.round((plan.ingresos_totales / diasDesdeCreacion) * 100) / 100
            : 0,
          frecuencia_venta: plan.dias_con_ventas > 0 
            ? Math.round((diasDesdeCreacion / plan.dias_con_ventas) * 100) / 100
            : 0,
          valor_por_usuario: plan.usuarios_unicos > 0 
            ? Math.round((plan.ingresos_totales / plan.usuarios_unicos) * 100) / 100
            : 0
        };
      });

      res.json({
        success: true,
        data: {
          planes_rendimiento: planesConMetricas,
          resumen_general: {
            total_planes_activos: planesConMetricas.filter(p => p.total_intentos_pago > 0).length,
            plan_mejor_conversion: planesConMetricas.reduce((best, current) => 
              current.tasa_conversion > best.tasa_conversion ? current : best, planesConMetricas[0]),
            plan_mas_rentable: planesConMetricas.reduce((best, current) => 
              current.ingresos_totales > best.ingresos_totales ? current : best, planesConMetricas[0])
          },
          headers_tabla: [
            'Plan', 'Precio', 'Frecuencia', 'Total Intentos', 'Pagos Exitosos',
            'Tasa Conversión %', 'Ingresos Totales', 'Ticket Promedio', 
            'Usuarios Únicos', 'Ingresos/Día', 'Valor/Usuario'
          ],
          fecha_generacion: new Date().toISOString()
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de rendimiento de planes',
        error: error.message
      });
    }
  }
}

module.exports = ReportesController;
