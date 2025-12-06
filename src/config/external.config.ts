import { registerAs } from '@nestjs/config';

export default registerAs('external', () => ({
  // Keep the env var name in the object for discoverability and defaults
  EXTERNAL_APIARY_URL: process.env.EXTERNAL_APIARY_URL || 'https://private-anon-a64d73744d-carsapi1.apiary-mock.com/cars',
  INGESTION_API_KEY: process.env.INGESTION_API_KEY || 'default-ingestion-api-key',
}));
