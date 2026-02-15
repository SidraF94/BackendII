# Backend II - E-commerce con Arquitectura por Capas

Backend de e-commerce desarrollado con Node.js, Express, MongoDB y Handlebars.
El proyecto implementa una arquitectura por capas basada en DAO + DTO + Repository + Service + Controller, con autenticación JWT, autorización por roles, carrito, compra con ticket y vistas web.

## Descripción General

La aplicación permite:

- Registro e inicio de sesión de usuarios.
- Gestión de productos (con permisos de administrador).
- Gestión de carrito y checkout.
- Generación de tickets de compra.
- Recuperación de contraseña por email.
- Renderizado de vistas con Handlebars.
- Actualización en tiempo real de productos con Socket.IO.
- Carga de imágenes de productos y almacenamiento en MongoDB en formato Base64.

## Contexto de Entrega

Este proyecto parte del e-commerce realizado en Backend I y fue extendido para Backend II.

- Se mantuvo la funcionalidad de productos en tiempo real con Socket.IO.
- Se incorporaron usuarios y tickets como nuevas colecciones.
- Se adaptaron las colecciones de productos y carritos al flujo de compra completo del proyecto final.

## Arquitectura del Proyecto

El flujo principal sigue esta estructura:

Controller -> Service -> Repository -> DAO -> Model

Responsabilidades:

- Controllers: reciben requests y devuelven responses.
- Services: contienen reglas de negocio.
- Repositories: orquestan acceso a datos y mapeo con DTO.
- DAOs: encapsulan consultas a MongoDB/Mongoose.
- DTOs: exponen solo datos seguros y necesarios.

Esto mejora legibilidad, escalabilidad, testabilidad y mantenimiento.

## Stack Tecnológico

- Node.js + Express
- MongoDB + Mongoose
- Handlebars
- JWT + Passport
- express-session + cookie-parser
- bcrypt
- nodemailer
- multer
- socket.io

## Estructura Principal

src/
├── config/             # Passport y configuración
├── controllers/        # Capa HTTP
├── daos/mongo/         # Acceso a datos MongoDB
├── dtos/               # Transformaciones de salida
├── middlewares/        # Auth/autorización/upload
├── models/             # Esquemas Mongoose
├── repositories/       # Orquestación DAO + DTO
├── routes/             # Rutas API y vistas
├── services/           # Lógica de negocio
├── utils/              # Manejo de errores y mailing
├── views/              # Vistas Handlebars
└── public/             # CSS y assets

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con:

- MONGODB_URI
- JWT_SECRET
- SESSION_SECRET
- NODE_ENV (ej: development)

Opcionales (funcionalidades extra):

- EMAIL_USER
- EMAIL_PASS
- FRONTEND_URL

Nota: actualmente el servidor escucha en puerto 8080 fijo.

## Instalación y Ejecución

1) Instalar dependencias

npm install

2) Configurar `.env`

3) Iniciar servidor

npm start

## Rutas Principales

Vistas:

- GET / -> Home
- GET /products -> Catálogo
- GET /products/:pid -> Detalle de producto
- GET /carts/:cid -> Carrito
- GET /users/login | /users/register | /users/current
- GET /users/my-tickets | /users/tickets/:id

API:

- /api/users -> auth, current, gestión admin de usuarios
- /api/products -> CRUD de productos (alta/modificación/baja solo admin)
- /api/carts -> carrito y purchase
- /api/tickets -> consulta de tickets (usuario/admin)
- /api/images -> serve de imágenes de productos

## Manejo de Imágenes

- Las imágenes se reciben con `multer` en memoria.
- Se guardan dentro del producto en MongoDB como Base64 (`thumbnails.data`) junto con su `contentType`.
- Se exponen mediante `/api/images/:productId/:thumbnailIndex`.

## Reglas de Negocio Clave

- Solo admin puede crear, editar o eliminar productos.
- Solo usuario (no admin) puede agregar productos al carrito y finalizar compra.
- En purchase se valida stock, se descuenta inventario y se genera ticket.
- Si hay falta de stock, la compra puede ser parcial y el carrito conserva no disponibles.
- `current` expone usuario sin datos sensibles gracias a DTO.

## Seguridad

- JWT firmado en cookie segura (httpOnly + signed).
- Middleware de autorización por rol (`authenticateJWT`, `requireAdmin`, `requireUser`, etc.).
- Hash de contraseñas con bcrypt.
- Recuperación de contraseña con token temporal.
- Manejo centralizado de errores para API y vistas.

## Estado del Proyecto

Proyecto funcional y listo para demo/entrega académica.

Autor: Fernando Sidra
Curso: Backend II - Coderhouse
