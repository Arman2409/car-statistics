import {
  ApiBodyOptions,
  ApiOperationOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';

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
  bodies: {
    update: ApiBodyOptions;
    create: ApiBodyOptions;
    bulkCreate: ApiBodyOptions;
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
