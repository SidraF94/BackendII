import UserRepository from '../repositories/UserRepository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserDTO from '../dtos/UserDTO.js';
import crypto from 'crypto';
import mailService from '../utils/mailService.js';

class UserService {
  async getAllUsers() {
    return await UserRepository.getAll();
  }

  async getUserById(id) {
    const user = await UserRepository.getById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async register(userData) {
    // Verificar si el usuario ya existe
    const existingUser = await UserRepository.getByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Crear usuario
    const newUser = await UserRepository.create({
      ...userData,
      password: hashedPassword,
      lastPassword: hashedPassword,
      role: userData.role || 'user'
    });

    // Generar JWT
    const token = this.generateToken(newUser);

    return {
      user: newUser,
      token
    };
  }

  async login(email, password) {
    // Buscar usuario
    const user = await UserRepository.getByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar JWT
    const userDTO = new UserDTO(user);
    const token = this.generateToken(userDTO.toCurrent());

    return {
      user: userDTO.toCurrent(),
      token
    };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  async requestPasswordReset(email) {
    const user = await UserRepository.getByEmail(email);
    if (!user) {
      // No revelar si el usuario existe o no por seguridad
      return { success: true, message: 'Si el email existe, recibirás instrucciones' };
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Guardar token con expiración de 1 hora
    const expiry = Date.now() + 3600000; // 1 hora
    await UserRepository.saveResetToken(user._id, hashedToken, expiry);

    // Enviar email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/users/reset-password/${resetToken}`;
    try {
      await mailService.sendResetPasswordEmail(email, resetUrl, user.first_name);
    } catch (error) {
      console.error('Error al enviar email:', error);
      console.log('URL de recuperación (copia este enlace):', resetUrl);
      // No lanzar error, continuar el proceso
      // throw new Error('Error al enviar email de recuperación');
    }

    return { success: true, message: 'Email de recuperación enviado' };
  }

  async resetPassword(token, newPassword) {
    // Hashear token para comparar
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar usuario por token
    const user = await UserRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    // Verificar que no sea la misma contraseña anterior
    const isSamePassword = await bcrypt.compare(newPassword, user.lastPassword || user.password);
    if (isSamePassword) {
      throw new Error('No puedes usar la misma contraseña anterior');
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y guardar la anterior
    await UserRepository.updatePassword(user._id, hashedPassword);
    await UserRepository.update(user._id, { lastPassword: user.password });

    // Limpiar token
    await UserRepository.clearResetToken(user._id);

    return { success: true, message: 'Contraseña actualizada correctamente' };
  }

  async updateUser(id, updates) {
    const user = await UserRepository.update(id, updates);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async deleteUser(id) {
    const deleted = await UserRepository.delete(id);
    if (!deleted) {
      throw new Error('Usuario no encontrado');
    }
    return { success: true, message: 'Usuario eliminado correctamente' };
  }
}

export default new UserService();
