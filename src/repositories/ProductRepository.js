import ProductDAO from '../daos/mongo/ProductDAO.js';
import ProductDTO from '../dtos/ProductDTO.js';

class ProductRepository {
  async getAll() {
    const products = await ProductDAO.findAll();
    return products.map(product => new ProductDTO(product).toFull());
  }

  async getPaginated(options) {
    const result = await ProductDAO.findPaginated(options);
    
    return {
      products: result.docs.map(product => new ProductDTO(product).toFull()),
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage
    };
  }

  async getById(id) {
    const product = await ProductDAO.findById(id);
    if (!product) {
      return null;
    }
    return new ProductDTO(product).toFull();
  }

  async create(productData) {
    const product = await ProductDAO.create(productData);
    return new ProductDTO(product).toFull();
  }

  async update(id, updates) {
    const product = await ProductDAO.update(id, updates);
    if (!product) {
      return null;
    }
    return new ProductDTO(product).toFull();
  }

  async delete(id) {
    const product = await ProductDAO.delete(id);
    return product !== null;
  }

  async updateStock(id, quantity) {
    const product = await ProductDAO.updateStock(id, quantity);
    if (!product) {
      return null;
    }
    return new ProductDTO(product).toFull();
  }

  async checkStock(id, quantity) {
    const product = await ProductDAO.findById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product.stock >= quantity;
  }
}

export default new ProductRepository();
