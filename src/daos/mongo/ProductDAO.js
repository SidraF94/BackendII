import Product from "../../models/Product.js";

class ProductDAO {
  async findAll() {
    try {
      return await Product.find({}).lean();
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  async findPaginated({ limit = 10, page = 1, sort, query }) {
    try {
      let filter = {};
      
      if (query) {
        if (query.toLowerCase() === 'available' || query.toLowerCase() === 'disponible') {
          filter.status = true;
        } else {
          filter.category = { $regex: query, $options: 'i' };
        }
      }

      let sortOption = {};
      if (sort === 'asc') {
        sortOption.price = 1;
      } else if (sort === 'desc') {
        sortOption.price = -1;
      }

      const options = {
        page: page,
        limit: limit,
        sort: sortOption,
        lean: true
      };

      return await Product.paginate(filter, options);
    } catch (error) {
      throw new Error(`Error al obtener productos paginados: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Product.findById(id).lean();
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  async findByCode(code) {
    try {
      return await Product.findOne({ code }).lean();
    } catch (error) {
      throw new Error(`Error al buscar producto por código: ${error.message}`);
    }
  }

  async create(productData) {
    try {
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(`El código ${productData.code} ya existe`);
      }
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  async update(id, updates) {
    try {
      return await Product.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await Product.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  async updateStock(id, quantity) {
    try {
      return await Product.findByIdAndUpdate(
        id,
        { $inc: { stock: quantity } },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error al actualizar stock: ${error.message}`);
    }
  }
}

export default new ProductDAO();
