const express = require('express');
const router = express.Router();
const OrderProductsController = require('../controllers/OrderProductsController');

// Routes for order products
router.get('/', OrderProductsController.getAllOrderProducts);
router.get('/:id', OrderProductsController.getOrderProductById);
router.post('/', OrderProductsController.createOrderProduct);
router.put('/:id', OrderProductsController.updateOrderProduct);
router.delete('/:id', OrderProductsController.deleteOrderProduct);

module.exports = router;
