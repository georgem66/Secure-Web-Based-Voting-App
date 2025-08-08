import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Voting API',
      version: '1.0.0',
      description: 'A secure web-based voting application with end-to-end encryption and blockchain-inspired immutable ledger',
      contact: {
        name: 'API Support',
        email: 'support@securevoting.com',
      },
    },
    servers: [
      {
        url: 'https://localhost:3001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              readOnly: true,
            },
            email: {
              type: 'string',
              format: 'email',
            },
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
            },
            isVerified: {
              type: 'boolean',
              readOnly: true,
            },
            hasVoted: {
              type: 'boolean',
              readOnly: true,
            },
            role: {
              type: 'string',
              enum: ['voter', 'admin'],
              readOnly: true,
            },
          },
        },
        Vote: {
          type: 'object',
          required: ['candidateId'],
          properties: {
            candidateId: {
              type: 'string',
              format: 'uuid',
            },
            transactionHash: {
              type: 'string',
              readOnly: true,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
            },
          },
        },
        Candidate: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              readOnly: true,
            },
            name: {
              type: 'string',
            },
            party: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            code: {
              type: 'string',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);