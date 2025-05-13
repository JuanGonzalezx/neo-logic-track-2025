// src/controllers/DepartamentoController.js
const DepartamentoService = require('../services/DepartamentoSerice'); // El servicio que maneja la lógica de negocio
const handleServiceError = require('../utils/errorHandler').handleServiceError; // Un helper para errores

class DepartamentoController {
    async create(req, res, next) {
        try {
            const { nombre, pais } = req.body;
            // TODO: Validación de entrada con Joi o express-validator
            if (!nombre || !pais) return res.status(400).json({ message: 'Nombre y país son requeridos' });
            const departamento = await DepartamentoService.findOrCreateDepartamento({ nombre, pais });
            res.status(201).json(departamento);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
    // GET ALL, GET BY ID, UPDATE, DELETE similares, llamando a los métodos del servicio
    // y usando handleServiceError
    async getAll(req, res, next) {
        try {
            const departamentos = await DepartamentoService.getAll();
            res.status(200).json(departamentos);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) {
        try {
            const departamento = await DepartamentoService.getById(req.params.id);
            res.status(200).json(departamento);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async update(req, res, next) {
        try {
            // TODO: Validación
            const departamento = await DepartamentoService.update(req.params.id, req.body);
            res.status(200).json(departamento);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async delete(req, res, next) {
        try {
            await DepartamentoService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}
module.exports = new DepartamentoController();