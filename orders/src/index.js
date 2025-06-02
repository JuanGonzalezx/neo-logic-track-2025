const express = require('express');
const routes = require('./routes/routes');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');
const app = express();
const PORT = 3002;

// Middleware para CORS (debe ir antes de las rutas)
app.use(cors({
    // origin: "https://frontend-4cpi.onrender.com",
    origin: "*",
}));

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas
app.use('/api/v1', routes);

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Hola desde el microservicio de órdenes!');
});

// Ruta para la documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
