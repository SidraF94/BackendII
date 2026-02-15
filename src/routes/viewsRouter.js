import { Router } from 'express';
import { authenticateJWT, redirectIfAuthenticated, requireAdminView } from '../middlewares/authorization.js';
import ProductService from '../services/ProductService.js';
import CartService from '../services/CartService.js';
import UserService from '../services/UserService.js';
import PurchaseService from '../services/PurchaseService.js';

const router = Router();

// Rutas de productos y carritos
router.get("/", async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    res.render("home", { products });
  } catch (err) {
    res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
  }
});

// Ruta protegida - Solo admin puede gestionar productos en tiempo real
router.get("/realtimeproducts", authenticateJWT, requireAdminView, async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    res.render("realTimeProducts", { products });
  } catch (err) {
    res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
  }
});

router.get("/products", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;

    const result = await ProductService.getPaginatedProducts({ limit, page, sort, query });

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const queryParams = new URLSearchParams();
    
    if (limit !== 10) queryParams.append('limit', limit);
    if (query) queryParams.append('query', query);
    if (sort) queryParams.append('sort', sort);
    
    const prevLink = result.hasPrevPage 
      ? `${baseUrl}?${queryParams.toString()}&page=${result.prevPage}`
      : null;
    
    const nextLink = result.hasNextPage
      ? `${baseUrl}?${queryParams.toString()}&page=${result.nextPage}`
      : null;

    res.render("products", {
      products: result.products,
      pagination: {
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: prevLink,
        nextLink: nextLink,
        limit: limit,
        query: query || '',
        sort: sort || ''
      }
    });
  } catch (err) {
    res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
  }
});

router.get("/products/:pid", async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).send("<h1>Error 404</h1><p>Producto no encontrado</p>");
    }
    res.render("productDetail", { product });
  } catch (err) {
    res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await CartService.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).send("<h1>Error 404</h1><p>Carrito no encontrado</p>");
    }
    
    const total = (cart.products || []).reduce(
      (sum, item) => sum + (item.itemTotal || 0),
      0
    );
    
    res.render("cart", { 
      cart: {
        ...cart,
        total
      }
    });
  } catch (err) {
    res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
  }
});

// Rutas de usuarios
// GET - Vista de login
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', {
        title: 'Login',
        error: req.query.error || null,
        success: req.query.success || null
    });
});

// GET - Vista de registro
router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register', {
        title: 'Registro',
        error: req.query.error || null
    });
});

// POST - Procesar login
router.post('/login', redirectIfAuthenticated, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.redirect('/users/login?error=Email+y+contraseña+son+requeridos');
        }
        
        // Usar UserService para login
        const result = await UserService.login(email, password);
        
        // Guardar token en cookie
        res.cookie('currentUser', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            signed: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });
        
        // Redirigir a /current si login es exitoso
        res.redirect('/users/current');
    } catch (error) {
        console.error('Error en login:', error);
        return res.redirect('/users/login?error=Login+failed!');
    }
});

// GET - Vista current (con autenticación)
router.get('/current', authenticateJWT, async (req, res) => {
    try {
        // req.user ya viene del middleware authenticateJWT con el usuario completo (DTO)
        res.render('current', {
            title: 'Usuario Actual',
            user: req.user
        });
    } catch (error) {
        console.error('Error en current:', error);
        res.clearCookie('currentUser');
        res.redirect('/users/login');
    }
});

// POST - Procesar registro
router.post('/register', redirectIfAuthenticated, async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
       
        if (!first_name || !first_name.trim()) {
            return res.redirect('/users/register?error=El+nombre+es+requerido');
        }
        if (!last_name || !last_name.trim()) {
            return res.redirect('/users/register?error=El+apellido+es+requerido');
        }
        if (!email || !email.trim()) {
            return res.redirect('/users/register?error=El+email+es+requerido');
        }
        if (!age || isNaN(age) || age <= 0) {
            return res.redirect('/users/register?error=La+edad+debe+ser+un+número+válido');
        }
        if (!password || !password.trim()) {
            return res.redirect('/users/register?error=La+contraseña+es+requerida');
        }
        
        // Usar UserService para registrar
        const result = await UserService.register({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim().toLowerCase(),
            age: parseInt(age),
            password: password
        });
        
        // Guardar token en cookie
        res.cookie('currentUser', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            signed: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });
        
        // Redirigir a /current si registro es exitoso
        res.redirect('/users/current');
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        if (error.message.includes('ya existe') || error.message.includes('duplicado')) {
            return res.redirect('/users/register?error=El+email+ya+está+registrado');
        }
        res.redirect('/users/register?error=Error+al+registrar+usuario');
    }
});

// GET - Logout
router.get('/logout', (req, res) => {
    res.clearCookie('currentUser');
    res.redirect('/users/login');
});

// Rutas de recuperación de contraseña
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {
        title: 'Recuperar Contraseña',
        error: req.query.error || null,
        success: req.query.success || null
    });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.redirect('/users/forgot-password?error=El+email+es+requerido');
        }
        
        await UserService.requestPasswordReset(email);
        res.redirect('/users/forgot-password?success=Si+el+email+existe,+recibirás+instrucciones');
    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.redirect('/users/forgot-password?error=Error+al+procesar+solicitud');
    }
});

router.get('/reset-password/:token', (req, res) => {
    res.render('reset-password', {
        title: 'Restablecer Contraseña',
        token: req.params.token,
        error: req.query.error || null
    });
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const { token } = req.params;
        
        if (!password || !confirmPassword) {
            return res.redirect(`/users/reset-password/${token}?error=Todos+los+campos+son+requeridos`);
        }
        
        if (password !== confirmPassword) {
            return res.redirect(`/users/reset-password/${token}?error=Las+contraseñas+no+coinciden`);
        }
        
        await UserService.resetPassword(token, password);
        res.redirect('/users/login?success=Contraseña+restablecida+exitosamente');
    } catch (error) {
        console.error('Error en reset-password:', error);
        res.redirect(`/users/reset-password/${req.params.token}?error=${encodeURIComponent(error.message)}`);
    }
});

// Rutas de tickets
router.get('/my-tickets', authenticateJWT, async (req, res) => {
    try {
        const tickets = await PurchaseService.getUserTickets(req.user.email);
        res.render('my-tickets', {
            title: 'Mis Compras',
            tickets
        });
    } catch (error) {
        console.error('Error al obtener tickets:', error);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    }
});

router.get('/tickets/:id', authenticateJWT, async (req, res) => {
    try {
        const ticket = await PurchaseService.getTicketById(req.params.id);
        
        // Verificar que el ticket pertenezca al usuario o sea admin
        if (req.user.role !== 'admin' && ticket.purchaser !== req.user.email) {
            return res.status(403).send('<h1>Acceso Denegado</h1><p>No tienes permisos para ver este ticket</p>');
        }
        
        res.render('ticket-detail', {
            title: 'Detalle del Ticket',
            ticket
        });
    } catch (error) {
        console.error('Error al obtener ticket:', error);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    }
});

export default router;

