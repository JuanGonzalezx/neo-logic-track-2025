// src/routes/proveedorProductoRoutes.js
const express = require('express');
const router = express.Router();
const AlmacenProductoController = require('../controllers/AlmacenProductoController');
const { checkPermission } = require('../middlewares/authMiddleware'); // Ajusta la ruta real
const PERM_MAP = require('../config/permissions-map');

const P_PERM = PERM_MAP.ALMACEN_PRODUCTO;


router.post('/', AlmacenProductoController.create);
router.get('/', AlmacenProductoController.getAll);
router.get('/:id_almacenproducto', AlmacenProductoController.getById);
router.get('/almacen/:id_almacen', AlmacenProductoController.getByAlmacen);
router.get('/producto/:id_producto', AlmacenProductoController.getByProducto);
router.get('/producto/:id_producto/almacen/:id_almacen', AlmacenProductoController.getByAlmacenProducto);
router.put('/:id_almacenproducto', AlmacenProductoController.update);
router.delete('/:id_almacenproducto', AlmacenProductoController.delete);


// router.post('/', checkPermission(P_PERM.CREATE.url, P_PERM.CREATE.method), AlmacenProductoController.create);
// router.get('/', checkPermission(P_PERM.GET_ALL.url, P_PERM.GET_ALL.method), AlmacenProductoController.getAll);
// router.get('/:id_producto', checkPermission(P_PERM.GET_BY_ID.url, P_PERM.GET_BY_ID.method), AlmacenProductoController.getById);
// router.put('/:id_producto', checkPermission(P_PERM.UPDATE.url, P_PERM.UPDATE.method), AlmacenProductoController.update);
// router.delete('/:id_producto', checkPermission(P_PERM.DELETE.url, P_PERM.DELETE.method), AlmacenProductoController.delete);

module.exports = router;