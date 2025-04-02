const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');

dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stanbic Authentication System (SAS) API',
      version: '1.0.0',
      description: 'API documentation for SAS project with authentication, MFA, and RBAC.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: 'Development Server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
