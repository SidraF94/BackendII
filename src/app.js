import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport.js';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRouter from './routes/userRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import productsRouter from './routes/productsRouter.js';
import cartsRouter from './routes/cartsRouter.js';
import imagesRouter from './routes/imagesRouter.js';
import ticketsRouter from './routes/ticketsRouter.js';
import { errorHandler } from './utils/errorHandler.js';
import ProductService from './services/ProductService.js';


// Cargar variables de entorno
dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('ERROR JWT_SECRET no está configurado en .env');
    process.exit(1);
}

if (!process.env.SESSION_SECRET) {
    console.error('ERROR SESSION_SECRET no está configurado en .env');
    process.exit(1);
}

if (!process.env.MONGODB_URI) {
    console.error('ERROR MONGODB_URI no está configurado en .env');
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configurar Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, 'views', 'layouts'),
    helpers: {
        eq: (a, b) => a === b,
        isArray: (value) => Array.isArray(value),
        formatDate: (date) => {
            if (!date) return 'N/A';
            const d = new Date(date);
            return d.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', join(__dirname, 'views'));

// Servir archivos estáticos
app.use(express.static(join(__dirname, 'public')));

// Middlewares de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hs
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware para Socket.IO - debe estar antes de las rutas que lo necesitan
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Middleware para pasar información de autenticación a las vistas
app.use((req, res, next) => {
    try {
        const token = req.signedCookies?.currentUser;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.isAuthenticated = true;
            res.locals.userId = decoded.id;
            res.locals.userRole = decoded.role;
        } else {
            res.locals.isAuthenticated = false;
        }
    } catch (error) {
        res.locals.isAuthenticated = false;
    }
    next();
});

// Rutas de vistas (home, products, carritos) - Deben ir primero
app.use('/', viewsRouter);

// Rutas de usuarios
// /api/users - Servicios API con JWT
app.use('/api/users', userRouter);

// /users - Vistas con Handlebars
app.use('/users', viewsRouter);

// Rutas de productos y carritos
// /api/products - Servicios API de productos
app.use('/api/products', productsRouter);

// /api/carts - Servicios API de carritos
app.use('/api/carts', cartsRouter);

// /api/tickets - Servicios API de tickets/compras
app.use('/api/tickets', ticketsRouter);

// /api/images - Servir imágenes de productos
app.use('/api/images', imagesRouter);

// Middleware de manejo de errores (DEBE IR AL FINAL de todas las rutas)
app.use(errorHandler);

// Configuración de Socket.IO para productos en tiempo real
io.on("connection", (socket) => {
    console.log("Cliente conectado a Socket.IO");

    socket.on("newProduct", async (productData) => {
        try {
            // Usar ProductService (que usa Repository y DTO)
            const product = await ProductService.createProduct(productData, 'admin');
            io.emit("productAdded", product);
        } catch (error) {
            socket.emit("error", { message: error.message || "Error al agregar producto" });
        }
    });

    socket.on("deleteProduct", async (productId) => {
        try {
            // Usar ProductService (que usa Repository)
            await ProductService.deleteProduct(productId, 'admin');
            io.emit("productDeleted", productId);
        } catch (error) {
            socket.emit("error", { message: error.message || "Error al eliminar producto" });
        }
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado de Socket.IO");
    });
});

// Conexión a MongoDB
const uri = process.env.MONGODB_URI;

mongoose.connection.on('error', (error) => {
    console.error('Error de conexión a MongoDB:', error.message);
    process.exit(1);
});

mongoose.connection.once('connected', () => {
    console.log('Conectado a MongoDB');
    const PORT = 8080;
    httpServer.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
});

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
}).catch((error) => {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
});
