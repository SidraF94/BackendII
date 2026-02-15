import { Router } from 'express';
import ProductController from '../controllers/ProductController.js';
import { authenticateJWT, requireAdmin } from '../middlewares/authorization.js';
import upload from '../middlewares/upload.js';

const router = Router();

// Rutas públicas
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

// Rutas protegidas - Solo admin puede crear, actualizar y eliminar productos
router.post('/', authenticateJWT, requireAdmin, upload.array('thumbnails', 5), ProductController.createProduct);
router.put('/:id', authenticateJWT, requireAdmin, ProductController.updateProduct);
router.delete('/:id', authenticateJWT, requireAdmin, ProductController.deleteProduct);

export default router;
