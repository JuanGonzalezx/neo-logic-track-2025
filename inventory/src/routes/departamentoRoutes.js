// src/routes/departamentoRoutes.js
const express = require('express');
const router = express.Router();
const DepartamentoController = require('../controllers/DepartmentoController');
const { checkPermission } = require('../middlewares/authMiddleware'); // Ajusta la ruta real
const PERM_MAP = require('../config/permissions-map');

const D_PERM = PERM_MAP.DEPARTAMENTOS;

router.post('/', checkPermission(D_PERM.CREATE.url, D_PERM.CREATE.method), DepartamentoController.create);
router.get('/', checkPermission(D_PERM.GET_ALL.url, D_PERM.GET_ALL.method), DepartamentoController.getAll);
router.get('/:id', checkPermission(D_PERM.GET_BY_ID.url, D_PERM.GET_BY_ID.method), DepartamentoController.getById);
router.put('/:id', checkPermission(D_PERM.UPDATE.url, D_PERM.UPDATE.method), DepartamentoController.update);
router.delete('/:id', checkPermission(D_PERM.DELETE.url, D_PERM.DELETE.method), DepartamentoController.delete);

module.exports = router;