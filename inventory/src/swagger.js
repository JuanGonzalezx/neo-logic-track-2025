const swaggerJsdoc = require("swagger-jsdoc");
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory API',
      version: '1.0.0',
      description: 'API documentation for the Inventory microservice',
      contact: {
        name: 'Inventory Team',
        email: 'your.email@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development server',
      },
    ],
  },
  apis: [path.join(__dirname, './swagger/*.yml')],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
