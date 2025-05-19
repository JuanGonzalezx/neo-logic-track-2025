const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const PERM_MAP = require('../config/permissions-map');
const { checkPermission } = require('../controllers/AuthController');

// router.post('/', checkPermission(PERM_MAP.USERS.CREATE.url, PERM_MAP.USERS.CREATE.method), UserController.createUser);
// router.get('/', checkPermission(PERM_MAP.USERS.GET_ALL.url, PERM_MAP.USERS.GET_ALL.method), UserController.getAllUsers);
router.get('/:id', checkPermission(PERM_MAP.USERS.GET_BY_ID.url, PERM_MAP.USERS.GET_BY_ID.method), UserController.getUserById);
router.put('/:id', checkPermission(PERM_MAP.USERS.UPDATE_USER.url, PERM_MAP.USERS.UPDATE_USER.method), UserController.updateUser); 
// router.delete('/:id', checkPermission(PERM_MAP.USERS.DELETE_USER.url, PERM_MAP.USERS.DELETE_USER.method), UserController.deleteUser);
router.delete('/:id', UserController.deleteData);
router.post('/', UserController.createUser);
router.get('/email/:email', UserController.getUserByEmail);

router.post('/despachadores', UserController.createDespachadores);
router.get('/despachadores/:id', UserController.getDespachadorByCity);

router.post('/repartidores', UserController.createRepartidores);
router.get('/repartidores/:id', UserController.getRepartidorByCity);


// router.get('/',checkPermission('/api/v1/users', 'GET'), getAllUsers);
router.get('/', UserController.getAllUsers);

// router.get('/:id', checkPermission('/api/v1/users/:id', 'GET'), getUserById);
// router.get('/:id', getUserById);

// router.post('/', checkPermission('/api/v1/users', 'POST'), createUser);

// router.put('/:id', checkPermission('/api/v1/users/:id', 'PUT'), updateUser);
// router.put('/:id', updateUser);

// router.delete('/:id', deleteUser);
// router.delete('/:id', checkPermission('/api/v1/users/:id', 'DELETE'), deleteUser);


module.exports = router;
