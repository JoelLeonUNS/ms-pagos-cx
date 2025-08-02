# Microservicio de Pagos CX

Microservicio para la gestión de pagos, planes y suscripciones.

## Estructura del Proyecto

```
ms-pagos-cx/
├── controllers/           # Controladores de la aplicación
│   ├── plan.controller.js
│   ├── pago.controller.js
│   ├── suscripcion.controller.js
│   ├── mercadopago.controller.js
│   └── webhook.controller.js
├── models/               # Modelos de datos
│   ├── Plan.js
│   ├── Pago.js
│   └── Suscripcion.js
├── routes/               # Rutas de la API
│   ├── planes.js
│   ├── pagos.js
│   ├── suscripciones.js
│   ├── mercadopago.js
│   └── webhook.js
├── db.js                 # Configuración de base de datos
├── server.js             # Servidor principal
├── database.sql          # Script de creación de BD
├── API_DOCS.md          # Documentación de la API
└── .env.example         # Variables de entorno ejemplo
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Copiar el archivo de configuración:
   ```bash
   cp .env.example .env
   ```
4. Configurar las variables de entorno en `.env`
5. Ejecutar el script de base de datos `database.sql`

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## Base de Datos

El proyecto utiliza MySQL con las siguientes tablas:

- **planes**: Gestión de planes de suscripción
- **pagos**: Registro de pagos realizados
- **suscripciones**: Gestión de suscripciones de usuarios

## API Endpoints

Consulta `API_DOCS.md` para documentación completa de la API.

### Principales endpoints:

- `GET /health` - Health check
- `CRUD /api/planes` - Gestión de planes
- `CRUD /api/pagos` - Gestión de pagos
- `CRUD /api/suscripciones` - Gestión de suscripciones

## Características

✅ **CRUD completo** para planes, pagos y suscripciones
✅ **Validaciones** de datos de entrada
✅ **Respuestas consistentes** en formato JSON
✅ **Manejo de errores** centralizado
✅ **Arquitectura modular** (MVC)
✅ **Documentación** de API
✅ **Health check** endpoint
✅ **Integración** con MercadoPago
✅ **Webhooks** para notificaciones

## Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos
- **mysql2** - Driver de MySQL
- **MercadoPago SDK** - Integración de pagos
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Variables de entorno

## Configuración de Entorno

Variables requeridas en `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bd_cx_ms_pagos
PORT=3000
MERCADOPAGO_ACCESS_TOKEN=your_token
MERCADOPAGO_PUBLIC_KEY=your_key
```

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request
