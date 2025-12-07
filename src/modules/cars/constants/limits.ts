export const RESPONSE_LIMITS = {
  ALL_CARS: 1000,
  AVERAGE_PRICE_PER_MODEL: 500,
  MAKE_PERCENTAGE: 500,
  MODEL_PERCENTAGE: 500,
} as const;

export const BULK_SETTINGS = {
  // Max items accepted in a single HTTP request to /cars/bulk
  MAX_REQUEST_ITEMS: 5000,
  // Number of items per background DB insert batch
  BATCH_SIZE: 1000,
  // Number of items to group into a single queue job when chunking a large request
  JOB_CHUNK_SIZE: 1000,
} as const;
