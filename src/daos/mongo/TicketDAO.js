import Ticket from '../../models/Ticket.js';

class TicketDAO {
  async findAll() {
    try {
      return await Ticket.find({}).populate('products.product').lean();
    } catch (error) {
      throw new Error(`Error al obtener tickets: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Ticket.findById(id).populate('products.product').lean();
    } catch (error) {
      throw new Error(`Error al obtener ticket: ${error.message}`);
    }
  }

  async findByCode(code) {
    try {
      return await Ticket.findOne({ code }).populate('products.product').lean();
    } catch (error) {
      throw new Error(`Error al buscar ticket por código: ${error.message}`);
    }
  }

  async findByPurchaser(email) {
    try {
      return await Ticket.find({ purchaser: email }).populate('products.product').lean();
    } catch (error) {
      throw new Error(`Error al buscar tickets por comprador: ${error.message}`);
    }
  }

  async create(ticketData) {
    try {
      const ticket = new Ticket(ticketData);
      return await ticket.save();
    } catch (error) {
      throw new Error(`Error al crear ticket: ${error.message}`);
    }
  }

  async update(id, updates) {
    try {
      return await Ticket.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('products.product');
    } catch (error) {
      throw new Error(`Error al actualizar ticket: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await Ticket.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar ticket: ${error.message}`);
    }
  }
}

export default new TicketDAO();
