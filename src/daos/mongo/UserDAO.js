import userModel from "../../models/userModel.js";

class UserDAO {
  async findAll() {
    try {
      return await userModel.find({}).lean();
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await userModel.findById(id).lean();
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      return await userModel.findOne({ email: email.toLowerCase() }).lean();
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  async create(userData) {
    try {
      const user = new userModel(userData);
      return await user.save();
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  async update(id, updates) {
    try {
      return await userModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await userModel.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  async updatePassword(id, hashedPassword) {
    try {
      return await userModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }

  async saveResetToken(id, token, expiry) {
    try {
      return await userModel.findByIdAndUpdate(
        id,
        { 
          resetPasswordToken: token,
          resetPasswordExpires: expiry
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error al guardar token de reset: ${error.message}`);
    }
  }

  async findByResetToken(token) {
    try {
      return await userModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      }).lean();
    } catch (error) {
      throw new Error(`Error al buscar usuario por token: ${error.message}`);
    }
  }

  async clearResetToken(id) {
    try {
      return await userModel.findByIdAndUpdate(
        id,
        { 
          $unset: { 
            resetPasswordToken: 1,
            resetPasswordExpires: 1
          }
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error al limpiar token: ${error.message}`);
    }
  }
}

export default new UserDAO();
