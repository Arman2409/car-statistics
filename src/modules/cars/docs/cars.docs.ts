import { Car } from '../entities/car.entity';

export const CARS_TAG = 'Cars';

export const CREATE_OPERATION = { summary: 'Create a new car' };
export const CREATE_RESPONSE = {
  status: 201,
  description: 'Car created successfully',
  type: Car,
};

export const BULK_CREATE_OPERATION = { summary: 'Bulk create cars (for data ingestion)' };
export const BULK_CREATE_RESPONSE = {
  status: 201,
  description: 'Cars created successfully',
  type: ([Car] as unknown) as [typeof Car],
};

export const GET_ALL_OPERATION = { summary: 'Get all cars' };
export const GET_ALL_RESPONSE = {
  status: 200,
  description: 'List of all cars',
  type: ([Car] as unknown) as [typeof Car],
};

export const GET_ONE_OPERATION = { summary: 'Get a car by ID' };
export const GET_ONE_RESPONSE = {
  status: 200,
  description: 'Car found',
  type: Car,
};

export const UPDATE_OPERATION = { summary: 'Update a car' };
export const UPDATE_RESPONSE = {
  status: 200,
  description: 'Car updated successfully',
  type: Car,
};

export const DELETE_OPERATION = { summary: 'Delete a car' };
export const DELETE_RESPONSE = { status: 204, description: 'Car deleted successfully' };

export const VALIDATION_ERROR = { status: 400, description: 'Validation error' };
export const UNAUTHORIZED = { status: 401, description: 'Unauthorized' };
export const NOT_FOUND = { status: 404, description: 'Car not found' };

export const AVERAGE_PRICE_PER_MODEL_OPERATION = {
  summary: 'Get average price per model (grouped by make + model)',
};
export const AVERAGE_PRICE_PER_MODEL_RESPONSE = {
  status: 200,
  description: 'Average price per model',
  schema: {
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
};

export const MAKE_PERCENTAGE_OPERATION = { summary: 'Get percentage distribution per make' };
export const MAKE_PERCENTAGE_RESPONSE = {
  status: 200,
  description: 'Percentage distribution per make',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        make: { type: 'string', example: 'toyota' },
        percentage: { type: 'number', example: 25.5 },
      },
    },
  },
};

export const MODEL_PERCENTAGE_OPERATION = { summary: 'Get percentage distribution per model' };
export const MODEL_PERCENTAGE_RESPONSE = {
  status: 200,
  description: 'Percentage distribution per model',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        model: { type: 'string', example: 'corolla' },
        percentage: { type: 'number', example: 15.3 },
      },
    },
  },
};
