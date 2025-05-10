const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const { getAllCategories, createCategory } = require('../controllers/CategoryController');

router.get('/', getAllCategories);
router.post('/', createCategory);

module.exports = router;
