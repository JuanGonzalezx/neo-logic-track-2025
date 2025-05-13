// src/routes/proveedorProductoRoutes.js
const express = require('express');
const router = express.Router();
const ProveedorProductoController = require('../controllers/ProveedorProductoController');
const { checkPermission } = require('../middlewares/authMiddleware'); // Ajusta la ruta real
const PERM_MAP = require('../config/permissions-map');

const P_PERM = PERM_MAP.PROVEEDOR_PRODUCTOS;


router.post('/', ProveedorProductoController.create);
router.get('/', ProveedorProductoController.getAll);
router.get('/:id_proveedorproductos', ProveedorProductoController.getById);
router.get('/proveedor/:id_proveedor', ProveedorProductoController.getByProveedor);
router.get('/producto/:id_producto', ProveedorProductoController.getByProducto);
// router.put('/:id_proveedorproductos', ProveedorProductoController.update);
router.delete('/:id_proveedorproductos', ProveedorProductoController.delete);


// router.post('/', checkPermission(P_PERM.CREATE.url, P_PERM.CREATE.method), ProveedorProductoController.create);
// router.get('/', checkPermission(P_PERM.GET_ALL.url, P_PERM.GET_ALL.method), ProveedorProductoController.getAll);
// router.get('/:id_producto', checkPermission(P_PERM.GET_BY_ID.url, P_PERM.GET_BY_ID.method), ProveedorProductoController.getById);
// router.put('/:id_producto', checkPermission(P_PERM.UPDATE.url, P_PERM.UPDATE.method), ProveedorProductoController.update);
// router.delete('/:id_producto', checkPermission(P_PERM.DELETE.url, P_PERM.DELETE.method), ProveedorProductoController.delete);

module.exports = router;