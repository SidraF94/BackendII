import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';

// Asegurar que las variables de entorno estén cargadas
dotenv.config();

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Estrategia "current" que usa JWT para validar usuario logueado
// Para el endpoint /api/sessions/current
passport.use('current', new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromExtractors([
            (req) => {
                // Extraer token de cookie firmada
                return req.signedCookies?.currentUser || null;
            }
        ]),
        secretOrKey: process.env.JWT_SECRET || 'mi-secreto-jwt'
    },
    async (payload, done) => {
        try {
            // Buscar usuario completo en la base de datos
            const user = await userModel.findById(payload.id).select('-password').lean();
            
            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

export default passport;

