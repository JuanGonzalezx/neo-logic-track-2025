const express = require('express');
const router = express.Router();
const coordinatesRoutes = require('./coordinatesRoute');
const coordinatesUserRoutes = require('./coordinatesUserRoute');

// Use the routes for orders and order products
router.use('/coordinates', coordinatesRoutes);
router.use('/coordinatesUser', coordinatesUserRoutes);
 
module.exports = router;
