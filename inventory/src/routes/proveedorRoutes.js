// src/routes/proveedorRoutes.js
const express = require('express');
const router = express.Router();
const ProveedorController = require('../controllers/ProveedorController');
const { checkPermission } = require('../middlewares/authMiddleware'); // Ajusta la ruta real
const PERM_MAP = require('../config/permissions-map');

const P_PERM = PERM_MAP.PROVEEDORES;


router.post('/', ProveedorController.create);
router.get('/', ProveedorController.getAll);
router.get('/:id_proveedor', ProveedorController.getById);
router.put('/:id_proveedor', ProveedorController.update);
router.delete('/:id_proveedor', ProveedorController.delete);


// router.post('/', checkPermission(P_PERM.CREATE.url, P_PERM.CREATE.method), ProveedorController.create);
// router.get('/', checkPermission(P_PERM.GET_ALL.url, P_PERM.GET_ALL.method), ProveedorController.getAll);
// router.get('/:id_proveedor', checkPermission(P_PERM.GET_BY_ID.url, P_PERM.GET_BY_ID.method), ProveedorController.getById);
// router.put('/:id_proveedor', checkPermission(P_PERM.UPDATE.url, P_PERM.UPDATE.method), ProveedorController.update);
// router.delete('/:id_proveedor', checkPermission(P_PERM.DELETE.url, P_PERM.DELETE.method), ProveedorController.delete);

module.exports = router;