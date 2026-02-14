import CartService from '../services/CartService.js';
import { catchAsync } from '../utils/errorHandler.js';

class CartController {
  // GET /api/carts
  getAllCarts = catchAsync(async (req, res) => {
    const carts = await CartService.getAllCarts();
    res.json({
      status: 'success',
      data: carts
    });
  });

  // GET /api/carts/:id
  getCartById = catchAsync(async (req, res) => {
    const cart = await CartService.getCartById(req.params.id);
    res.json({
      status: 'success',
      data: cart
    });
  });

  // POST /api/carts
  createCart = catchAsync(async (req, res) => {
    const cart = await CartService.createCart();
    res.status(201).json({
      status: 'success',
      data: cart
    });
  });

  // POST /api/carts/:cid/product/:pid (Solo User)
  addProductToCart = catchAsync(async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    const cart = await CartService.addProductToCart(cid, pid, quantity, req.user.role);
    
    res.json({
      status: 'success',
      data: cart
    });
  });

  // PUT /api/carts/:cid/products/:pid
  updateProductQuantity = catchAsync(async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        error: 'La cantidad debe ser mayor a 0'
      });
    }

    const cart = await CartService.updateProductQuantity(cid, pid, quantity);
    
    res.json({
      status: 'success',
      data: cart
    });
  });

  // DELETE /api/carts/:cid/products/:pid
  removeProductFromCart = catchAsync(async (req, res) => {
    const { cid, pid } = req.params;
    const cart = await CartService.removeProductFromCart(cid, pid);
    
    res.json({
      status: 'success',
      data: cart
    });
  });

  // DELETE /api/carts/:id
  clearCart = catchAsync(async (req, res) => {
    const cart = await CartService.clearCart(req.params.id);
    
    res.json({
      status: 'success',
      data: cart
    });
  });

  // DELETE /api/carts/:id/delete
  deleteCart = catchAsync(async (req, res) => {
    const result = await CartService.deleteCart(req.params.id);
    
    res.json({
      status: 'success',
      message: result.message
    });
  });
}

export default new CartController();
