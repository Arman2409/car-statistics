export enum SwaggerStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
}

export enum SwaggerErrorType {
  VALIDATION_ERROR = 'Validation error',
  UNAUTHORIZED = 'Unauthorized',
  NOT_FOUND = 'Car not found',
}

export enum SwaggerOperation {
  CREATE = 'Create a new car',
  BULK_CREATE = 'Bulk create cars (for data ingestion)',
  GET_ALL = 'Get all cars',
  GET_ONE = 'Get a car by ID',
  UPDATE = 'Update a car',
  DELETE = 'Delete a car',
  AVERAGE_PRICE_PER_MODEL = 'Get average price per model (grouped by make + model)',
  MAKE_PERCENTAGE = 'Get percentage distribution per make',
  MODEL_PERCENTAGE = 'Get percentage distribution per model',
}

export enum SwaggerDescription {
  CAR_CREATED = 'Car created successfully',
  CARS_CREATED = 'Cars created successfully',
  CAR_FOUND = 'Car found',
  CAR_UPDATED = 'Car updated successfully',
  CAR_DELETED = 'Car deleted successfully',
  LIST_ALL_CARS = 'List of all cars',
  AVERAGE_PRICE_PER_MODEL = 'Average price per model',
  MAKE_PERCENTAGE = 'Percentage distribution per make',
  MODEL_PERCENTAGE = 'Percentage distribution per model',
}

