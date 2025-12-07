import { SwaggerErrorType, SwaggerOperation, SwaggerDescription } from './swagger.enums';
import { HttpStatus } from '@nestjs/common';
import type { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export function createSwaggerOperation(summary: SwaggerOperation): ApiOperationOptions {
  return { summary };
}

export function createSwaggerResponse(
  status: HttpStatus,
  description: SwaggerDescription | string,
  type?: Function,
  schema?: object,
): ApiResponseOptions {
  const response: ApiResponseOptions = {
    status,
    description,
  };

  if (type) {
    response.type = type;
  }

  if (schema) {
    (response as {schema: unknown}).schema = schema;
  }

  return response;
}

export function createErrorResponse(
  status: HttpStatus,
  description: SwaggerErrorType | string,
): ApiResponseOptions {
  return {
    status,
    description,
  };
}

export function createArrayResponse(
  status: HttpStatus,
  description: SwaggerDescription | string,
  itemType: Function,
): ApiResponseOptions {
  return {
    status,
    description,
    type: [itemType] as [typeof itemType],
  };
}

