const express = require('express');
const router = express.Router();

router.use('/category', require('./CategoryRoutes'));

module.exports = router;
