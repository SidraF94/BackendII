import PurchaseService from '../services/PurchaseService.js';
import { catchAsync } from '../utils/errorHandler.js';

class PurchaseController {
  // POST /api/carts/:cid/purchase
  purchaseCart = catchAsync(async (req, res) => {
    const { cid } = req.params;
    const purchaserEmail = req.user.email;

    const result = await PurchaseService.purchaseCart(cid, purchaserEmail);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.message,
        unavailableProducts: result.unavailableProducts
      });
    }

    res.status(201).json({
      status: 'success',
      message: result.message,
      ticket: result.ticket,
      purchasedProducts: result.purchasedProducts,
      ...(result.unavailableProducts && { unavailableProducts: result.unavailableProducts })
    });
  });

  // GET /api/tickets (Admin)
  getAllTickets = catchAsync(async (req, res) => {
    const tickets = await PurchaseService.getAllTickets(req.user.role);
    res.json({
      status: 'success',
      data: tickets
    });
  });

  // GET /api/tickets/my-tickets
  getUserTickets = catchAsync(async (req, res) => {
    const tickets = await PurchaseService.getUserTickets(req.user.email);
    res.json({
      status: 'success',
      data: tickets
    });
  });

  // GET /api/tickets/:id
  getTicketById = catchAsync(async (req, res) => {
    const ticket = await PurchaseService.getTicketById(req.params.id);
    
    // Verificar que el ticket pertenezca al usuario o sea admin
    if (req.user.role !== 'admin' && ticket.purchaser !== req.user.email) {
      return res.status(403).json({
        status: 'error',
        error: 'No tienes permisos para ver este ticket'
      });
    }

    res.json({
      status: 'success',
      data: ticket
    });
  });

  // GET /api/tickets/code/:code
  getTicketByCode = catchAsync(async (req, res) => {
    const ticket = await PurchaseService.getTicketByCode(req.params.code);
    
    // Verificar que el ticket pertenezca al usuario o sea admin
    if (req.user.role !== 'admin' && ticket.purchaser !== req.user.email) {
      return res.status(403).json({
        status: 'error',
        error: 'No tienes permisos para ver este ticket'
      });
    }

    res.json({
      status: 'success',
      data: ticket
    });
  });
}

export default new PurchaseController();
