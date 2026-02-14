# Sistema de Autenticación de Usuarios - Backend

Sistema de autenticación completo desarrollado con Node.js y Express, implementando múltiples estrategias de autenticación incluyendo JWT, Passport Local y GitHub OAuth.

## 🚀 Descripción

Aplicación backend que proporciona un sistema robusto de registro, login y autenticación de usuarios. Incluye protección de rutas mediante JWT, gestión de sesiones, y autenticación social con GitHub. Implementa buenas prácticas de seguridad como encriptación de contraseñas con bcrypt y manejo seguro de tokens.

## 💻 Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** con **Mongoose** - Base de datos y ODM
- **Passport.js** - Autenticación (Local, JWT, GitHub OAuth)
- **JWT (jsonwebtoken)** - Tokens de autenticación
- **bcrypt** - Encriptación de contraseñas
- **Handlebars** - Motor de plantillas para las vistas
- **Express Session** - Gestión de sesiones
- **Cookie Parser** - Manejo de cookies
- **dotenv** - Variables de entorno

## ✨ Características

- Registro de usuarios con validación de datos
- Login con autenticación local
- Autenticación mediante GitHub OAuth
- Protección de rutas con JWT
- Gestión de sesiones seguras
- Encriptación de contraseñas
- Interfaz web con Handlebars
- API RESTful

## 📁 Estructura del Proyecto

```
src/
├── config/         # Configuración de Passport
├── middlewares/    # Middleware de autenticación JWT
├── models/         # Modelos de Mongoose
├── routes/         # Rutas de la API
├── views/          # Vistas Handlebars
└── public/         # Archivos estáticos
```

## 🔧 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (.env)
# JWT_SECRET, SESSION_SECRET, MONGODB_URI

# Ejecutar en desarrollo
npm start
```

## 🎓 Proyecto

Desarrollado como parte del curso Backend II de Coderhouse.
