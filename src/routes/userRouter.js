import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import { authenticateJWT, requireAdmin } from '../middlewares/authorization.js';

const router = Router();

// Rutas públicas
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.requestPasswordReset);
router.post('/reset-password/:token', UserController.resetPassword);

// Rutas autenticadas
router.get('/current', authenticateJWT, UserController.getCurrentUser);
router.post('/logout', authenticateJWT, UserController.logout);

// Rutas admin
router.get('/', authenticateJWT, requireAdmin, UserController.getAllUsers);
router.get('/:id', authenticateJWT, requireAdmin, UserController.getUserById);
router.put('/:id', authenticateJWT, requireAdmin, UserController.updateUser);
router.delete('/:id', authenticateJWT, requireAdmin, UserController.deleteUser);

export default router;

