// src/controllers/AlmacenController.js
const CategoriaService = require('../services/CategoriaService');
const handleServiceError = require('../utils/errorHandler').handleServiceError;

class CategoriaController {
  async create(req, res, next) {
    try {
      console.log(req.body);

      // El servicio se encargará de la validación más profunda de los campos del body (que viene del CSV)
      const proveedor = await CategoriaService.findOrCreateCategoria(req.body);
      res.status(201).json(proveedor);
    } catch (error) {
      handleServiceError(error, res, next);
    }
  }
  // GET ALL, GET BY ID, UPDATE, DELETE
  async getAll(req, res, next) {
    try {
      const categories = await CategoriaService.getAll();
      res.status(200).json(categories);
    } catch (error) {
      handleServiceError(error, res, next);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await CategoriaService.getById(req.params.id_categoria);
      res.status(200).json(category);
    } catch (error) {
      handleServiceError(error, res, next);
    }
  }

  async getByName(req, res, next) {
    try {
      const category = await CategoriaService.getByName(req.params.name_categoria);
      res.status(200).json(category);
    } catch (error) {
      handleServiceError(error, res, next);
    }
  }

  async update(req, res, next) {
    try {
      const category = await CategoriaService.update(req.params.id_categoria, req.body);
      res.status(200).json(category);
    } catch (error) {
      handleServiceError(error, res, next);
    }
  }

  async delete(req, res, next) { 
    try {
      await CategoriaService.delete(req.params.id_categoria);
      res.status(204).send("Categoría eliminada correctamente");
    } catch (error) {
      handleServiceError(error, res, next);
    }
  }
}
module.exports = new CategoriaController();