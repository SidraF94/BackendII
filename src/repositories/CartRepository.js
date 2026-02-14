import CartDAO from '../daos/mongo/CartDAO.js';
import CartDTO from '../dtos/CartDTO.js';

class CartRepository {
  async getAll() {
    const carts = await CartDAO.findAll();
    return carts.map(cart => new CartDTO(cart).toFull());
  }

  async getById(id) {
    const cart = await CartDAO.findById(id);
    if (!cart) {
      return null;
    }
    return new CartDTO(cart).toFull();
  }

  async create() {
    const cart = await CartDAO.create();
    return new CartDTO(cart).toFull();
  }

  async addProduct(cartId, productId, quantity) {
    const cart = await CartDAO.addProduct(cartId, productId, quantity);
    const populatedCart = await CartDAO.findById(cart._id);
    return new CartDTO(populatedCart).toFull();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await CartDAO.updateProductQuantity(cartId, productId, quantity);
    if (!cart) {
      return null;
    }
    return new CartDTO(cart).toFull();
  }

  async removeProduct(cartId, productId) {
    const cart = await CartDAO.removeProduct(cartId, productId);
    if (!cart) {
      return null;
    }
    return new CartDTO(cart).toFull();
  }

  async clear(cartId) {
    const cart = await CartDAO.clear(cartId);
    if (!cart) {
      return null;
    }
    return new CartDTO(cart).toFull();
  }

  async delete(cartId) {
    const cart = await CartDAO.delete(cartId);
    return cart !== null;
  }

  async getCartProducts(cartId) {
    const cart = await CartDAO.findById(cartId);
    if (!cart) {
      return [];
    }
    return cart.products;
  }
}

export default new CartRepository();

