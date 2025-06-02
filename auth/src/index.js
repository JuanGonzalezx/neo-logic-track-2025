const express = require('express');
require('dotenv').config();
const connectionDB = require("./config/database");
const bodyParser = require('body-parser');
const routes = require('./routes/routes'); 
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger.js");

const uploadRoutes = require("./routes/uploadRoutes");
const app = express();
const port = process.env.PORT || 3005;
app.use(cors({
    origin: "https://frontend-4cpi.onrender.com/",
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors())

//console.log(port);

// const printMessage = () => {
//     return Prueba ${port}
// }

// console.log(printMessage());

// const printMessage1 = function () {
//     return Prueba ${port}
// }



// listen: 2 parametros, es el puerto y la función flecha
app.listen(port, () => {
    console.log(`Project Running ${port}`);
    
});
app.use(express.json());
// app.use("/api", uploadRoutes);
app.use(bodyParser.json());
app.use('/api/v1', routes);
app.use('/api/v1', uploadRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
console.log(specs)

connectionDB();