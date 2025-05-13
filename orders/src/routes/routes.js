const express = require('express');
const router = express.Router();
const OrderRoutes = require('./OrderRoutes');
const OrderProductsRoutes = require('./OrderProductsRoutes');

// Use the routes for orders and order products
router.use('/orders', OrderRoutes);
router.use('/order-products', OrderProductsRoutes);

module.exports = router;
