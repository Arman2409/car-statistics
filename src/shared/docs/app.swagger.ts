export const APP_SWAGGER = {
  TAG: 'App',
  ROOT: {
    summary: 'Root status',
    okResponse: {
      description: 'Simple server running message',
      schema: { type: 'string', example: 'Server Running!' },
    },
  },
  HEALTH: {
    summary: 'Health check',
    okResponse: {
      description: 'Health check response',
      schema: { type: 'string', example: 'OK' },
    },
  },
};
