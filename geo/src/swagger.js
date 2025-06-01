const swaggerJsdoc = require("swagger-jsdoc");
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Geo API',
      version: '1.0.0',
      description: 'API documentation for the Geo microservice',
      contact: {
        name: 'Geo Team',
        email: 'your.email@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3003/api/v1',
        description: 'Development server',
      },
    ],
  },
  apis: [path.join(__dirname, './swagger/*.yml')],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
