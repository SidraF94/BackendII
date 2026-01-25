import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';

// Asegurar que las variables de entorno estén cargadas
dotenv.config();

// Serialización y deserialización de usuario (para GitHub OAuth)
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

// Función helper para verificar si GitHub está configurado
export const isGitHubConfigured = () => {
    return process.env.GITHUB_CLIENT_ID && 
           process.env.GITHUB_CLIENT_SECRET &&
           process.env.GITHUB_CLIENT_ID !== 'tu_client_id_aqui' &&
           process.env.GITHUB_CLIENT_SECRET !== 'tu_client_secret_aqui';
};

// Estrategia GitHub OAuth
if (isGitHubConfigured()) {
    passport.use('github', new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/auth/github/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Obtener email del perfil
                const email = profile.emails?.[0]?.value || profile._json?.email || `${profile.username}@github.local`;
                
                // Buscar usuario por email de GitHub
                let user = await userModel.findOne({ email });

                if (!user) {
                    // Crear nuevo usuario desde GitHub
                    const displayName = profile.displayName || profile.username || 'Usuario GitHub';
                    const nameParts = displayName.split(' ');
                    const firstName = nameParts[0] || 'Usuario';
                    const lastName = nameParts.slice(1).join(' ') || 'GitHub';
                    
                    user = await userModel.create({
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        age: 0, // Valor por defecto para usuarios OAuth
                        password: '', // No se usa contraseña con OAuth
                        role: 'user'
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    ));
    console.log('Estrategia GitHub OAuth configurada');
} else {
    console.log('GitHub OAuth no configurado.');
}

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

