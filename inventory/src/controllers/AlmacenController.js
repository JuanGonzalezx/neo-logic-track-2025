// src/controllers/AlmacenController.js
const AlmacenService = require('../services/AlmacenService');
const handleServiceError = require('../utils/errorHandler').handleServiceError;

class AlmacenController {
    async create(req, res, next) {
        try {
            // El servicio se encargará de la validación más profunda de los campos del body (que viene del CSV)
            const almacen = await AlmacenService.create(req.body);
            res.status(201).json(almacen);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
    // GET ALL, GET BY ID, UPDATE, DELETE
    async getAll(req, res, next) {
        try {
            const almacenes = await AlmacenService.getAll();
            res.status(200).json(almacenes);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) { // :id_almacen en la ruta
        try {
            const almacen = await AlmacenService.getById(req.params.id_almacen);
            res.status(200).json(almacen);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async update(req, res, next) { // :id_almacen en la ruta
        try {
            const almacen = await AlmacenService.update(req.params.id_almacen, req.body);
            res.status(200).json(almacen);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async delete(req, res, next) { // :id_almacen en la ruta
        try {
            await AlmacenService.delete(req.params.id_almacen);
            res.status(204).send();
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}
module.exports = new AlmacenController();