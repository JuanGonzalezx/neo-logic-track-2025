const swaggerJsdoc = require("swagger-jsdoc");
const path = require('path');

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'GEO API',
        version: '1.0.0',
        description: 'API documentation for GEO project',
        contact: {
          name: 'GEO Team',
          email: 'juan.rendon37632@ucaldas.edu.co',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000/api/v1',
          description: 'Development server',
        },
      ],
    },
    apis: [path.join(__dirname, './swagger/*.yml')],
  };

const specs = swaggerJsdoc(options);

module.exports = specs;