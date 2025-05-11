// src/routes/ciudadRoutes.js
const express = require('express');
const router = express.Router();
const CiudadController = require('../controllers/CiudadController');
const { checkPermission } = require('../middlewares/authMiddleware');
const PERM_MAP = require('../config/permissions-map');

const C_PERM = PERM_MAP.CIUDADES;

// router.post('/', checkPermission(C_PERM.CREATE.url, C_PERM.CREATE.method), CiudadController.create);
// router.get('/', checkPermission(C_PERM.GET_ALL.url, C_PERM.GET_ALL.method), CiudadController.getAll);
// router.get('/:id', checkPermission(C_PERM.GET_BY_ID.url, C_PERM.GET_BY_ID.method), CiudadController.getById);
// router.put('/:id', checkPermission(C_PERM.UPDATE.url, C_PERM.UPDATE.method), CiudadController.update);
// router.delete('/:id', checkPermission(C_PERM.DELETE.url, C_PERM.DELETE.method), CiudadController.delete);

router.post('/', CiudadController.create);
router.get('/', CiudadController.getAll);
router.get('/:id', CiudadController.getById);
router.put('/:id', CiudadController.update);
router.delete('/:id', CiudadController.delete);



module.exports = router;