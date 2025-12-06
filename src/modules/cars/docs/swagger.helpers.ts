import { SwaggerErrorType, SwaggerOperation, SwaggerDescription } from './swagger.enums';
import { HttpStatus } from '@nestjs/common';
import type { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export function createSwaggerOperation(summary: SwaggerOperation): ApiOperationOptions {
  return { summary };
}

export function createSwaggerResponse(
  status: HttpStatus,
  description: SwaggerDescription | string,
  type?: any,
  schema?: any,
): ApiResponseOptions {
  const response: ApiResponseOptions = {
    status,
    description,
  };

  if (type) {
    response.type = type;
  }

  if (schema) {
    (response as any).schema = schema;
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
  itemType: any,
): ApiResponseOptions {
  return {
    status,
    description,
    type: ([itemType] as unknown) as [typeof itemType],
  };
}

