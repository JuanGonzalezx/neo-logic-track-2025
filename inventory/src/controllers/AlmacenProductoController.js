const AlmacenProductoService = require('../services/AlmacenProductoService');
const handleServiceError = require('../utils/errorHandler').handleServiceError;

class AlmacenProductoController {
    async create(req, res, next) {
        try {
            const almacenProducto = await AlmacenProductoService.findOrCreateAlmacenProducto(req.body);
            res.status(201).json(almacenProducto);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getAll(req, res, next) {
        try {
            const items = await AlmacenProductoService.getAll();
            res.status(200).json(items);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getById(req, res, next) {
        try {
            const item = await AlmacenProductoService.getById(req.params.id_almacenproducto);
            res.status(200).json(item);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getByProducto(req, res, next) {
        try {
            const items = await AlmacenProductoService.getByProducto(req.params.id_producto);
            res.status(200).json(items);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async getByAlmacen(req, res, next) {
        try {
            const items = await AlmacenProductoService.getByAlmacen(req.params.id_almacen);
            res.status(200).json(items);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async update(req, res, next) {
        try {
            const almacenproducto = await AlmacenProductoService.update(req.params.id_almacenproducto, req.body);
            res.status(200).json(almacenproducto);
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }

    async delete(req, res, next) {
        try {
            await AlmacenProductoService.delete(req.params.id_almacenproducto);
            res.status(204).send("AlmacenProducto eliminado correctamente");
        } catch (error) {
            handleServiceError(error, res, next);
        }
    }
}

module.exports = new AlmacenProductoController();
