// api-gateway/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const authenticateToken = require('./middleware/authenticateToken');

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"], 
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const SERVICE_URLS = {
  auth: process.env.AUTH_SERVICE_URL,
  orders: process.env.ORDERS_SERVICE_URL,
  inventory: process.env.INVENTORY_SERVICE_URL,
  // geo: process.env.GEO_SERVICE_URL,
  // reports: process.env.REPORTS_SERVICE_URL,
};

if (!SERVICE_URLS.auth) {
    console.error("FATAL ERROR: AUTH_SERVICE_URL no está definida en el archivo .env");
    process.exit(1); 
}

// --- Configuración de Proxies para los Microservicios ---

const onProxyError = (err, req, res) => {
  console.error('Error en el Proxy:', err);
  res.status(500).json({ message: 'Error al conectar con el servicio.' });
};

const commonProxyOptions = (target) => ({
  target: target,
  changeOrigin: true, 
  secure: process.env.NODE_ENV === 'production', 
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info', 
  onError: onProxyError,
  onProxyReq: fixRequestBody, 
});

// --- Rutas Publicas del Microservicio de Autenticación ---
const publicAuthRoutes = [
    '/api/v1/auth/signup',
    '/api/v1/auth/signin',
    '/api/v1/auth/verify',
    '/api/v1/auth/resend',
    '/api/v1/auth/2fa',
    '/api/v1/auth/resendsms',
    '/api/v1/auth/verifyPassCode',
    '/api/v1/auth/resetPassword',
    '/api/v1/auth/ChangeResetPassword'
];

publicAuthRoutes.forEach(routePath => {
    app.all(routePath, createProxyMiddleware(commonProxyOptions(SERVICE_URLS.auth)));
});

// --- Rutas privadas que necesitan token o verificacion ---
const protectedAuthServicePrefixes = [
    '/api/v1/auth', 
    '/api/v1/users',
    '/api/v1/roles',
    '/api/v1/permissions',
    '/api/v1/upload'
];

protectedAuthServicePrefixes.forEach(prefix => {
    app.use(prefix, authenticateToken, createProxyMiddleware(commonProxyOptions(SERVICE_URLS.auth)));
});


// --- Rutas para Futuros Microservicios ---

if (SERVICE_URLS.orders) {
    app.use('/api/v1/orders', authenticateToken, createProxyMiddleware(commonProxyOptions(SERVICE_URLS.orders)));
}

if (SERVICE_URLS.inventory) {
    app.use('/api/v1/inventory', authenticateToken, createProxyMiddleware(commonProxyOptions(SERVICE_URLS.inventory)));
}

// if (SERVICE_URLS.geo) {
//   app.use('/api/v1/geo', authenticateToken, createProxyMiddleware(commonProxyOptions(SERVICE_URLS.geo)));
// }
// if (SERVICE_URLS.reports) {
//   app.use('/api/v1/reports', authenticateToken, createProxyMiddleware(commonProxyOptions(SERVICE_URLS.reports)));
// }

app.get("/", (req, res) => res.status(200).send("API Gateway está activo y funcionando!"));

app.use((req, res, next) => {
    res.status(404).json({ message: `Ruta no encontrada en API Gateway: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
    console.error("Error global en API Gateway:", err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor en API Gateway'
    });
});

const PORT = process.env.GATEWAY_PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway corriendo en el puerto ${PORT}`);
    console.log(`➡️  Redirigiendo a Auth Service: ${SERVICE_URLS.auth}`);
    if (SERVICE_URLS.orders) console.log(`➡️  Redirigiendo a Orders Service: ${SERVICE_URLS.orders}`);
    if (SERVICE_URLS.inventory) console.log(`➡️  Redirigiendo a Inventory Service: ${SERVICE_URLS.inventory}`);
});
