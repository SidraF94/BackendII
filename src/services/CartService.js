import CartRepository from '../repositories/CartRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';

class CartService {
  async getAllCarts() {
    return await CartRepository.getAll();
  }

  async getCartById(id) {
    const cart = await CartRepository.getById(id);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }
    return cart;
  }

  async createCart() {
    return await CartRepository.create();
  }

  async addProductToCart(cartId, productId, quantity, userRole) {
    if (userRole !== 'user') {
      throw new Error('Solo los usuarios pueden agregar productos al carrito');
    }

    // Verificar que el producto existe y tiene stock
    const product = await ProductRepository.getById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    if (!product.status) {
      throw new Error('Producto no disponible');
    }

    if (product.stock < quantity) {
      throw new Error(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
    }

    return await CartRepository.addProduct(cartId, productId, quantity);
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const hasStock = await ProductRepository.checkStock(productId, quantity);
    if (!hasStock) {
      throw new Error('Stock insuficiente');
    }

    const cart = await CartRepository.updateProductQuantity(cartId, productId, quantity);
    if (!cart) {
      throw new Error('Carrito o producto no encontrado');
    }
    return cart;
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await CartRepository.removeProduct(cartId, productId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }
    return cart;
  }

  async clearCart(cartId) {
    const cart = await CartRepository.clear(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }
    return cart;
  }

  async deleteCart(cartId) {
    const deleted = await CartRepository.delete(cartId);
    if (!deleted) {
      throw new Error('Carrito no encontrado');
    }
    return { success: true, message: 'Carrito eliminado correctamente' };
  }
}

export default new CartService();
