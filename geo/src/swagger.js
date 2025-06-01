const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const express = require('express');

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger', 'swagger.yml'));

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = setupSwagger;
