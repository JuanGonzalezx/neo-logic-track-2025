// src/routes/almacenRoutes.js
const express = require('express');
const router = express.Router();
const AlmacenController = require('../controllers/AlmacenController');
const { checkPermission } = require('../middlewares/authMiddleware'); // Ajusta la ruta real
const PERM_MAP = require('../config/permissions-map');

const A_PERM = PERM_MAP.ALMACENES;

// El body de esta solicitud vendrá con los campos del CSV
// router.post('/', checkPermission(A_PERM.CREATE.url, A_PERM.CREATE.method), AlmacenController.create);
// router.get('/', checkPermission(A_PERM.GET_ALL.url, A_PERM.GET_ALL.method), AlmacenController.getAll);
// router.get('/:id_almacen', checkPermission(A_PERM.GET_BY_ID.url, A_PERM.GET_BY_ID.method), AlmacenController.getById);
// router.put('/:id_almacen', checkPermission(A_PERM.UPDATE.url, A_PERM.UPDATE.method), AlmacenController.update);
// router.delete('/:id_almacen', checkPermission(A_PERM.DELETE.url, A_PERM.DELETE.method), AlmacenController.delete);

router.post('/', AlmacenController.create);
router.get('/', AlmacenController.getAll);
router.get('/:id_almacen', AlmacenController.getById);
router.put('/:id_almacen', AlmacenController.update);
router.delete('/:id_almacen', AlmacenController.delete);


module.exports = router;