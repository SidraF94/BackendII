import { Router } from 'express';
import CartController from '../controllers/CartController.js';
import PurchaseController from '../controllers/PurchaseController.js';
import { authenticateJWT, requireUser } from '../middlewares/authorization.js';

const router = Router();

// Crear carrito (público)
router.post('/', CartController.createCart);

// Ver carrito (público)
router.get('/:id', CartController.getCartById);

// Agregar producto al carrito - Solo usuarios autenticados (NO admin)
router.post('/:cid/product/:pid', authenticateJWT, requireUser, CartController.addProductToCart);

// Actualizar cantidad de producto
router.put('/:cid/products/:pid', authenticateJWT, CartController.updateProductQuantity);

// Eliminar producto del carrito
router.delete('/:cid/products/:pid', authenticateJWT, CartController.removeProductFromCart);

// Vaciar carrito (mantener estructura)
router.delete('/:cid', authenticateJWT, CartController.clearCart);

// FINALIZAR COMPRA - Solo usuarios autenticados
router.post('/:cid/purchase', authenticateJWT, requireUser, PurchaseController.purchaseCart);

export default router;
