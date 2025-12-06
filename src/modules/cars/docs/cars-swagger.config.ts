import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';
import { SwaggerErrorType, SwaggerOperation, SwaggerDescription } from '@/modules/cars/docs/swagger.enums';
import { Car } from '@/modules/cars/entities/car.entity';
import { createSwaggerOperation, createSwaggerResponse, createErrorResponse, createArrayResponse } from './swagger.helpers';
import { HttpStatus } from '@nestjs/common';

export const CARS_TAG = 'Cars';

export interface CarsSwaggerConfig {
  operations: {
    create: ApiOperationOptions;
    bulkCreate: ApiOperationOptions;
    getAll: ApiOperationOptions;
    getOne: ApiOperationOptions;
    update: ApiOperationOptions;
    delete: ApiOperationOptions;
    averagePricePerModel: ApiOperationOptions;
    makePercentage: ApiOperationOptions;
    modelPercentage: ApiOperationOptions;
  };
  responses: {
    create: ApiResponseOptions;
    bulkCreate: ApiResponseOptions;
    getAll: ApiResponseOptions;
    getOne: ApiResponseOptions;
    update: ApiResponseOptions;
    delete: ApiResponseOptions;
    averagePricePerModel: ApiResponseOptions;
    makePercentage: ApiResponseOptions;
    modelPercentage: ApiResponseOptions;
  };
  errors: {
    validationError: ApiResponseOptions;
    unauthorized: ApiResponseOptions;
    notFound: ApiResponseOptions;
  };
}

export function createCarsSwaggerConfig(): CarsSwaggerConfig {
  return {
    operations: {
      create: createSwaggerOperation(SwaggerOperation.CREATE),
      bulkCreate: createSwaggerOperation(SwaggerOperation.BULK_CREATE),
      getAll: createSwaggerOperation(SwaggerOperation.GET_ALL),
      getOne: createSwaggerOperation(SwaggerOperation.GET_ONE),
      update: createSwaggerOperation(SwaggerOperation.UPDATE),
      delete: createSwaggerOperation(SwaggerOperation.DELETE),
      averagePricePerModel: createSwaggerOperation(SwaggerOperation.AVERAGE_PRICE_PER_MODEL),
      makePercentage: createSwaggerOperation(SwaggerOperation.MAKE_PERCENTAGE),
      modelPercentage: createSwaggerOperation(SwaggerOperation.MODEL_PERCENTAGE),
    },
    responses: {
      create: createSwaggerResponse(HttpStatus.CREATED, SwaggerDescription.CAR_CREATED, Car),
      bulkCreate: createArrayResponse(HttpStatus.ACCEPTED, SwaggerDescription.CARS_QUEUED, Car),
      getAll: createArrayResponse(HttpStatus.OK, SwaggerDescription.LIST_ALL_CARS, Car),
      getOne: createSwaggerResponse(HttpStatus.OK, SwaggerDescription.CAR_FOUND, Car),
      update: createSwaggerResponse(HttpStatus.OK, SwaggerDescription.CAR_UPDATED, Car),
      delete: createSwaggerResponse(HttpStatus.NO_CONTENT, SwaggerDescription.CAR_DELETED),
      averagePricePerModel: createSwaggerResponse(
        HttpStatus.OK,
        SwaggerDescription.AVERAGE_PRICE_PER_MODEL,
        undefined,
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              make: { type: 'string', example: 'toyota' },
              model: { type: 'string', example: 'corolla' },
              averagePrice: { type: 'number', example: 12000 },
            },
          },
        },
      ),
      makePercentage: createSwaggerResponse(
        HttpStatus.OK,
        SwaggerDescription.MAKE_PERCENTAGE,
        undefined,
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              make: { type: 'string', example: 'toyota' },
              percentage: { type: 'number', example: 25.5 },
            },
          },
        },
      ),
      modelPercentage: createSwaggerResponse(
        HttpStatus.OK,
        SwaggerDescription.MODEL_PERCENTAGE,
        undefined,
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              model: { type: 'string', example: 'corolla' },
              percentage: { type: 'number', example: 15.3 },
            },
          },
        },
      ),
    },
    errors: {
      validationError: createErrorResponse(HttpStatus.BAD_REQUEST, SwaggerErrorType.VALIDATION_ERROR),
      unauthorized: createErrorResponse(HttpStatus.UNAUTHORIZED, SwaggerErrorType.UNAUTHORIZED),
      notFound: createErrorResponse(HttpStatus.NOT_FOUND, SwaggerErrorType.NOT_FOUND),
    },
  };
}

