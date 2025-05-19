const { testConnection, prisma } = require('./config/database');
const express = require('express');
const routes = require('./routes/routes');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');

const app = express();

app.use(cors()); // Configura según tus necesidades
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3001;

// app.use("/api", uploadRoutes);
app.use(bodyParser.json());
(async () => {
    // Conectar a la base de datos


})();

app.listen(port, () => {
    console.log(`Project Running ${port}`);

});
app.use('/api/v1', routes);
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Microservicio de Inventario activo' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware de error global para el microservicio (después de todas las rutas)
app.use((err, req, res, next) => {
    // Usar el errorHandler que creamos si es un error manejado por el servicio
    if (typeof handleServiceError === 'function' && err.customError) { // Podrías añadir una bandera a tus errores
        return handleServiceError(err, res, next);
    }
    // Error por defecto del microservicio
    console.error(`[${new Date().toISOString()}] ERROR en Microservicio Inventario: ${err.message}`);
    console.error(err.stack);

    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Error interno en el Microservicio de Inventario.',
        // Considera no enviar el stack en producción por seguridad
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
testConnection()