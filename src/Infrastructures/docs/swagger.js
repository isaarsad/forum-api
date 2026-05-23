import swaggerJsDoc from 'swagger-jsdoc';

let swaggerServers;
if (process.env.NODE_ENV === 'production') {
  swaggerServers = [
    {
      url: process.env.API_BASE_URL,
      description: 'Production Server',
    },
  ];
} else {
  swaggerServers = [
    {
      url: 'http://localhost:80',
      description: 'Local Development Server',
    },
  ];
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Forum API Documentation',
      version: '1.0',
      description: 'API Documentation for the Forum application.',
    },
    servers: swaggerServers,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./docs/**/*.yaml'],
};

const swaggerSpec = swaggerJsDoc(options);
export default swaggerSpec;
