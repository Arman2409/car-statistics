import { 
  Injectable, 
  OnModuleInit, 
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '@/services/redis.service';
import { ValidationCacheKeys } from '@/modules/cars/constants/ValidationCacheKeys';
import { FALLBACK_MAKES, FALLBACK_MODELS } from '../constants/fallback-data';
import { APIARY_API_URL } from '@/modules/cars/constants/api';
// TODO: Maybe this URL above should no be publicly available?

@Injectable()
export class MakeSeederService implements OnModuleInit {
  private readonly logger = new Logger(MakeSeederService.name);

  constructor(
     private readonly redisService: RedisService,
      private readonly httpService: HttpService,
  ) {}

  // Automatically called when the module initializes
  async onModuleInit(): Promise<void> {
    await this.seedMakesIfEmpty();
  }

  public async seedMakesIfEmpty(): Promise<void> {
    // 1. Idempotency Check: Don't fetch if already in Redis
    const cachedMakes = await this.redisService.getClient().get(ValidationCacheKeys.MAKES);
    const cachedModels = await this.redisService.getClient().get(ValidationCacheKeys.MODELS);

    if (cachedMakes && cachedModels) {
      this.logger.log(`Car makes already cached.`);
      return;
    }

    this.logger.warn('Redis cache miss for car makes. Starting API fetch...');

    let makesToCache: string[] = [];
    let modelToCache: string[] = [];

    try {
      // 2. Fetch data from the external API
      // Use firstValueFrom to handle the Observable returned by HttpService
      const response = await firstValueFrom(
        this.httpService.get<{make: string, model: string}[]>(APIARY_API_URL) 
      );

      // TODO: Check the response and the importance of firstValueFrom
      
      // Map the response data to an array of strings and normalize (important!)
       response.data
        .forEach(item => {
          makesToCache.push(item.make.toLowerCase());
          modelToCache.push(item.model.toLowerCase());
        });

      const uniqueMakes = new Set(makesToCache.map(make => make.toLowerCase()));
      makesToCache = Array.from(uniqueMakes);

      const uniqueModels = new Set(modelToCache.map(model => model.toLowerCase()));
      modelToCache = Array.from(uniqueModels);

      this.logger.log(`Successfully fetched car makes and models from external API.`);

    } catch (error) {
      this.logger.error(`Failed to fetch car makes from API: ${error.message}.`);
      
      // 3. FALLBACK: Use hardcoded list on failure
      makesToCache = FALLBACK_MAKES;
      modelToCache = FALLBACK_MODELS;
      this.logger.warn(`Using ${makesToCache.length} hardcoded fallback car makes .`);
    }

    // 4. Cache the result in Redis with a long TTL (e.g., 90 days = 7776000 seconds)
    // This is the caching step that makes your app self-sufficient after the first run
    await this.redisService.getClient().set(ValidationCacheKeys.MAKES, JSON.stringify(makesToCache));
    await this.redisService.getClient().set(ValidationCacheKeys.MODELS, JSON.stringify(modelToCache));
    this.logger.log(`Car makes and models list successfully stored in Redis.`);
  }
}



