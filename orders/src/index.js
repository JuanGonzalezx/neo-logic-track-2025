const express = require('express');
const app = express();
const PORT = 3002;

// Middleware (opcional)
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Hola desde Express!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});