// src/controllers/ProveedorProductoController.js
const ProveedorService = require('../services/ProveedorService');
const ProveedorProductoService = require('../services/ProveedorProductoService');
const ProductoService = require('../services/ProductoService');

const handleServiceError = require('../utils/errorHandler').handleServiceError;

class ProveedorProductoController {
    async create(req, res, next) {
        try {
            // El servicio se encargará de la validación más profunda de los campos del body (que viene del CSV)
            const propro = await ProveedorProductoService.findOrCreateProveedorProducto(req.body);
            res.status(201).json(propro);
        } catch (error) { 
            handleServiceError(error, res, next);
        }
    }

    // GET ALL, GET BY ID, UPDATE, DELETE
    async getAll(req, res, next) {
        try {
            const propros = await ProveedorProductoService.getAll();
            res.status(200).json(propros);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) { 
        try {
            const proveedor = await ProveedorProductoService.getById(req.params.id_proveedorproductos);
            res.status(200).json(proveedor);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

     async getByProducto(req, res, next) { 
        try {
            const producto = await ProveedorProductoService.getByProducto(req.params.id_producto);
            res.status(200).json(producto);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

     async getByProveedor(req, res, next) { 
        try {
            const proveedor = await ProveedorProductoService.getByProveedor(req.params.id_proveedor);
            res.status(200).json(proveedor);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    // async update(req, res, next) { 
    //     try {
    //         const proveedor = await ProveedorService.update(req.params.id_proveedor, req.body);
    //         res.status(200).json(proveedor);
    //     } catch (error) {
    //         handleServiceError(error, res, next);
    //     }
    // }

    async delete(req, res, next) { // :id_almacen en la ruta
        try {
            await ProveedorProductoService.delete(req.params.id_proveedorproductos);
            res.status(204).send("Proveedor eliminado correctamente");
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}
module.exports = new ProveedorProductoController();