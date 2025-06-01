const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// src/controllers/CoordinatesController.js
const handleServiceError = require('../utils/errorHandler').handleServiceError;
const CoordinatesService = require('../services/CoordinateService');

class CoordinatesController {
    async create(req, res, next) {
        try {

            const coordinates = await CoordinatesService.findOrCreate(req.body);
            res.status(201).json(coordinates);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getAll(req, res, next) {
        try {
            const allCoordinates = await CoordinatesService.getAll();
            res.status(200).json(allCoordinates);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) {
        try {
            const coordinates = await CoordinatesService.getById(req.params.id);
            res.status(200).json(coordinates);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async update(req, res, next) {
        try {
            const coordinate = await CoordinatesService.update(req.params.id, req.body);
            res.status(200).json(coordinate);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async delete(req, res, next) {
        try {
            await CoordinatesService.delete(req.params.id);
            res.status(204).send("Coordinates deleted successfully");
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}

module.exports = new CoordinatesController();