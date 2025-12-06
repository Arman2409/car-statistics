export const MAKE_API = {
  description: 'Normalized make of the car',
  example: 'toyota',
};

export const MODEL_API = {
  description: 'Normalized model of the car',
  example: 'corolla',
};

export const YEAR_API = {
  description: 'Year of the car',
  example: 2020,
  minimum: 1900,
  maximum: 2050,
};

export const PRICE_API = {
  description: 'Price of the car',
};

export const LOCATION_API = {
  description: 'Location of the car',
  example: 'New York, NY',
};
