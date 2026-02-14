import TicketDAO from '../daos/mongo/TicketDAO.js';
import TicketDTO from '../dtos/TicketDTO.js';

class TicketRepository {
  async getAll() {
    const tickets = await TicketDAO.findAll();
    return tickets.map(ticket => new TicketDTO(ticket).toFull());
  }

  async getById(id) {
    const ticket = await TicketDAO.findById(id);
    if (!ticket) {
      return null;
    }
    return new TicketDTO(ticket).toFull();
  }

  async getByCode(code) {
    const ticket = await TicketDAO.findByCode(code);
    if (!ticket) {
      return null;
    }
    return new TicketDTO(ticket).toFull();
  }

  async getByPurchaser(email) {
    const tickets = await TicketDAO.findByPurchaser(email);
    return tickets.map(ticket => new TicketDTO(ticket).toFull());
  }

  async create(ticketData) {
    const ticket = await TicketDAO.create(ticketData);
    return new TicketDTO(ticket).toFull();
  }

  async update(id, updates) {
    const ticket = await TicketDAO.update(id, updates);
    if (!ticket) {
      return null;
    }
    return new TicketDTO(ticket).toFull();
  }

  async delete(id) {
    const ticket = await TicketDAO.delete(id);
    return ticket !== null;
  }
}

export default new TicketRepository();
