import { Router } from 'express';
import PurchaseController from '../controllers/PurchaseController.js';
import { authenticateJWT, requireAdmin } from '../middlewares/authorization.js';

const router = Router();

// Ver tickets propios (usuario autenticado)
router.get('/my-tickets', authenticateJWT, PurchaseController.getUserTickets);

// Ver todos los tickets (solo admin)
router.get('/', authenticateJWT, requireAdmin, PurchaseController.getAllTickets);

// Ver ticket por ID
router.get('/:id', authenticateJWT, PurchaseController.getTicketById);

// Ver ticket por código
router.get('/code/:code', authenticateJWT, PurchaseController.getTicketByCode);

export default router;
