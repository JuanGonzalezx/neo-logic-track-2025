const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/PermissionController');
const { checkPermission } = require('../controllers/AuthController');
const PERM_MAP = require('../config/permissions-map');

router.post('/', /*checkPermission(PERM_MAP.PERMISSIONS_CRUD.CREATE.url, PERM_MAP.PERMISSIONS_CRUD.CREATE.method), */PermissionController.createPermission);
router.get('/', /*checkPermission(PERM_MAP.PERMISSIONS_CRUD.GET_ALL.url, PERM_MAP.PERMISSIONS_CRUD.GET_ALL.method),*/ PermissionController.getPermissions);
router.get('/:id', checkPermission(PERM_MAP.PERMISSIONS_CRUD.GET_BY_ID.url, PERM_MAP.PERMISSIONS_CRUD.GET_BY_ID.method), PermissionController.getPermissionById);
router.put('/:id', checkPermission(PERM_MAP.PERMISSIONS_CRUD.UPDATE.url, PERM_MAP.PERMISSIONS_CRUD.UPDATE.method), PermissionController.updatePermission);
router.delete('/:id', checkPermission(PERM_MAP.PERMISSIONS_CRUD.DELETE.url, PERM_MAP.PERMISSIONS_CRUD.DELETE.method), PermissionController.deletePermission);

// Crear permiso
// router.post('/', createPermission);

// Obtener todos los permisos
// router.get('/', getPermissions);

// Obtener permiso por ID
// router.get('/:id', getPermissionById);

// Actualizar permiso
// router.put('/:id', updatePermission);

// Eliminar permiso
// router.delete('/:id', deletePermission);

module.exports = router;
