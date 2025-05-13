// src/routes/proveedorRoutes.js
const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductoController');
const { checkPermission } = require('../middlewares/authMiddleware'); // Ajusta la ruta real
const PERM_MAP = require('../config/permissions-map');

const P_PERM = PERM_MAP.PRODUCTOS;


router.post('/', ProductoController.create);
router.get('/', ProductoController.getAll);
router.get('/:id_producto', ProductoController.getById);
router.put('/:id_producto', ProductoController.update);
router.delete('/:id_producto', ProductoController.delete);


// router.post('/', checkPermission(P_PERM.CREATE.url, P_PERM.CREATE.method), ProductoController.create);
// router.get('/', checkPermission(P_PERM.GET_ALL.url, P_PERM.GET_ALL.method), ProductoController.getAll);
// router.get('/:id_producto', checkPermission(P_PERM.GET_BY_ID.url, P_PERM.GET_BY_ID.method), ProductoController.getById);
// router.put('/:id_producto', checkPermission(P_PERM.UPDATE.url, P_PERM.UPDATE.method), ProductoController.update);
// router.delete('/:id_producto', checkPermission(P_PERM.DELETE.url, P_PERM.DELETE.method), ProductoController.delete);

module.exports = router;