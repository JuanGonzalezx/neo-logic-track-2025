// src/controllers/CiudadController.js
const CiudadService = require('../services/CiudadSerice');
const handleServiceError = require('../utils/errorHandler').handleServiceError;

class CiudadController {
    async create(req, res, next) {
        try {
            const { nombre, codigo_postal, nombre_departamento, pais_departamento, departamentoId } = req.body;
            // TODO: Validación
            if (!nombre || !codigo_postal || (!departamentoId && (!nombre_departamento || !pais_departamento))) {
                return res.status(400).json({ message: 'Campos incompletos para ciudad.' });
            }
            const ciudad = await CiudadService.findOrCreateCiudad(req.body);
            res.status(201).json(ciudad);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
    // GET ALL, GET BY ID, UPDATE, DELETE
    async getAll(req, res, next) {
        try {
            const ciudades = await CiudadService.getAll();
            res.status(200).json(ciudades);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) {
        try {
            const ciudad = await CiudadService.getById(req.params.id);
            res.status(200).json(ciudad);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async update(req, res, next) {
        try {
            // TODO: Validación
            const ciudad = await CiudadService.update(req.params.id, req.body);
            res.status(200).json(ciudad);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async delete(req, res, next) {
        try {
            await CiudadService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}
module.exports = new CiudadController();