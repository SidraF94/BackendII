import ProductRepository from '../repositories/ProductRepository.js';

class ProductService {
  async getAllProducts() {
    return await ProductRepository.getAll();
  }

  async getPaginatedProducts(options) {
    return await ProductRepository.getPaginated(options);
  }

  async getProductById(id) {
    const product = await ProductRepository.getById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  async createProduct(productData, userRole) {
    // Solo admin puede crear productos
    if (userRole !== 'admin') {
      throw new Error('No tienes permisos para crear productos');
    }
    return await ProductRepository.create(productData);
  }

  async updateProduct(id, updates, userRole) {
    // Solo admin puede actualizar productos
    if (userRole !== 'admin') {
      throw new Error('No tienes permisos para actualizar productos');
    }
    
    const product = await ProductRepository.update(id, updates);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  async deleteProduct(id, userRole) {
    // Solo admin puede eliminar productos
    if (userRole !== 'admin') {
      throw new Error('No tienes permisos para eliminar productos');
    }
    
    const deleted = await ProductRepository.delete(id);
    if (!deleted) {
      throw new Error('Producto no encontrado');
    }
    return { success: true, message: 'Producto eliminado correctamente' };
  }

  async checkProductStock(id, quantity) {
    return await ProductRepository.checkStock(id, quantity);
  }

  async updateProductStock(id, quantity) {
    return await ProductRepository.updateStock(id, quantity);
  }
}

export default new ProductService();
