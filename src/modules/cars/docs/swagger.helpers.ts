import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';
import { SwaggerStatus, SwaggerErrorType, SwaggerOperation, SwaggerDescription } from './swagger.enums';

export function createSwaggerOperation(summary: SwaggerOperation): ApiOperationOptions {
  return { summary };
}

export function createSwaggerResponse(
  status: SwaggerStatus,
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
  status: SwaggerStatus,
  description: SwaggerErrorType | string,
): ApiResponseOptions {
  return {
    status,
    description,
  };
}

export function createArrayResponse(
  status: SwaggerStatus,
  description: SwaggerDescription | string,
  itemType: any,
): ApiResponseOptions {
  return {
    status,
    description,
    type: ([itemType] as unknown) as [typeof itemType],
  };
}

