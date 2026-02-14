import Cart from "../../models/Cart.js";

class CartDAO {
  async findAll() {
    try {
      return await Cart.find({}).populate('products.productId').lean();
    } catch (error) {
      throw new Error(`Error al obtener carritos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Cart.findById(id).populate('products.productId').lean();
    } catch (error) {
      throw new Error(`Error al obtener carrito: ${error.message}`);
    }
  }

  async create() {
    try {
      const cart = new Cart({ products: [] });
      return await cart.save();
    } catch (error) {
      throw new Error(`Error al crear carrito: ${error.message}`);
    }
  }

  async addProduct(cartId, productId, quantity) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const productIndex = cart.products.findIndex(
        item => item.productId.toString() === productId.toString()
      );

      if (productIndex >= 0) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }

      return await cart.save();
    } catch (error) {
      throw new Error(`Error al agregar producto al carrito: ${error.message}`);
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      return await Cart.findOneAndUpdate(
        { _id: cartId, 'products.productId': productId },
        { $set: { 'products.$.quantity': quantity } },
        { new: true }
      ).populate('products.productId');
    } catch (error) {
      throw new Error(`Error al actualizar cantidad: ${error.message}`);
    }
  }

  async removeProduct(cartId, productId) {
    try {
      return await Cart.findByIdAndUpdate(
        cartId,
        { $pull: { products: { productId: productId } } },
        { new: true }
      ).populate('products.productId');
    } catch (error) {
      throw new Error(`Error al eliminar producto del carrito: ${error.message}`);
    }
  }

  async clear(cartId) {
    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { products: [] },
        { new: true }
      );
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }
      return cart;
    } catch (error) {
      throw new Error(`Error al vaciar carrito: ${error.message}`);
    }
  }

  async delete(cartId) {
    try {
      return await Cart.findByIdAndDelete(cartId);
    } catch (error) {
      throw new Error(`Error al eliminar carrito: ${error.message}`);
    }
  }
}

export default new CartDAO();
