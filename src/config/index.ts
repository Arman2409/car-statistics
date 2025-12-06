import databaseConfig from '@/config/database.config';
import externalConfig from '@/config/external.config';
import jwtConfig from '@/config/jwt.config';
import redisConfig from '@/config/redis.config';

const configs = [databaseConfig, externalConfig, jwtConfig, redisConfig];

export default configs;
