const express = require('express');
const router = express.Router();
const AuthRoutes = require('./AuthRoutes');
const UserRoutes = require('./UserRoutes');
const RoleRoutes = require('./RoleRoutes');
const PermissionRoutes = require('./PermissionRoutes');

router.use('/auth', require('./AuthRoutes'));
router.use('/users', require('./UserRoutes'));
router.use('/upload', require('./uploadRoutes'));
router.use('/roles', require('./RoleRoutes'));
router.use('/permissions', require('./PermissionRoutes'));
module.exports = router;
