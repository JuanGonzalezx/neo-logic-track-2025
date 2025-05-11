const express = require('express');
const router = express.Router();

router.use('/category', require('./CategoryRoutes'));
const departamentoRoutes = require('./departamentoRoutes');
const ciudadRoutes = require('./ciudadRoutes');
const almacenRoutes = require('./almacenRoutes');

router.use('/departamentos', departamentoRoutes);
router.use('/ciudades', ciudadRoutes);
router.use('/almacenes', almacenRoutes);

module.exports = router;
