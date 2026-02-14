import UserDAO from '../daos/mongo/UserDAO.js';
import UserDTO from '../dtos/UserDTO.js';

class UserRepository {
  async getAll() {
    const users = await UserDAO.findAll();
    return users.map(user => new UserDTO(user).toPublic());
  }

  async getById(id) {
    const user = await UserDAO.findById(id);
    if (!user) {
      return null;
    }
    return new UserDTO(user).toCurrent();
  }

  async getByEmail(email) {
    const user = await UserDAO.findByEmail(email);
    if (!user) {
      return null;
    }
    return user; // Devuelve el usuario completo para validación de password
  }

  async create(userData) {
    const user = await UserDAO.create(userData);
    return new UserDTO(user).toCurrent();
  }

  async update(id, updates) {
    const user = await UserDAO.update(id, updates);
    if (!user) {
      return null;
    }
    return new UserDTO(user).toCurrent();
  }

  async delete(id) {
    const user = await UserDAO.delete(id);
    return user !== null;
  }

  async updatePassword(id, hashedPassword) {
    const user = await UserDAO.updatePassword(id, hashedPassword);
    if (!user) {
      return null;
    }
    return new UserDTO(user).toCurrent();
  }

  async saveResetToken(id, token, expiry) {
    const user = await UserDAO.saveResetToken(id, token, expiry);
    if (!user) {
      return null;
    }
    return new UserDTO(user).toCurrent();
  }

  async findByResetToken(token) {
    const user = await UserDAO.findByResetToken(token);
    if (!user) {
      return null;
    }
    return user; // Devuelve usuario completo para validar password anterior
  }

  async clearResetToken(id) {
    const user = await UserDAO.clearResetToken(id);
    if (!user) {
      return null;
    }
    return new UserDTO(user).toCurrent();
  }
}

export default new UserRepository();

