import type { SecuritySchemeType } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export enum SwaggerSetupDetails {
    TITLE = 'Car Statistics API',
    DESCRIPTION = 'API documentation for the Car Statistics application',
    VERSION = '1.0',
}

export const SWAGGER_SETTINGS = {
  type: 'http' as SecuritySchemeType,
  scheme: 'bearer',
  bearerFormat: 'JWT',
  name: 'JWT',
  description: 'Enter JWT token',
  in: 'header',
};

export const GLOBAL_VALIDATION_SETTINGS = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};
