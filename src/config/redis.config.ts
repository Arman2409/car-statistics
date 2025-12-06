import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  // Keep the env var name in the object for discoverability and defaults
  redis_host: process.env.REDIS_HOST || 'localhost',
  redis_port: process.env.REDIS_PORT || '6379',
}));
