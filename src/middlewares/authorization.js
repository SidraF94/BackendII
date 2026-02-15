import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';

/**
 * Middleware para verificar JWT y obtener usuario actual
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.signedCookies?.currentUser || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Token no proporcionado' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener usuario actualizado de la BD
    const user = await UserRepository.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Por favor inicia sesión nuevamente' 
      });
    }
    return res.status(403).json({ 
      error: 'Token inválido' 
    });
  }
};

/**
 * Middleware para redirigir si ya está autenticado
 */
export const redirectIfAuthenticated = (req, res, next) => {
  try {
    const token = req.signedCookies?.currentUser;
    
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/users/current');
    }
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Middleware para verificar que el usuario sea admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autenticado',
      message: 'Debes iniciar sesión' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Solo los administradores pueden realizar esta acción' 
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario sea user
 */
export const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autenticado',
      message: 'Debes iniciar sesión' 
    });
  }

  if (req.user.role !== 'user') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Solo los usuarios pueden realizar esta acción' 
    });
  }

  next();
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debes iniciar sesión' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea admin
 */
export const requireOwnerOrAdmin = (resourceOwnerField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debes iniciar sesión' 
      });
    }

    const resourceOwnerId = req.params[resourceOwnerField] || req.body[resourceOwnerField];
    
    if (req.user.role === 'admin' || req.user.id === resourceOwnerId) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'No tienes permisos para acceder a este recurso' 
    });
  };
};

/**
 * Middleware para verificar que el usuario sea admin (para vistas HTML)
 * Redirige a login o renderiza página de error
 */
export const requireAdminView = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/users/login');
  }

  if (req.user.role !== 'admin') {
    return res.status(403).render('error', {
      error: 'Acceso denegado',
      message: 'Solo los administradores pueden acceder a esta página'
    });
  }

  next();
};
