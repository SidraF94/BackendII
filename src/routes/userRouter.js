import { Router } from 'express';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import { authenticateJWTAPI } from '../middlewares/jwtAuth.js';

const router = Router();

// GET - Obtener todos los usuarios
router.get('/', authenticateJWTAPI, async (req, res) => {
    try {
        const users = await userModel.find().select('-password').lean();
        res.json({
            status: 'success',
            payload: users
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// GET - Obtener un usuario por ID
router.get('/:uid', authenticateJWTAPI, async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await userModel.findById(uid).select('-password').lean();
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            status: 'success',
            payload: user
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// POST - Crear un usuario (con password hasheado)
router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, age, role, password } = req.body;
        
        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos requeridos: first_name, last_name, email, age, password'
            });
        }
        
        // Hash de la contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        const newUser = await userModel.create({
            first_name,
            last_name,
            email,
            age: parseInt(age),
            role: role || 'user',
            password: hashedPassword
        });
        
        // No devolver la contraseña
        const userResponse = newUser.toObject();
        delete userResponse.password;
        
        res.status(201).json({
            status: 'success',
            payload: userResponse
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'El email ya está registrado'
            });
        }
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// PUT - Actualizar un usuario
router.put('/:uid', authenticateJWTAPI, async (req, res) => {
    try {
        const { uid } = req.params;
        const { first_name, last_name, email, role, password } = req.body;
        
        const updateData = { first_name, last_name, email, role };
        
        if (password) {
            updateData.password = bcrypt.hashSync(password, 10);
        }
        
        const updatedUser = await userModel.findByIdAndUpdate(
            uid, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password').lean();
        
        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            status: 'success',
            payload: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// DELETE - Eliminar un usuario
router.delete('/:uid', authenticateJWTAPI, async (req, res) => {
    try {
        const { uid } = req.params;
        const result = await userModel.findByIdAndDelete(uid);
        
        if (!result) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

export default router;
