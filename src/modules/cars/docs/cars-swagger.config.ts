// modules/cars/docs/cars.swagger.ts

import { HttpStatus } from '@nestjs/common';
import {
  SwaggerOperation,
  SwaggerDescription,
  SwaggerErrorType,
} from './swagger.enums';
import { createSwaggerOperation, createErrorResponse } from './swagger.helpers';
import type { CarsSwaggerConfig } from '../types/CarsSwaggerConfig';

export const CARS_TAG = 'Cars';

// Reusable schema for a single car response (matches your entity + public fields)
const CarResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'number', example: 123 },
    normalizedMake: { type: 'string', example: 'honda' },
    normalizedModel: { type: 'string', example: 'civic' },
    year: { type: 'number', example: 2020 },
    price: { type: 'number', example: 15999 },
    location: { type: 'string', example: 'Chicago' },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2025-01-15T10:30:00Z',
    },
  },
} as const;

export function createCarsSwaggerConfig(): CarsSwaggerConfig {
  return {
    operations: {
      create: createSwaggerOperation(SwaggerOperation.CREATE),
      bulkCreate: createSwaggerOperation(SwaggerOperation.BULK_CREATE),
      getAll: createSwaggerOperation(SwaggerOperation.GET_ALL),
      getOne: createSwaggerOperation(SwaggerOperation.GET_ONE),
      update: createSwaggerOperation(SwaggerOperation.UPDATE),
      delete: createSwaggerOperation(SwaggerOperation.DELETE),
      averagePricePerModel: createSwaggerOperation(
        SwaggerOperation.AVERAGE_PRICE_PER_MODEL,
      ),
      makePercentage: createSwaggerOperation(SwaggerOperation.MAKE_PERCENTAGE),
      modelPercentage: createSwaggerOperation(
        SwaggerOperation.MODEL_PERCENTAGE,
      ),
    },

    // Request bodies with nice examples
    bodies: {
      create: {
        description: 'Create a new car',
        required: true,
        examples: {
          createOne: {
            summary: 'Create a single car',
            value: {
              make: 'ford',
              model: 'focus',
              year: 2018,
              price: 18000,
              location: 'New York',
            },
          },
        },
      },
      update: {
        description: 'Partial update of car fields',

        examples: {
          updatePriceAndLocation: {
            summary: 'Update price and location',
            value: { price: 18500, location: 'Seattle' },
          },
          updateOnlyYear: {
            summary: 'Update only year',
            value: { year: 2022 },
          },
        },
      },
      bulkCreate: {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              normalizedMake: { type: 'string', example: 'honda' },
              normalizedModel: { type: 'string', example: 'civic' },
              year: { type: 'number', example: 2019 },
              price: { type: 'number', example: 14000 },
              location: { type: 'string', example: 'Chicago' },
            },
          },
        },
      },
    },
    // Responses
    responses: {
      create: {
        status: HttpStatus.CREATED,
        description: SwaggerDescription.CAR_CREATED,
        schema: CarResponseSchema,
      },

      bulkCreate: {
        status: HttpStatus.ACCEPTED,
        description: 'Cars queued for creation',
      },

      getAll: {
        status: HttpStatus.OK,
        description: SwaggerDescription.LIST_ALL_CARS,
        schema: {
          type: 'array',
          items: CarResponseSchema,
        },
      },

      getOne: {
        status: HttpStatus.OK,
        description: SwaggerDescription.CAR_FOUND,
        schema: CarResponseSchema,
      },

      update: {
        status: HttpStatus.OK,
        description: SwaggerDescription.CAR_UPDATED,
        schema: CarResponseSchema,
      },

      delete: {
        status: HttpStatus.NO_CONTENT,
        description: SwaggerDescription.CAR_DELETED,
      },

      averagePricePerModel: {
        status: HttpStatus.OK,
        description: SwaggerDescription.AVERAGE_PRICE_PER_MODEL,
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              make: { type: 'string', example: 'honda' },
              model: { type: 'string', example: 'civic' },
              averagePrice: {
                type: 'number',
                format: 'float',
                example: 14250.75,
              },
            },
            required: ['make', 'model', 'averagePrice'],
          },
        },
      },

      makePercentage: {
        status: HttpStatus.OK,
        description: SwaggerDescription.MAKE_PERCENTAGE,
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              make: { type: 'string', example: 'toyota' },
              percentage: { type: 'number', format: 'float', example: 28.4 },
            },
          },
        },
      },

      modelPercentage: {
        status: HttpStatus.OK,
        description: SwaggerDescription.MODEL_PERCENTAGE,
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              model: { type: 'string', example: 'corolla' },
              percentage: { type: 'number', format: 'float', example: 12.8 },
            },
          },
        },
      },
    },

    errors: {
      validationError: createErrorResponse(
        HttpStatus.BAD_REQUEST,
        SwaggerErrorType.VALIDATION_ERROR,
      ),
      unauthorized: createErrorResponse(
        HttpStatus.UNAUTHORIZED,
        SwaggerErrorType.UNAUTHORIZED,
      ),
      notFound: createErrorResponse(
        HttpStatus.NOT_FOUND,
        SwaggerErrorType.NOT_FOUND,
      ),
    },
  };
}
