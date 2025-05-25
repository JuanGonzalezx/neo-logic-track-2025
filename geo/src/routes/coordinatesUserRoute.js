const express = require('express');
const router = express.Router();
const CoordinateUserController = require('../controllers/CoordinateUserController');

// Routes for orders
router.get('/', CoordinateUserController.getAll);
router.get('/:id', CoordinateUserController.getById);
router.get('/user/:id', CoordinateUserController.getByUserId);
router.post('/', CoordinateUserController.create);
router.put('/:id', CoordinateUserController.update);
router.delete('/:id', CoordinateUserController.delete);
router.delete('/user/:idUser/coordinate/:idCoordinate', CoordinateUserController.deleteByUserAndCoordinate);

module.exports = router;
