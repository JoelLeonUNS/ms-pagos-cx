# API Documentation - Microservicio de Pagos

## Endpoints Disponibles

### Health Check
- **GET** `/health` - Verificar estado del servicio

### Planes

- **GET** `/api/planes` - Obtener todos los planes
- **GET** `/api/planes/:id` - Obtener plan por ID
- **POST** `/api/planes` - Crear nuevo plan
- **PUT** `/api/planes/:id` - Actualizar plan
- **DELETE** `/api/planes/:id` - Eliminar plan

#### Estructura Plan:
```json
{
  "nombre": "Plan Standard",
  "precio": 29.90,
  "frecuencia": "mensual", // "mensual" | "anual"
  "descripcion": "Ideal para uso básico",
  "beneficios": [
    "Acceso básico",
    "Soporte por email",
    "5 proyectos",
    "Almacenamiento 10GB"
  ],
  "cant_usuarios": 1 // Número de usuarios permitidos, -1 para ilimitado
}
```

### Pagos

- **GET** `/api/pagos` - Obtener todos los pagos
- **GET** `/api/pagos/:id` - Obtener pago por ID
- **GET** `/api/pagos/usuario/:usuarioId` - Obtener pagos por usuario
- **POST** `/api/pagos` - Crear nuevo pago
- **PUT** `/api/pagos/:id` - Actualizar pago
- **PATCH** `/api/pagos/:id/estado` - Actualizar estado del pago
- **DELETE** `/api/pagos/:id` - Eliminar pago

#### Estructura Pago:
```json
{
  "usuario_id": 1,
  "plan_id": 1,
  "monto": 29.90,
  "moneda": "PEN",
  "estado": "pending", // "pending" | "approved" | "rejected"
  "metodo_pago": "tarjeta",
  "referencia_ext": "MP-123456"
}
```

### Suscripciones

- **GET** `/api/suscripciones` - Obtener todas las suscripciones
- **GET** `/api/suscripciones/:id` - Obtener suscripción por ID
- **GET** `/api/suscripciones/usuario/:usuarioId` - Obtener suscripciones por usuario
- **GET** `/api/suscripciones/usuario/:usuarioId/activa` - Obtener suscripción activa por usuario
- **GET** `/api/suscripciones/usuario/:usuarioId/resumen` - Resumen completo del usuario
- **POST** `/api/suscripciones` - Crear nueva suscripción
- **PUT** `/api/suscripciones/:id` - Actualizar suscripción
- **PATCH** `/api/suscripciones/:id/estado` - Cambiar estado de suscripción (activa/vencida/cancelada)
- **DELETE** `/api/suscripciones/:id` - Eliminar suscripción
- **POST** `/api/suscripciones/check-expired` - Verificar suscripciones vencidas y renovar automáticamente
- **POST** `/api/suscripciones/:id/renovar` - Renovar manualmente una suscripción
- **PATCH** `/api/suscripciones/:id/renovacion-automatica` - Cambiar configuración de renovación automática (activar/desactivar)

#### Estructura Suscripción:
```json
{
  "usuario_id": 1,
  "plan_id": 1,
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-02-01",
  "renovacion_automatica": true
}
```

### MercadoPago y Webhooks

- **POST** `/api/mercadopago/*` - Endpoints de integración MercadoPago
- **POST** `/api/webhook/*` - Endpoints de webhooks

### Estadísticas de Ingresos

- **GET** `/api/estadisticas/ingresos/por-mes` - Ingresos por mes (últimos 12 meses)
- **GET** `/api/estadisticas/ingresos/mes-actual` - Ingresos del mes actual detallados
- **GET** `/api/estadisticas/ingresos/generales` - Estadísticas generales y comparativas
- **GET** `/api/estadisticas/ingresos/por-planes` - Estadísticas detalladas por cada plan
- **GET** `/api/estadisticas/ingresos/rango?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD` - Ingresos por rango de fechas

### Reportes Formateados

- **GET** `/api/reportes/ingresos` - Reporte de ingresos formateado para tablas/exportación
- **GET** `/api/reportes/transacciones` - Listado detallado de transacciones para exportar
- **GET** `/api/reportes/rendimiento-planes` - Análisis de rendimiento por planes

#### Parámetros del Reporte de Ingresos:

| Parámetro | Tipo | Valores | Descripción |
|-----------|------|---------|-------------|
| `formato` | string | `tabla`, `resumen`, `detallado` | Tipo de formato de salida (por defecto: `tabla`) |
| `periodo` | string | `mes-actual`, `ultimos-3-meses`, `ultimos-6-meses`, `anual`, `personalizado` | Período de tiempo a consultar |
| `agrupacion` | string | `fecha`, `plan`, `estado`, `mes` | Cómo agrupar los datos |
| `fecha_inicio` | string | YYYY-MM-DD | Para período personalizado |
| `fecha_fin` | string | YYYY-MM-DD | Para período personalizado |
| `plan_id` | integer | ID del plan | Filtrar por plan específico |
| `estado` | string | `pending`, `approved`, `rejected` | Filtrar por estado |

#### Ejemplos de Uso del Reporte de Ingresos:

```bash
# Reporte por fecha del mes actual (configuración por defecto)
GET /api/reportes/ingresos

# Reporte por planes del último trimestre
GET /api/reportes/ingresos?agrupacion=plan&periodo=ultimos-3-meses

# Reporte mensual de todo el año
GET /api/reportes/ingresos?agrupacion=mes&periodo=anual

# Reporte por plan específico con rango personalizado
GET /api/reportes/ingresos?agrupacion=fecha&periodo=personalizado&fecha_inicio=2025-07-01&fecha_fin=2025-07-31&plan_id=1

# Reporte solo de pagos aprobados
GET /api/reportes/ingresos?agrupacion=plan&estado=approved
```

#### Respuesta del Reporte de Ingresos (Agrupación por Fecha):
```json
{
  "success": true,
  "data": {
    "configuracion": {
      "formato": "tabla",
      "periodo": "mes-actual",
      "agrupacion": "fecha",
      "filtros": {
        "fecha_inicio": null,
        "fecha_fin": null,
        "plan_id": null,
        "estado": null
      }
    },
    "resumen_periodo": {
      "total_transacciones_periodo": 1,
      "total_pagos_aprobados": 1,
      "total_pagos_pendientes": 0,
      "total_pagos_rechazados": 0,
      "ingresos_totales_periodo": "29.90",
      "pendientes_totales_periodo": "0.00",
      "ticket_promedio_periodo": "29.90",
      "usuarios_unicos_periodo": 1
    },
    "filas": [
      {
        "fecha": "2025-08-02T05:00:00.000Z",
        "dia_semana": "Saturday",
        "total_transacciones": 1,
        "pagos_aprobados": 1,
        "pagos_pendientes": 0,
        "pagos_rechazados": 0,
        "ingresos_aprobados": "29.90",
        "ingresos_pendientes": "0.00",
        "monto_total_transacciones": "29.90",
        "ticket_promedio": "29.90"
      }
    ],
    "total_filas": 1,
    "metadatos_tabla": {
      "headers": [
        { "key": "fecha", "label": "Fecha", "tipo": "date" },
        { "key": "dia_semana", "label": "Día", "tipo": "string" },
        { "key": "total_transacciones", "label": "Total Trans.", "tipo": "number" },
        { "key": "pagos_aprobados", "label": "Aprobados", "tipo": "number" },
        { "key": "pagos_pendientes", "label": "Pendientes", "tipo": "number" },
        { "key": "pagos_rechazados", "label": "Rechazados", "tipo": "number" },
        { "key": "ingresos_aprobados", "label": "Ingresos", "tipo": "currency" },
        { "key": "ticket_promedio", "label": "Ticket Prom.", "tipo": "currency" }
      ],
      "total_columnas": 8,
      "tipos_dato": ["string", "number", "currency", "date", "percentage"]
    },
    "fecha_generacion": "2025-08-03T23:41:47.258Z"
  }
}
```

#### Respuesta del Reporte de Ingresos (Agrupación por Plan):
```json
{
  "success": true,
  "data": {
    "configuracion": {
      "formato": "tabla",
      "periodo": "mes-actual",
      "agrupacion": "plan"
    },
    "filas": [
      {
        "plan_id": 1,
        "plan_nombre": "Plan Standard",
        "plan_precio": "29.90",
        "plan_frecuencia": "mensual",
        "plan_cant_usuarios": 1,
        "total_transacciones": 1,
        "pagos_aprobados": 1,
        "pagos_pendientes": 0,
        "pagos_rechazados": 0,
        "ingresos_aprobados": "29.90",
        "ingresos_pendientes": "0.00",
        "tasa_aprobacion": "100.00",
        "ticket_promedio": "29.90"
      }
    ],
    "metadatos_tabla": {
      "headers": [
        { "key": "plan_nombre", "label": "Plan", "tipo": "string" },
        { "key": "plan_precio", "label": "Precio", "tipo": "currency" },
        { "key": "plan_frecuencia", "label": "Frecuencia", "tipo": "string" },
        { "key": "total_transacciones", "label": "Total Trans.", "tipo": "number" },
        { "key": "pagos_aprobados", "label": "Aprobados", "tipo": "number" },
        { "key": "ingresos_aprobados", "label": "Ingresos", "tipo": "currency" },
        { "key": "tasa_aprobacion", "label": "Tasa Aprob. %", "tipo": "percentage" },
        { "key": "ticket_promedio", "label": "Ticket Prom.", "tipo": "currency" }
      ]
    }
  }
}
```

#### Parámetros del Reporte de Transacciones:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `limite` | integer | Número máximo de transacciones a devolver (por defecto: 10) |

#### Ejemplo de Uso del Reporte de Transacciones:

```bash
# Listado básico de transacciones (últimas 10)
GET /api/reportes/transacciones

# Listado de las últimas 50 transacciones
GET /api/reportes/transacciones?limite=50
```

#### Respuesta del Reporte de Transacciones:
```json
{
  "success": true,
  "data": {
    "transacciones": [
      {
        "pago_id": 2,
        "usuario_id": 1,
        "plan_id": 1,
        "plan_nombre": "Plan Standard",
        "monto": "29.90",
        "estado": "approved",
        "metodo_pago": "tarjeta_credito",
        "fecha_pago": "2025-08-02"
      },
      {
        "pago_id": 1,
        "usuario_id": 1,
        "plan_id": 1,
        "plan_nombre": "Plan Standard",
        "monto": "29.90",
        "estado": "approved",
        "metodo_pago": "manual",
        "fecha_pago": "2025-07-29"
      }
    ],
    "total_transacciones": 2,
    "headers_excel": [
      "ID Pago", "Usuario ID", "Plan", "Monto", "Estado", "Método Pago", "Fecha"
    ],
    "fecha_generacion": "2025-08-03T23:45:24.399Z"
  }
}
```

#### Ejemplo de Uso del Reporte de Rendimiento de Planes:

```bash
# Análisis completo de rendimiento de todos los planes
GET /api/reportes/rendimiento-planes
```

#### Respuesta del Reporte de Rendimiento de Planes:
```json
{
  "success": true,
  "data": {
    "planes_rendimiento": [
      {
        "plan_id": 1,
        "plan_nombre": "Plan Standard",
        "plan_precio": "29.90",
        "plan_frecuencia": "mensual",
        "plan_cant_usuarios": 1,
        "total_intentos_pago": 2,
        "pagos_exitosos": 2,
        "pagos_pendientes": 0,
        "pagos_fallidos": 0,
        "tasa_conversion": "100.00",
        "tasa_rechazo": "0.00",
        "ingresos_totales": "59.80",
        "ticket_promedio": "29.90",
        "ingresos_en_riesgo": "0.00",
        "primera_venta": "2025-07-29T06:59:33.000Z",
        "ultima_venta": "2025-08-02T20:55:41.000Z",
        "dias_con_ventas": 2,
        "usuarios_unicos": 1,
        "ventas_temporada_alta": 0,
        "ventas_temporada_baja": 2,
        "ingresos_por_dia": 9.97,
        "frecuencia_venta": 3,
        "valor_por_usuario": 59.8
      },
      {
        "plan_id": 2,
        "plan_nombre": "Plan Business",
        "plan_precio": "59.90",
        "plan_frecuencia": "mensual",
        "plan_cant_usuarios": 10,
        "total_intentos_pago": 0,
        "pagos_exitosos": 0,
        "pagos_pendientes": 0,
        "pagos_fallidos": 0,
        "tasa_conversion": null,
        "tasa_rechazo": null,
        "ingresos_totales": "0.00",
        "ticket_promedio": null,
        "ingresos_en_riesgo": "0.00",
        "primera_venta": null,
        "ultima_venta": null,
        "dias_con_ventas": 0,
        "usuarios_unicos": 0,
        "ventas_temporada_alta": 0,
        "ventas_temporada_baja": 0,
        "ingresos_por_dia": 0,
        "frecuencia_venta": 0,
        "valor_por_usuario": 0
      }
    ],
    "resumen_general": {
      "total_planes_activos": 1,
      "plan_mejor_conversion": {
        "plan_nombre": "Plan Standard",
        "tasa_conversion": "100.00"
      },
      "plan_mas_rentable": {
        "plan_nombre": "Plan Standard",
        "ingresos_totales": "59.80"
      }
    },
    "headers_tabla": [
      "Plan", "Precio", "Frecuencia", "Total Intentos", "Pagos Exitosos",
      "Tasa Conversión %", "Ingresos Totales", "Ticket Promedio", 
      "Usuarios Únicos", "Ingresos/Día", "Valor/Usuario"
    ],
    "fecha_generacion": "2025-08-03T23:45:24.399Z"
  }
}
```

#### Respuesta Ingresos por Mes:
```json
{
  "success": true,
  "data": {
    "ingresos_por_mes": [
      {
        "año": 2025,
        "mes": 8,
        "nombre_mes": "August",
        "total_pagos": 45,
        "ingresos_totales": 1347.50,
        "ingreso_promedio": 29.94
      }
    ],
    "total_meses": 12
  }
}
```

#### Respuesta Mes Actual:
```json
{
  "success": true,
  "data": {
    "resumen_mes_actual": {
      "año": 2025,
      "mes": 8,
      "nombre_mes": "August",
      "total_pagos": 23,
      "ingresos_aprobados": 689.70,
      "ingresos_pendientes": 119.80,
      "ingresos_rechazados": 59.90,
      "pagos_aprobados": 23,
      "pagos_pendientes": 4,
      "pagos_rechazados": 2
    },
    "ingresos_por_plan": [
      {
        "plan_nombre": "Plan Premium",
        "plan_precio": 99.90,
        "total_pagos": 15,
        "ingresos_plan": 1498.50
      }
    ]
  }
}
```

#### Respuesta Ingresos por Planes:
```json
{
  "success": true,
  "data": {
    "resumen": {
      "total_planes": 3,
      "plan_mas_rentable": {
        "plan_nombre": "Plan Premium",
        "ingresos_totales": 2997.00,
        "pagos_aprobados": 30
      },
      "plan_mas_vendido": {
        "plan_nombre": "Plan Standard",
        "pagos_aprobados": 45,
        "ingresos_totales": 1346.50
      }
    },
    "estadisticas_por_plan": [
      {
        "plan_id": 1,
        "plan_nombre": "Plan Standard",
        "plan_precio": 29.90,
        "plan_frecuencia": "mensual",
        "plan_cant_usuarios": 1,
        "total_pagos": 50,
        "pagos_aprobados": 45,
        "pagos_pendientes": 3,
        "pagos_rechazados": 2,
        "ingresos_totales": 1346.50,
        "ingresos_pendientes": 89.70,
        "ingreso_promedio": 29.90,
        "primer_venta": "2025-01-15T10:30:00.000Z",
        "ultima_venta": "2025-08-02T14:22:00.000Z"
      }
    ],
    "comparacion_mensual": [
      {
        "plan_nombre": "Plan Standard",
        "mes_actual": { "ventas": 12, "ingresos": 358.80 },
        "mes_anterior": { "ventas": 8, "ingresos": 239.20 },
        "crecimiento_ventas": "50.00%",
        "crecimiento_ingresos": "50.00%"
      }
    ]
  }
}
```

## Estructura de Respuesta

Todas las respuestas siguen el formato:

```json
{
  "success": true|false,
  "message": "Mensaje descriptivo",
  "data": {} // Datos solicitados
}
```

## Lógica Automática de Suscripciones

### 🔄 Flujo Automático

1. **Pago Aprobado → Suscripción Activa**
   - Cuando un pago cambia a estado "approved", automáticamente se crea/renueva la suscripción
   - Se calcula la fecha de vencimiento según el plan (mensual/anual)

2. **Verificación de Vencimientos**
   - Cada hora se ejecuta automáticamente
   - Marca como "vencida" las suscripciones que pasaron su fecha
   - Identifica suscripciones para renovación automática (3 días antes del vencimiento)

3. **Renovación Automática**
   - Para suscripciones con `renovacion_automatica = true`
   - Crea automáticamente un nuevo pago
   - Extiende la fecha de vencimiento

### 🎯 Endpoints de Automatización

```bash
# Verificar vencimientos y procesar renovaciones
POST /api/suscripciones/check-expired

# Obtener resumen completo de usuario
GET /api/suscripciones/usuario/123/resumen

# Renovar manualmente una suscripción
POST /api/suscripciones/456/renovar

# Cambiar configuración de renovación automática (activar/desactivar)
PATCH /api/suscripciones/456/renovacion-automatica
```

### 📊 Respuesta del Resumen de Usuario

```json
{
  "success": true,
  "data": {
    "suscripcion_activa": {
      "id": 1,
      "plan_nombre": "Plan Standard",
      "fecha_fin": "2025-09-02",
      "renovacion_automatica": true
    },
    "tiene_suscripcion_activa": true,
    "dias_restantes": 31,
    "historial_suscripciones": [...],
    "historial_pagos": [...]
  }
}
```

- **200** - OK
- **201** - Creado
- **400** - Solicitud incorrecta
- **404** - No encontrado
- **500** - Error interno del servidor

## Ejemplos de Uso

### Crear un Plan
```bash
POST /api/planes
Content-Type: application/json

{
  "nombre": "Plan Premium",
  "precio": 99.90,
  "frecuencia": "mensual",
  "descripcion": "Plan con todas las funcionalidades",
  "beneficios": [
    "Acceso premium",
    "Soporte 24/7",
    "Proyectos ilimitados",
    "Almacenamiento 1TB",
    "API dedicada",
    "Backup automático"
  ],
  "cant_usuarios": -1
}
```

### Crear un Pago
```bash
POST /api/pagos
Content-Type: application/json

{
  "usuario_id": 1,
  "plan_id": 1,
  "monto": 29.90,
  "estado": "pending",
  "metodo_pago": "mercadopago"
}
```

### Crear una Suscripción
```bash
POST /api/suscripciones
Content-Type: application/json

{
  "usuario_id": 1,
  "plan_id": 1,
  "fecha_inicio": "2025-08-01",
  "fecha_fin": "2025-09-01",
  "renovacion_automatica": true
}
```

### Cambiar Estado de Suscripción
```bash
# Marcar suscripción como vencida
PATCH /api/suscripciones/1/estado
Content-Type: application/json

{
  "estado": "vencida"
}

# Reactivar suscripción
PATCH /api/suscripciones/1/estado
Content-Type: application/json

{
  "estado": "activa"
}

# Cancelar suscripción
PATCH /api/suscripciones/1/estado
Content-Type: application/json

{
  "estado": "cancelada"
}
```

### Cambiar Renovación Automática
```bash
# Desactivar renovación automática
PATCH /api/suscripciones/1/renovacion-automatica
Content-Type: application/json

{
  "renovacion_automatica": false
}

# Activar renovación automática
PATCH /api/suscripciones/1/renovacion-automatica
Content-Type: application/json

{
  "renovacion_automatica": true
}
```

### Consultar Estadísticas de Ingresos
```bash
# Ingresos por mes (últimos 12 meses)
GET /api/estadisticas/ingresos/por-mes

# Ingresos del mes actual
GET /api/estadisticas/ingresos/mes-actual

# Estadísticas generales con comparativas
GET /api/estadisticas/ingresos/generales

# Estadísticas detalladas por cada plan
GET /api/estadisticas/ingresos/por-planes

# Ingresos por rango de fechas específico
GET /api/estadisticas/ingresos/rango?fecha_inicio=2025-07-01&fecha_fin=2025-07-31
```

## 📋 Changelog API

### v1.3.0 - Sistema Completo de Reportes (2025-08-03)

#### ✅ Nuevas Funcionalidades:
- **📊 Endpoints de reportes formateados** para tablas y exportación
- **🎯 Múltiples agrupaciones**: fecha, plan, estado, mes
- **📅 Períodos configurables**: mes actual, trimestres, anual, personalizado
- **🏷️ Metadatos de tabla** con headers y tipos de datos
- **📤 Headers para Excel/CSV** preconfigurados

#### 🆕 Endpoints Agregados:
- **`GET /api/reportes/ingresos`**: Reporte configurable de ingresos
  - Parámetros: formato, período, agrupación, filtros
  - Respuesta: datos + metadatos de tabla + resumen
- **`GET /api/reportes/transacciones`**: Listado detallado para exportación
  - Parámetros: límite de registros
  - Respuesta: transacciones + headers Excel
- **`GET /api/reportes/rendimiento-planes`**: Análisis de performance
  - Sin parámetros requeridos
  - Respuesta: métricas completas + resumen ejecutivo

#### 🎨 Características Clave:
- **Metadatos de tabla**: Headers con tipos (currency, date, number, percentage)
- **Agrupaciones flexibles**: Por fecha, plan, estado o mes
- **Períodos dinámicos**: Desde mes actual hasta rangos personalizados
- **Métricas calculadas**: Tasa conversión, ingresos por día, valor por usuario
- **Headers Excel**: Preparados para exportación directa

#### 📊 Ejemplos de Uso:
```bash
# Dashboard ejecutivo
GET /api/reportes/ingresos?agrupacion=mes&periodo=anual

# Exportación contable
GET /api/reportes/transacciones?limite=1000

# Análisis de producto
GET /api/reportes/rendimiento-planes
```

#### 🔧 Archivos Creados/Modificados:
- `controllers/reportes.controller.js` - Lógica de reportes
- `routes/reportes.js` - Rutas de reportes
- `server.js` - Registro de nuevas rutas
- `API_DOCS.md` - Documentación completa con ejemplos

### v1.2.0 - Límites de Usuarios en Planes (2025-08-03)

#### ✅ Nuevas Funcionalidades:
- **Nueva columna `cant_usuarios`** en la tabla planes
- **Límites de usuarios por plan** configurables
- **Validación de límites** en creación y actualización de planes
- **Estadísticas mejoradas** con información de límites de usuarios

#### 🆕 Campo Agregado:
- **`cant_usuarios`**: Número entero que define cuántos usuarios puede tener el plan
  - Valores positivos (1, 5, 10, etc.): Límite específico de usuarios
  - Valor -1: Usuarios ilimitados
  - Valor por defecto: 1

#### 📊 Ejemplos de Configuración:
```json
{
  "nombre": "Plan Standard",
  "cant_usuarios": 1,
  "descripcion": "Para uso individual"
}

{
  "nombre": "Plan Business", 
  "cant_usuarios": 10,
  "descripcion": "Para equipos pequeños"
}

{
  "nombre": "Plan Enterprise",
  "cant_usuarios": -1,
  "descripcion": "Para organizaciones grandes (usuarios ilimitados)"
}
```

#### 🔧 Archivos Modificados:
- `models/Plan.js` - Soporte para cant_usuarios
- `controllers/plan.controller.js` - Validación de límites
- `controllers/estadisticas.controller.js` - Incluye cant_usuarios en estadísticas
- `database.sql` - Esquema actualizado con nueva columna
- `migration_beneficios.sql` - Script de migración para bases existentes

### v1.1.0 - Optimización de Rutas (2025-08-02)

#### ✅ Cambios Realizados:
- **Eliminadas rutas duplicadas** para una API más limpia
- **Unificado endpoint de renovación automática** en `/renovacion-automatica`
- **Removidos endpoints de testing** de producción

#### 🗑️ Endpoints Eliminados:
- `PATCH /api/suscripciones/:id/cancelar-renovacion` ➜ **Reemplazado por** `/renovacion-automatica` con `{"renovacion_automatica": false}`
- `POST /api/pagos/:id/procesar-suscripcion` ➜ **Removido** (endpoint de testing)

#### 🎯 Total de Endpoints:
- **Antes:** 30 rutas
- **Después:** 26 rutas optimizadas
- **Mejora:** API más limpia y mantenible

#### 💡 Uso Recomendado:
Para cambiar la configuración de renovación automática, usar únicamente:
```bash
PATCH /api/suscripciones/:id/renovacion-automatica
```
Con el body apropiado para activar (`true`) o desactivar (`false`).

## 📊 Nuevos Endpoints de Reportes (v1.3.0)

### Reportes Formateados para Tablas/Exportación

Los nuevos endpoints de reportes están diseñados específicamente para generar datos formateados que puedan ser utilizados directamente en tablas, exportaciones a Excel/CSV o análisis detallados.

#### 🎯 Reporte de Ingresos Configurable

**GET** `/api/reportes/ingresos`

##### Parámetros Query:
- **formato**: `tabla` | `resumen` | `detallado` (por defecto: `tabla`)
- **periodo**: `mes-actual` | `ultimos-3-meses` | `ultimos-6-meses` | `anual` | `personalizado`
- **agrupacion**: `fecha` | `plan` | `estado` | `mes`
- **fecha_inicio** y **fecha_fin**: Para período personalizado (formato: YYYY-MM-DD)
- **plan_id**: Filtrar por plan específico
- **estado**: Filtrar por estado (`pending`, `approved`, `rejected`)

##### Ejemplo de Uso:
```bash
# Reporte por fecha del mes actual
GET /api/reportes/ingresos?formato=tabla&periodo=mes-actual&agrupacion=fecha

# Reporte por planes con rango personalizado
GET /api/reportes/ingresos?agrupacion=plan&periodo=personalizado&fecha_inicio=2025-07-01&fecha_fin=2025-07-31

# Reporte mensual de todo el año
GET /api/reportes/ingresos?agrupacion=mes&periodo=anual
```

##### Respuesta de Ejemplo:
```json
{
  "success": true,
  "data": {
    "configuracion": {
      "formato": "tabla",
      "periodo": "mes-actual",
      "agrupacion": "fecha"
    },
    "resumen_periodo": {
      "total_transacciones_periodo": 156,
      "total_pagos_aprobados": 142,
      "ingresos_totales_periodo": 4248.50,
      "ticket_promedio_periodo": 29.90
    },
    "filas": [
      {
        "fecha": "2025-08-03",
        "dia_semana": "Sunday",
        "total_transacciones": 12,
        "pagos_aprobados": 11,
        "ingresos_aprobados": 328.90,
        "ticket_promedio": 29.90
      }
    ],
    "metadatos_tabla": {
      "headers": [
        { "key": "fecha", "label": "Fecha", "tipo": "date" },
        { "key": "total_transacciones", "label": "Total Trans.", "tipo": "number" },
        { "key": "ingresos_aprobados", "label": "Ingresos", "tipo": "currency" }
      ],
      "tipos_dato": ["string", "number", "currency", "date", "percentage"]
    }
  }
}
```

#### 📋 Listado Detallado de Transacciones

**GET** `/api/reportes/transacciones`

##### Parámetros Query:
- **fecha_inicio** y **fecha_fin**: Rango de fechas (YYYY-MM-DD)
- **plan_id**: Filtrar por plan específico
- **estado**: Filtrar por estado de pago
- **usuario_id**: Filtrar por usuario específico
- **limite**: Límite de resultados (por defecto: 1000)

##### Ejemplo de Uso:
```bash
# Todas las transacciones de julio 2025
GET /api/reportes/transacciones?fecha_inicio=2025-07-01&fecha_fin=2025-07-31

# Transacciones aprobadas de un plan específico
GET /api/reportes/transacciones?plan_id=1&estado=approved&limite=500
```

##### Respuesta:
```json
{
  "success": true,
  "data": {
    "transacciones": [
      {
        "pago_id": 123,
        "usuario_id": 45,
        "plan_nombre": "Plan Standard",
        "monto": 29.90,
        "estado": "approved",
        "fecha_pago": "2025-08-03",
        "hora_pago": "14:30:00",
        "dia_semana": "Sunday"
      }
    ],
    "headers_excel": [
      "ID Pago", "Usuario ID", "Plan", "Monto", "Estado", 
      "Fecha Pago", "Hora", "Día Semana"
    ]
  }
}
```

#### 📈 Análisis de Rendimiento por Planes

**GET** `/api/reportes/rendimiento-planes`

Proporciona métricas avanzadas de rendimiento para cada plan, ideales para análisis de producto y toma de decisiones estratégicas.

##### Respuesta:
```json
{
  "success": true,
  "data": {
    "planes_rendimiento": [
      {
        "plan_nombre": "Plan Standard",
        "total_intentos_pago": 200,
        "pagos_exitosos": 185,
        "tasa_conversion": 92.50,
        "tasa_rechazo": 7.50,
        "ingresos_totales": 5531.50,
        "ticket_promedio": 29.90,
        "usuarios_unicos": 185,
        "ingresos_por_dia": 42.55,
        "valor_por_usuario": 29.90
      }
    ],
    "resumen_general": {
      "plan_mejor_conversion": { "plan_nombre": "Plan Premium", "tasa_conversion": 95.2 },
      "plan_mas_rentable": { "plan_nombre": "Plan Enterprise", "ingresos_totales": 15000 }
    }
  }
}
```

### 🎨 Casos de Uso para los Reportes

#### Para Dashboards Ejecutivos:
```bash
# Vista general mensual con métricas clave
GET /api/reportes/ingresos?agrupacion=mes&periodo=ultimos-6-meses

# Análisis de rendimiento de todos los planes
GET /api/reportes/rendimiento-planes

# Resumen de ingresos por plan del mes actual
GET /api/reportes/ingresos?agrupacion=plan&periodo=mes-actual
```

#### Para Análisis Financiero:
```bash
# Ingresos diarios del último trimestre
GET /api/reportes/ingresos?agrupacion=fecha&periodo=ultimos-3-meses

# Comparación de planes por rentabilidad
GET /api/reportes/ingresos?agrupacion=plan&periodo=anual

# Análisis de pagos rechazados
GET /api/reportes/ingresos?agrupacion=fecha&estado=rejected&periodo=ultimos-6-meses
```

#### Para Exportación a Excel/CSV:
```bash
# Transacciones detalladas para auditoría (últimas 1000)
GET /api/reportes/transacciones?limite=1000

# Datos de rendimiento por plan para análisis de producto
GET /api/reportes/rendimiento-planes

# Reporte completo por fechas para contabilidad
GET /api/reportes/ingresos?agrupacion=fecha&periodo=personalizado&fecha_inicio=2025-01-01&fecha_fin=2025-12-31
```

#### Para Análisis de Temporadas:
```bash
# Comparar ingresos por mes para identificar tendencias
GET /api/reportes/ingresos?agrupacion=mes&periodo=anual

# Rendimiento de planes para identificar estacionalidad
GET /api/reportes/rendimiento-planes

# Análisis de un período específico (ej: campaña navideña)
GET /api/reportes/ingresos?agrupacion=fecha&periodo=personalizado&fecha_inicio=2025-12-01&fecha_fin=2025-12-31
```

### 🔧 Tips de Implementación Frontend

#### Para Tablas Dinámicas:
```javascript
// Usar metadatos_tabla para generar columnas automáticamente
const response = await fetch('/api/reportes/ingresos?formato=tabla');
const data = await response.json();

// Headers dinámicos
const columns = data.data.metadatos_tabla.headers.map(header => ({
  key: header.key,
  title: header.label,
  dataType: header.tipo, // 'currency', 'date', 'number', etc.
}));

// Datos listos para tabla
const rows = data.data.filas;
```

#### Para Exportación Excel:
```javascript
// Headers preparados para Excel
const response = await fetch('/api/reportes/transacciones?limite=5000');
const data = await response.json();

const excelHeaders = data.data.headers_excel; // Array de strings
const excelData = data.data.transacciones;    // Array de objetos
```

#### Para Gráficos:
```javascript
// Datos por mes para gráfico de línea temporal
const response = await fetch('/api/reportes/ingresos?agrupacion=mes&periodo=anual');
const data = await response.json();

const chartData = data.data.filas.map(item => ({
  x: `${item.nombre_mes} ${item.año}`,
  y: parseFloat(item.ingresos_aprobados)
}));
```

### 🆚 Diferencias: Estadísticas vs Reportes

| Aspecto | Estadísticas (`/estadisticas`) | Reportes (`/reportes`) |
|---------|--------------------------------|------------------------|
| **Propósito** | Análisis y dashboards en tiempo real | Tablas estructuradas y exportación |
| **Formato** | Datos agregados con contexto analítico | Filas tabulares con metadatos |
| **Filtros** | Limitados y predefinidos | Altamente configurables (período, agrupación, filtros) |
| **Salida** | JSON optimizado para gráficos | JSON preparado para Excel/CSV/Tablas |
| **Metadatos** | Contexto analítico y comparativas | Headers de tabla con tipos de datos |
| **Rendimiento** | Optimizado para velocidad | Optimizado para detalle y exportación |
| **Agrupaciones** | Fijas por endpoint | Dinámicas via parámetros |
| **Uso típico** | Charts, KPIs, métricas rápidas | Reportes ejecutivos, auditorías, Excel |

#### 💡 Cuándo usar cada uno:

**Usa `/estadisticas`** para:
- 📈 Gráficos y visualizaciones
- ⚡ Métricas rápidas en dashboards
- 🔍 Análisis comparativos predefinidos
- 📊 KPIs en tiempo real

**Usa `/reportes`** para:
- 📋 Tablas dinámicas en frontend
- 📤 Exportación a Excel/CSV
- 📄 Reportes ejecutivos detallados
- 🔧 Análisis configurables por usuario
