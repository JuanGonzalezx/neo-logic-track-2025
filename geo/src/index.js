const { testConnection, prisma } = require('./config/database');
const express = require('express');
const routes = require('./routes/routes');
const cors = require('cors');
const bodyParser = require('body-parser');

const http = require('http');
const { Server } = require('socket.io');
const specs = require('./swagger');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3003;

app.use(bodyParser.json());

// 1. Crear server http
const server = http.createServer(app);

// 2. Inicializar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Cambia según tu frontend
  },
  path: "/geo/socket.io",
  transports: ["websocket"],
});

// 3. Middleware para inyectar io en req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 4. Rutas
app.use('/api/v1', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Microservicio de Inventario activo' });
});

// Middleware de error global
app.use((err, req, res, next) => {
  if (typeof handleServiceError === 'function' && err.customError) {
    return handleServiceError(err, res, next);
  }
  console.error(`[${new Date().toISOString()}] ERROR en Microservicio Inventario: ${err.message}`);
  console.error(err.stack);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Error interno en el Microservicio de Inventario.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
testConnection();

// 5. Configuración de eventos socket (si necesitas subscripción en el futuro)
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Si quieres que los clientes se suscriban a repartidores específicos:
  socket.on("subscribe", ({ deliveryPersonId }) => {
    if (deliveryPersonId) {
      socket.join(deliveryPersonId);
      console.log(`Socket ${socket.id} suscrito a ${deliveryPersonId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// 6. Cambiar app.listen por server.listen
server.listen(port, () => {
  console.log(`Project Running ${port}`);
});
