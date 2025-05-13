// src/controllers/AlmacenController.js
const ProveedorService = require('../services/ProveedorService');
const handleServiceError = require('../utils/errorHandler').handleServiceError;

class ProveedorController {
    async create(req, res, next) {
        try {
            console.log(req.body);
            
            // El servicio se encargará de la validación más profunda de los campos del body (que viene del CSV)
            const proveedor = await ProveedorService.findOrCreateProveedor(req.body);
            res.status(201).json(proveedor);
        } catch (error) { 
            handleServiceError(error, res, next);
        }
    }
    // GET ALL, GET BY ID, UPDATE, DELETE
    async getAll(req, res, next) {
        try {
            const proveedors = await ProveedorService.getAll();
            res.status(200).json(proveedors);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) { 
        try {
            const proveedor = await ProveedorService.getById(req.params.id_proveedor);
            res.status(200).json(proveedor);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async update(req, res, next) { 
        try {
            const proveedor = await ProveedorService.update(req.params.id_proveedor, req.body);
            res.status(200).json(proveedor);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async delete(req, res, next) { // :id_almacen en la ruta
        try {
            await ProveedorService.delete(req.params.id_proveedor);
            res.status(204).send("Proveedor eliminado correctamente");
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}
module.exports = new ProveedorController();