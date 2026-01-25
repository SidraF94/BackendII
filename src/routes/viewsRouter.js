import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import { authenticateJWT, redirectIfAuthenticated } from '../middlewares/jwtAuth.js';

const router = Router();

// GET - Vista de login
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', {
        title: 'Login',
        error: req.query.error || null
    });
});

// GET - Vista de registro
router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register', {
        title: 'Registro',
        error: req.query.error || null
    });
});

// POST - Procesar login
router.post('/login', redirectIfAuthenticated, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.redirect('/users/login?error=Email+y+contraseña+son+requeridos');
        }
        
        // Buscar usuario
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.redirect('/users/login?error=Login+failed!');
        }
        
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.redirect('/users/login?error=Login+failed!');
        }
        
        // Generar JWT
        const token = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Almacenar JWT en cookie firmada
        res.cookie('currentUser', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            signed: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        
        // Redirigir a /current si login es exitoso
        res.redirect('/users/current');
    } catch (error) {
        res.redirect('/users/login?error=Login+failed!');
    }
});

// GET - Vista current (con autenticación)
router.get('/current', authenticateJWT, async (req, res) => {
    try {
        // Obtener datos completos del usuario
        const user = await userModel.findById(req.user.id).select('-password').lean();
        
        if (!user) {
            res.clearCookie('currentUser');
            return res.redirect('/users/login');
        }
        
        res.render('current', {
            title: 'Usuario Actual',
            user: user
        });
    } catch (error) {
        res.clearCookie('currentUser');
        res.redirect('/users/login');
    }
});

// POST - Procesar registro
router.post('/register', redirectIfAuthenticated, async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
       
        if (!first_name || !first_name.trim()) {
            return res.redirect('/users/register?error=El+nombre+es+requerido');
        }
        if (!last_name || !last_name.trim()) {
            return res.redirect('/users/register?error=El+apellido+es+requerido');
        }
        if (!email || !email.trim()) {
            return res.redirect('/users/register?error=El+email+es+requerido');
        }
        if (!age || isNaN(age) || age <= 0) {
            return res.redirect('/users/register?error=La+edad+debe+ser+un+número+válido');
        }
        if (!password || !password.trim()) {
            return res.redirect('/users/register?error=La+contraseña+es+requerida');
        }
        
        // Verificar si el usuario ya existe
        const existingUser = await userModel.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.redirect('/users/register?error=El+email+ya+está+registrado');
        }
        
        // Encriptar contraseña con bcrypt hashSync (según consigna)
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        const newUser = await userModel.create({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim().toLowerCase(),
            age: parseInt(age),
            password: hashedPassword,
            role: 'user'
        });
        
        // Generar JWT para el nuevo usuario
        const token = jwt.sign(
            {
                id: newUser._id.toString(),
                email: newUser.email,
                role: newUser.role,
                first_name: newUser.first_name,
                last_name: newUser.last_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Almacenar JWT en cookie firmada
        res.cookie('currentUser', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            signed: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        
        // Redirigir a /current si registro es exitoso
        res.redirect('/users/current');
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.redirect('/users/register?error=Error+al+registrar+usuario');
    }
});

// GET - Logout
router.get('/logout', (req, res) => {
    res.clearCookie('currentUser');
    res.redirect('/users/login');
});

export default router;

