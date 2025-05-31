// src/controllers/CoordinatesUserController.js
const handleServiceError = require('../utils/errorHandler').handleServiceError;
const CoordinateUserService = require('../services/CoordianteUserService');

class CoordinatesUserController {
    async create(req, res, next) {
        try {
            const coordinatesUser = await CoordinateUserService.create(req.body);
            res.status(201).json(coordinatesUser);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getAll(req, res, next) {
        try {
            const allRelations = await CoordinateUserService.getAll();
            res.status(200).json(allRelations);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) {
        try {
            const relation = await CoordinateUserService.getById(req.params.id);
            res.status(200).json(relation);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getByUserId(req, res, next) {
        try {
            const relations = await CoordinateUserService.getByUserId(req.params.id);
            res.status(200).json(relations);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getByCoordinateId(req, res, next) {
        try {
            const relations = await CoordinateUserService.getByCoordinateId(req.params.coordinate_id);
            res.status(200).json(relations);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async update(req, res, next) {
        try {
            const relation = await CoordinateUserService.update(req.params.id, req.body);
            res.status(200).json(relation);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async delete(req, res, next) {
        try {
            await CoordinateUserService.delete(req.params.id);
            res.status(204).send("Relación usuario-coordenada eliminada correctamente");
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async deleteByUserAndCoordinate(req, res, next) {
        try {
            const { idUser, idCoordinate } = req.params;
            await CoordinateUserService.deleteByUserAndCoordinate(idUser, idCoordinate);
            res.status(204).send("Relación usuario-coordenada eliminada correctamente");
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}

module.exports = new CoordinatesUserController();