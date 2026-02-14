import UserService from '../services/UserService.js';
import { catchAsync } from '../utils/errorHandler.js';

class UserController {
  // POST /api/users/register
  register = catchAsync(async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({
        status: 'error',
        error: 'Todos los campos son requeridos'
      });
    }

    const result = await UserService.register({ first_name, last_name, email, age, password });

    res.status(201).json({
      status: 'success',
      data: result.user,
      token: result.token
    });
  });

  // POST /api/users/login
  login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        error: 'Email y contraseña son requeridos'
      });
    }

    const result = await UserService.login(email, password);

    // Guardar token en cookie
    res.cookie('currentUser', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      signed: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({
      status: 'success',
      data: result.user,
      token: result.token
    });
  });

  // GET /api/users/current
  getCurrentUser = catchAsync(async (req, res) => {
    // req.user ya viene del middleware authenticateJWT
    res.json({
      status: 'success',
      data: req.user // Ya es un DTO sin datos sensibles
    });
  });

  // POST /api/users/forgot-password
  requestPasswordReset = catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        error: 'Email es requerido'
      });
    }

    const result = await UserService.requestPasswordReset(email);

    res.json({
      status: 'success',
      message: result.message
    });
  });

  // POST /api/users/reset-password/:token
  resetPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        status: 'error',
        error: 'Nueva contraseña es requerida'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const result = await UserService.resetPassword(token, newPassword);

    res.json({
      status: 'success',
      message: result.message
    });
  });

  // POST /api/users/logout
  logout = catchAsync(async (req, res) => {
    res.clearCookie('currentUser');
    res.json({
      status: 'success',
      message: 'Sesión cerrada correctamente'
    });
  });

  // GET /api/users
  getAllUsers = catchAsync(async (req, res) => {
    const users = await UserService.getAllUsers();
    res.json({
      status: 'success',
      data: users
    });
  });

  // GET /api/users/:id
  getUserById = catchAsync(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    res.json({
      status: 'success',
      data: user
    });
  });

  // PUT /api/users/:id
  updateUser = catchAsync(async (req, res) => {
    const user = await UserService.updateUser(req.params.id, req.body);
    res.json({
      status: 'success',
      data: user
    });
  });

  // DELETE /api/users/:id
  deleteUser = catchAsync(async (req, res) => {
    const result = await UserService.deleteUser(req.params.id);
    res.json({
      status: 'success',
      message: result.message
    });
  });
}

export default new UserController();
