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
  "descripcion": "Ideal para uso básico"
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
- **PATCH** `/api/suscripciones/:id/estado` - Actualizar estado de suscripción
- **DELETE** `/api/suscripciones/:id` - Eliminar suscripción
- **POST** `/api/suscripciones/check-expired` - Verificar suscripciones vencidas y renovar automáticamente
- **POST** `/api/suscripciones/:id/renovar` - Renovar manualmente una suscripción
- **PATCH** `/api/suscripciones/:id/cancelar-renovacion` - Cancelar renovación automática

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

# Cancelar renovación automática
PATCH /api/suscripciones/456/cancelar-renovacion
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
  "descripcion": "Plan con todas las funcionalidades"
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
