import CartRepository from '../repositories/CartRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import TicketRepository from '../repositories/TicketRepository.js';
import mailService from '../utils/mailService.js';

class PurchaseService {
  /* Procesa compra del carrito. Verifica stock, actualiza inventario, genera ticket. Maneja compras completas e incompletas.*/
  async purchaseCart(cartId, purchaserEmail) {
    const cart = await CartRepository.getById(cartId);
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    if (!cart.products || cart.products.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const productsToProcess = await this.validateCartProducts(cart.products);

    // Separar productos con stock suficiente e insuficiente
    const { purchasableProducts, unavailableProducts } = await this.checkStockAvailability(productsToProcess);

    if (purchasableProducts.length === 0) {
      return {
        success: false,
        message: 'Ningún producto tiene stock disponible',
        unavailableProducts: unavailableProducts.map(p => ({
          productId: p.productId,
          title: p.product.title,
          requestedQuantity: p.quantity,
          availableStock: p.product.stock
        }))
      };
    }

    // Procesar compra y actualizar stock
    const processedProducts = await this.processProductsPurchase(purchasableProducts);
    
    const totalAmount = processedProducts.reduce((sum, item) => sum + item.subtotal, 0);

    // Generar código único para el ticket
    const ticketCode = `TICKET-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

    // Crear ticket
    const ticketData = {
      code: ticketCode,
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: purchaserEmail,
      products: processedProducts,
      status: unavailableProducts.length > 0 ? 'pending' : 'completed'
    };

    const ticket = await TicketRepository.create(ticketData);

    await this.updateCartAfterPurchase(cartId, purchasableProducts, unavailableProducts);

    // Enviar email de confirmación
    try {
      await mailService.sendPurchaseConfirmation(purchaserEmail, ticket);
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
      // No lanzar error aca, la compra ya se proceso
    }

    const response = {
      success: true,
      ticket,
      message: unavailableProducts.length > 0 
        ? 'Compra procesada parcialmente' 
        : 'Compra procesada exitosamente',
      purchasedProducts: processedProducts.map(p => ({
        title: p.title,
        quantity: p.quantity,
        price: p.price,
        subtotal: p.subtotal
      }))
    };

    // Incluir productos no disponibles si los hay
    if (unavailableProducts.length > 0) {
      response.unavailableProducts = unavailableProducts.map(p => ({
        productId: p.productId,
        title: p.product.title,
        requestedQuantity: p.quantity,
        availableStock: p.product.stock
      }));
    }

    return response;
  }

 
  async validateCartProducts(cartProducts) {
    const validatedProducts = [];

    for (const item of cartProducts) {
      const product = await ProductRepository.getById(item.productId);
      
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }

      validatedProducts.push({
        productId: item.productId,
        product: product,
        quantity: item.quantity
      });
    }

    return validatedProducts;
  }

  async checkStockAvailability(products) {
    const purchasableProducts = [];
    const unavailableProducts = [];

    for (const item of products) {
      if (item.product.stock >= item.quantity && item.product.status) {
        purchasableProducts.push(item);
      } else {
        unavailableProducts.push(item);
      }
    }

    return { purchasableProducts, unavailableProducts };
  }

  async processProductsPurchase(purchasableProducts) {
    const processedProducts = [];

    for (const item of purchasableProducts) {
      await ProductRepository.updateStock(item.productId, -item.quantity);

      processedProducts.push({
        product: item.productId,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity
      });
    }

    return processedProducts;
  }


  async updateCartAfterPurchase(cartId, purchasedProducts, unavailableProducts) {
    if (unavailableProducts.length > 0) {
      // Eliminar solo los productos comprados
      for (const item of purchasedProducts) {
        await CartRepository.removeProduct(cartId, item.productId);
      }
    } else {
      // Si se compraron todos, vaciar el carrito
      await CartRepository.clear(cartId);
    }
  }

 
  async getUserTickets(email) {
    return await TicketRepository.getByPurchaser(email);
  }

  async getTicketById(ticketId) {
    const ticket = await TicketRepository.getById(ticketId);
    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }
    return ticket;
  }

  async getTicketByCode(code) {
    const ticket = await TicketRepository.getByCode(code);
    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }
    return ticket;
  }

  async getAllTickets(userRole) {
    if (userRole !== 'admin') {
      throw new Error('No tienes permisos para ver todos los tickets');
    }
    return await TicketRepository.getAll();
  }
}

export default new PurchaseService();
