import { Router } from 'express';
import { authenticateJWTAPI } from '../middlewares/jwtAuth.js';
import userModel from '../models/userModel.js';

const router = Router();

// GET - Obtener usuario actual mediante JWT (API)
router.get('/current', authenticateJWTAPI, async (req, res) => {
    try {
        // Obtener usuario completo de la base de datos
        const user = await userModel.findById(req.user.id).select('-password').lean();
        
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

export default router;

