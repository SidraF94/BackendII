import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport.js';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import userRouter from './routes/userRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import sessionsRouter from './routes/sessionsRouter.js';


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

// Configurar Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, 'views', 'layouts'),
    helpers: {
        eq: (a, b) => a === b,
        isArray: (value) => Array.isArray(value)
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

// Ruta raíz redirige a login
app.get('/', (req, res) => {
    if (req.user) {
        return res.redirect('/users/current');
    }
    res.redirect('/users/login');
});

// Rutas de usuarios
// /api/users - Servicios API con JWT
app.use('/api/users', userRouter);

// /api/sessions - Rutas de sesiones (login y current)
app.use('/api/sessions', sessionsRouter);

// /users - Vistas con Handlebars
app.use('/users', viewsRouter);

// Conexión a MongoDB
let uri = process.env.MONGODB_URI;

if (uri.includes('mongodb+srv://')) {
    uri = uri.replace(/\/[^\/\?]+(\?|$)/, '/integrative_practice$1');
} else if (uri.includes('mongodb://')) {
    uri = uri.replace(/\/[^\/\?]+(\?|$)/, '/integrative_practice$1');
}

mongoose.connection.on('error', (error) => {
    console.error('Error de conexión a MongoDB:', error.message);
    process.exit(1);
});

mongoose.connection.once('connected', () => {
    console.log('Conectado a MongoDB');
const PORT = 8080;
app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
});

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
}).catch((error) => {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
});
