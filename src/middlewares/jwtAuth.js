import jwt from 'jsonwebtoken';

// Middleware para verificar JWT en vistas (redirige si no está autenticado)
export const authenticateJWT = (req, res, next) => {
    try {
        const token = req.signedCookies?.currentUser;
        
        if (!token) {
            return res.redirect('/users/login');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('currentUser');
        return res.redirect('/users/login');
    }
};

// Middleware para verificar JWT en APIs (retorna JSON si no está autenticado)
export const authenticateJWTAPI = (req, res, next) => {
    try {
        const token = req.signedCookies?.currentUser;
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Token no encontrado o inválido'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('currentUser');
        return res.status(401).json({
            status: 'error',
            message: 'Token inválido o expirado'
        });
    }
};

// Middleware para redirigir si ya está autenticado
export const redirectIfAuthenticated = (req, res, next) => {
    try {
        const token = req.signedCookies?.currentUser;
        
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET);
            // Usuario ya está autenticado, redirigir a current
            return res.redirect('/users/current');
        }
        
        next();
    } catch (error) {
        // Token inválido, continuar
        next();
    }
};


