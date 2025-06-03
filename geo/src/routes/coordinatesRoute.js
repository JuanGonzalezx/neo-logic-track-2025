const express = require('express');
const router = express.Router();
const CoordinateController = require('../controllers/CoordinateController');

// Routes for orders
router.get('/', CoordinateController.getAll);
router.get('/:id', CoordinateController.getById);
router.post('/', CoordinateController.create);
router.post('/order', CoordinateController.createCoordinateForOrder);
router.post('/repartidores', CoordinateController.createRepartidoresWithCoordinates);
router.put('/:id', CoordinateController.update);
router.delete('/:id', CoordinateController.delete);

module.exports = router;
