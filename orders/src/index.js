const express = require('express');
const routes = require('./routes/routes');
const cors = require('cors');
const app = express();
const PORT = 3002;

// Middleware para CORS (debe ir antes de las rutas)
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas
app.use('/api/v1', routes);

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Hola desde el microservicio de órdenes!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
