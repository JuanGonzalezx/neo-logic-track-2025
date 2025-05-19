// src/routes/almacenRoutes.js
const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/CategoriaController');
const { checkPermission } = require('../middlewares/authMiddleware'); // Ajusta la ruta real
const PERM_MAP = require('../config/permissions-map');

const C_PERM = PERM_MAP.CATEGORIAS;

// El body de esta solicitud vendrá con los campos del CSV
// router.post('/', checkPermission(C_PERM.CREATE.url, C_PERM.CREATE.method), CategoriaController.create);
// router.get('/', checkPermission(C_PERM.GET_ALL.url, C_PERM.GET_ALL.method), CategoriaController.getAll);
// router.get('/:id_almacen', checkPermission(C_PERM.GET_BY_ID.url, C_PERM.GET_BY_ID.method), CategoriaController.getById);
// router.get('/:name_almacen', checkPermission(C_PERM.GET_BY_ID.url, C_PERM.GET_BY_ID.method), CategoriaController.getByName);
// router.put('/:id_almacen', checkPermission(C_PERM.UPDATE.url, C_PERM.UPDATE.method), CategoriaController.update);
// router.delete('/:id_almacen', checkPermission(C_PERM.DELETE.url, C_PERM.DELETE.method), CategoriaController.delete);

router.post('/', CategoriaController.create);
router.get('/', CategoriaController.getAll);
router.get('/:id_categoria', CategoriaController.getById);
router.get('/name_categoria/:name', CategoriaController.getByName);
router.put('/:id_categoria', CategoriaController.update);
router.delete('/:id_categoria', CategoriaController.delete);


module.exports = router;