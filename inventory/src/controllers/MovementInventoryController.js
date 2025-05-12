const MovementInventoryService = require('../services/MovementInventoryService');
const handleServiceError = require('../utils/errorHandler').handleServiceError;

class MovementInventoryController {
    async create(req, res, next) {
        try {
            const movimiento = await MovementInventoryService.create(req.body);
            res.status(201).json(movimiento);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getAll(req, res, next) {
        try {
            const movimientos = await MovementInventoryService.getAll();
            res.status(200).json(movimientos);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) {
        try {
            const movimiento = await MovementInventoryService.getById(req.params.id_movement);
            res.status(200).json(movimiento);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getByAlmacen(req, res, next) {
        try {
            const movimientos = await MovementInventoryService.getByAlmacen(req.params.id_almacen);
            res.status(200).json(movimientos);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async delete(req, res, next) {
        try {
            await MovementInventoryService.delete(req.params.id_movement);
            res.status(204).send("Movimiento eliminado correctamente");
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}

module.exports = new MovementInventoryController();
