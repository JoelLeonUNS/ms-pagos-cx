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
- **POST** `/api/suscripciones` - Crear nueva suscripción
- **PUT** `/api/suscripciones/:id` - Actualizar suscripción
- **PATCH** `/api/suscripciones/:id/estado` - Actualizar estado de suscripción
- **DELETE** `/api/suscripciones/:id` - Eliminar suscripción
- **POST** `/api/suscripciones/check-expired` - Verificar suscripciones vencidas

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

## Códigos de Estado

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
