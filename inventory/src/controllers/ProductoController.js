// src/controllers/ProductoController.js
const ProductoService = require('../services/ProductoService');
const handleServiceError = require('../utils/errorHandler').handleServiceError;

class ProductoController {
    async create(req, res, next) {      
        try {
            const producto = await ProductoService.findOrCreateProducto(req.body);
            res.status(201).json(producto);
        } catch (error) { 
            handleServiceError(error, res, next);
        }
    }
    
    // GET ALL, GET BY ID, UPDATE, DELETE
    async getAll(req, res, next) {
        try {
            const productos = await ProductoService.getAll();
            res.status(200).json(productos);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) { 
        try {
            const producto = await ProductoService.getById(req.params.id_producto);
            res.status(200).json(producto);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async update(req, res, next) { 
        try {
            const producto = await ProductoService.update(req.params.id_producto, req.body);
            res.status(200).json(producto);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async delete(req, res, next) { // :id_almacen en la ruta
        try {
            await ProductoService.delete(req.params.id_producto);
            res.status(204).send("producto eliminado correctamente");
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}
module.exports = new ProductoController();