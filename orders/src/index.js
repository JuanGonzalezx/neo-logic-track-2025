const express = require('express');
const routes = require('./routes/routes');
const app = express();
const PORT = 3002;

// Middleware (opcional)
app.use(express.json());

// Use the routes
app.use('/api/v1', routes);

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Hola desde el microservicio de órdenes!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});