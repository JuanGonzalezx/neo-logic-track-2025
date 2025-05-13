const { connectDB, prisma } = require('./config/database');
const express = require('express');
const routes = require('./routes/routes');
const bodyParser = require('body-parser');



const app = express();
const port = process.env.PORT || 3005;

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

