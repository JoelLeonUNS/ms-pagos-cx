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
# Vista general mensual
GET /api/reportes/ingresos?agrupacion=mes&periodo=ultimos-6-meses

# Rendimiento de planes
GET /api/reportes/rendimiento-planes
```

#### Para Análisis Financiero:
```bash
# Ingresos diarios del último trimestre
GET /api/reportes/ingresos?agrupacion=fecha&periodo=ultimos-3-meses

# Transacciones para auditoría
GET /api/reportes/transacciones?fecha_inicio=2025-07-01&fecha_fin=2025-07-31
```

#### Para Exportación a Excel/CSV:
```bash
# Datos con headers preparados para Excel
GET /api/reportes/transacciones?limite=5000

# Reporte de planes con métricas completas
GET /api/reportes/rendimiento-planes
```

### 🆚 Diferencias: Estadísticas vs Reportes

| Aspecto | Estadísticas (`/estadisticas`) | Reportes (`/reportes`) |
|---------|--------------------------------|------------------------|
| **Propósito** | Análisis y dashboards | Tablas y exportación |
| **Formato** | Datos agregados y resúmenes | Filas estructuradas |
| **Filtros** | Limitados y predefinidos | Altamente configurables |
| **Salida** | JSON para gráficos | Preparado para Excel/CSV |
| **Metadatos** | Contexto analítico | Headers de tabla |
| **Rendimiento** | Optimizado para velocidad | Optimizado para detalle |
