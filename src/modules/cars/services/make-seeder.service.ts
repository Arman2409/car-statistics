// src/cars/services/make-seeder.service.ts
import { 
  Injectable, 
  Inject,  
  OnModuleInit, 
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // Helper for NestJS HttpService
import { RedisService } from '@/modules/redis/redis.service';

export const MAKES_CACHE_KEY = 'valid_car_makes';
export const MODELS_CACHE_KEY = 'valid_car_models';

@Injectable()
export class MakeSeederService implements OnModuleInit {
  private readonly logger = new Logger(MakeSeederService.name);

  // REPLACE THIS with the actual URL for the 40 makes you found
  private readonly API_URL = "https://private-anon-a64d73744d-carsapi1.apiary-mock.com/cars";

  // Hardcoded Fallback list for guaranteed functionality if the API is down
  private readonly FALLBACK_MAKES: string[] = [
    'toyota', 'honda', 'bmw', 'ford', 'tesla', 'mercedes-benz', 'audi', 'porsche'
  ]; 

  private readonly FALLBACK_MODELS: string[] = [
    'corolla', 'civic', '3 series', 'mustang', 'model s', 'c-class', 'a4', '911'
  ];

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
    const cachedMakes = await this.redisService.getClient().get(MAKES_CACHE_KEY);
    console.log("cachedMakes",cachedMakes);
    if (cachedMakes) {
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
        this.httpService.get<{make: string, model: string}[]>(this.API_URL) 
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
      makesToCache = this.FALLBACK_MAKES;
      modelToCache = this.FALLBACK_MODELS;
      this.logger.warn(`Using ${makesToCache.length} hardcoded fallback car makes .`);
    }

    // 4. Cache the result in Redis with a long TTL (e.g., 90 days = 7776000 seconds)
    // This is the caching step that makes your app self-sufficient after the first run
    await this.redisService.getClient().set(MAKES_CACHE_KEY, JSON.stringify(makesToCache));
    await this.redisService.getClient().set(MODELS_CACHE_KEY, JSON.stringify(modelToCache));
    this.logger.log(`Car makes and models list successfully stored in Redis.`);
  }
}



