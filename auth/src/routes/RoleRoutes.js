const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');
const { checkPermission } = require('../controllers/AuthController'); // O donde esté
const PERMISSIONS = require('../config/permissions-map');
const {
    CREATE,
    GET_ALL,
    GET_BY_ID,
    UPDATE,
    DELETE,
    ASSIGN_PERMISSIONS,
    REMOVE_PERMISSIONS
  } = PERMISSIONS.ROLES;

router.post(
  '/',
  checkPermission(CREATE.url, CREATE.method),
  RoleController.createRole
);

router.get(
  '/',
  checkPermission(GET_ALL.url, GET_ALL.method),
  RoleController.getRoles
);

router.get(
  '/:id',
  checkPermission(GET_BY_ID.url, GET_BY_ID.method),
  RoleController.getRoleById
);

router.put(
  '/:id',
  checkPermission(UPDATE.url, UPDATE.method),
  RoleController.updateRole
);

router.delete(
  '/:id',
  checkPermission(DELETE.url, DELETE.method),
  RoleController.deleteRole
);

router.post(
  '/:id/permissions',
  checkPermission(ASSIGN_PERMISSIONS.url, ASSIGN_PERMISSIONS.method),
  RoleController.addPermissionsToRole
);

router.delete(
  '/:id/permissions',
  checkPermission(REMOVE_PERMISSIONS.url, REMOVE_PERMISSIONS.method),
  RoleController.removePermissionsFromRole
);
// router.post('/', createRole);
// router.get('/', getRoles);
// router.get('/:id', getRoleById);
// router.put('/:id', updateRole);
// router.delete('/:id', deleteRole);
// router.post('/:id/permissions', addPermissionsToRole);
// router.delete('/:id/permissions', removePermissionsFromRole);

// Crear rol
// router.post('/', checkPermission('/api/v1/roles', 'POST'),createRole);

// Obtener todos los roles
// router.get('/', checkPermission('/api/v1/roles', 'GET'), getRoles);

// Obtener rol por ID
// router.get('/:id', checkPermission('/api/v1/role/:id', 'GET'), getRoleById);

// Actualizar rol
// router.put('/:id', checkPermission('/api/v1/roles/:id', 'PUT'), updateRole);

// Eliminar rol
// router.delete('/:id', checkPermission('/api/v1/roles/:id', 'DELETE'), deleteRole);

// Agregar permisos a un rol
// router.post('/:id/permissions', checkPermission('/api/v1/roles', 'POST'), addPermissionsToRole);

// Eliminar permisos de un rol
// router.delete('/:id/permissions', checkPermission('/api/v1/roles/:id/permissions', 'DELETE'), removePermissionsFromRole);


module.exports = router;
