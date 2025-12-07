import { registerAs } from '@nestjs/config';

export default registerAs('external', () => ({
  external_apiary_url: process.env.EXTERNAL_APIARY_URL || 'https://private-anon-a64d73744d-carsapi1.apiary-mock.com/cars',
  ingestion_api_key: process.env.INGESTION_API_KEY || 'default-ingestion-api-key',
}));
