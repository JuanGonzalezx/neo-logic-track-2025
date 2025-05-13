const express = require('express');
const router = express.Router();

const departamentoRoutes = require('./departamentoRoutes');
const ciudadRoutes = require('./ciudadRoutes');
const almacenRoutes = require('./almacenRoutes');
const proveedorRoutes = require('./proveedorRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const productoRoutes = require('./productoRoutes');
const proveedorProductoRoutes = require('./productoProveedorRoutes');
const almacenProductoRoutes = require('./almacenProductoRoutes');
const movementInventoryRoutes = require('./movementInventoryRoutes');

router.use('/departamentos', departamentoRoutes);
router.use('/ciudades', ciudadRoutes);
router.use('/almacenes', almacenRoutes);
router.use('/proveedores', proveedorRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/productos', productoRoutes);
router.use('/proveedorproductos', proveedorProductoRoutes);
router.use('/almacenproductos', almacenProductoRoutes);
router.use('/movements', movementInventoryRoutes);


module.exports = router;
