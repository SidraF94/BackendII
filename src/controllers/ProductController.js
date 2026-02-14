import ProductService from '../services/ProductService.js';
import { catchAsync } from '../utils/errorHandler.js';

class ProductController {
  // GET /api/products
  getAllProducts = catchAsync(async (req, res) => {
    const products = await ProductService.getAllProducts();
    res.json({
      status: 'success',
      data: products
    });
  });

  // GET /api/products?page=1&limit=10&sort=asc&query=categoria
  getPaginatedProducts = catchAsync(async (req, res) => {
    const { limit, page, sort, query } = req.query;
    const options = {
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1,
      sort,
      query
    };

    const result = await ProductService.getPaginatedProducts(options);

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const queryParams = new URLSearchParams();
    
    if (options.limit !== 10) queryParams.append('limit', options.limit);
    if (query) queryParams.append('query', query);
    if (sort) queryParams.append('sort', sort);
    
    const prevLink = result.hasPrevPage 
      ? `${baseUrl}?${queryParams.toString()}&page=${result.prevPage}`
      : null;
    
    const nextLink = result.hasNextPage
      ? `${baseUrl}?${queryParams.toString()}&page=${result.nextPage}`
      : null;

    res.json({
      status: 'success',
      payload: result.products,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink
    });
  });

  // GET /api/products/:id
  getProductById = catchAsync(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);
    res.json({
      status: 'success',
      data: product
    });
  });

  // POST /api/products (Solo Admin)
  createProduct = catchAsync(async (req, res) => {
    const product = await ProductService.createProduct(req.body, req.user.role);
    
    // Emitir evento Socket.IO
    if (req.io) {
      req.io.emit('productAdded', product);
    }

    res.status(201).json({
      status: 'success',
      data: product
    });
  });

  // PUT /api/products/:id (Solo Admin)
  updateProduct = catchAsync(async (req, res) => {
    const product = await ProductService.updateProduct(req.params.id, req.body, req.user.role);
    
    // Emitir evento Socket.IO
    if (req.io) {
      req.io.emit('productUpdated', product);
    }

    res.json({
      status: 'success',
      data: product
    });
  });

  // DELETE /api/products/:id (Solo Admin)
  deleteProduct = catchAsync(async (req, res) => {
    const result = await ProductService.deleteProduct(req.params.id, req.user.role);
    
    // Emitir evento Socket.IO
    if (req.io) {
      req.io.emit('productDeleted', req.params.id);
    }

    res.json({
      status: 'success',
      message: result.message
    });
  });
}

export default new ProductController();
