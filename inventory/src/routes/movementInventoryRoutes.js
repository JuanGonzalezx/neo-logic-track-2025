// src/routes/proveedorProductoRoutes.js
const express = require('express');
const router = express.Router();
const MovementInventoryController = require('../controllers/MovementInventoryController');
const { checkPermission } = require('../middlewares/authMiddleware'); // Ajusta la ruta real
const PERM_MAP = require('../config/permissions-map');

const P_PERM = PERM_MAP.MOVEMENT_INVENTORY;


router.post('/', MovementInventoryController.create);
router.get('/', MovementInventoryController.getAll);
router.get('/:id_movement', MovementInventoryController.getById);
router.get('/almacen/:id_almacen', MovementInventoryController.getByAlmacen);
// router.put('/:id_almacen', MovementInventoryController.update);
router.delete('/:id_movement', MovementInventoryController.delete);


// router.post('/', checkPermission(P_PERM.CREATE.url, P_PERM.CREATE.method), MovementInventoryController.create);
// router.get('/', checkPermission(P_PERM.GET_ALL.url, P_PERM.GET_ALL.method), MovementInventoryController.getAll);
// router.get('/:id_producto', checkPermission(P_PERM.GET_BY_ID.url, P_PERM.GET_BY_ID.method), MovementInventoryController.getById);
// router.put('/:id_producto', checkPermission(P_PERM.UPDATE.url, P_PERM.UPDATE.method), MovementInventoryController.update);
// router.delete('/:id_producto', checkPermission(P_PERM.DELETE.url, P_PERM.DELETE.method), MovementInventoryController.delete);

module.exports = router;