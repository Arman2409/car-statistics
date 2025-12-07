import { SwaggerErrorType, SwaggerOperation } from './swagger.enums';
import { HttpStatus } from '@nestjs/common';
import type { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export function createSwaggerOperation(
  summary: SwaggerOperation,
): ApiOperationOptions {
  return { summary };
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
