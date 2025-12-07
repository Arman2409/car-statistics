import { 
  Injectable, 
  OnModuleInit, 
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '@/modules/redis/redis.service';
import { CacheKeys } from '@/modules/cars/constants/cache';
import { FALLBACK_MAKES, FALLBACK_MODELS, PREDEFINED_CAR_MAKES, PREDEFINED_CAR_MODELS } from '@/modules/cars/constants/car-data';
import { ConfigService } from '@nestjs/config';
import type { MakeAndModelData } from '@/modules/cars/types/MakeAndModelData';

@Injectable()
export class MakeAndModelSeederService implements OnModuleInit {
  private readonly logger = new Logger(MakeAndModelSeederService.name);
  private readonly apiaryApiUrl: string | undefined;

  constructor(
     private readonly redisService: RedisService,
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
  ) {
    this.apiaryApiUrl = this.configService.get<string>('external.external_apiary_url');
  }

  async onModuleInit(): Promise<void> {
    await this.seedMakesAndModelsIfEmpty();
  }

  public async seedMakesAndModelsIfEmpty(): Promise<void> {
    // 1. Idempotency Check: Don't fetch if already in Redis
    const cachedMakes = await this.redisService.getClient().get(CacheKeys.MAKES);
    const cachedModels = await this.redisService.getClient().get(CacheKeys.MODELS);

    if (cachedMakes && cachedModels) {
      this.logger.log(`Car makes already cached.`);
      return;
    }

    this.logger.warn('Redis cache miss for car makes. Starting API fetch...');

    let makesToCache: string[] = [];
    let modelToCache: string[] = [];

    const useFallbackData = () => {
      makesToCache = [...FALLBACK_MAKES, ...PREDEFINED_CAR_MAKES];
      modelToCache = [...FALLBACK_MODELS, ...PREDEFINED_CAR_MODELS];
    }

     if(this.apiaryApiUrl === undefined) {
        this.logger.warn("Received wrong data from API for makes and models validation");
        useFallbackData();
        return;
      }

    try {
      // 2. Fetch data from the external API
      // Use firstValueFrom to handle the Observable returned by HttpService
     
      const response = await firstValueFrom(
        this.httpService.get<MakeAndModelData[]>(this.apiaryApiUrl) 
      );

      if(!response.data?.length) {
        this.logger.warn("Received wrong data from API for makes and models validation");
        useFallbackData();
        return;
      };

      // Map the response data to an array of strings and normalize (important!)
       response.data
        .forEach(item => {
          makesToCache.push(item.make.toLowerCase());
          modelToCache.push(item.model.toLowerCase());
        });

      const uniqueMakes = new Set(makesToCache.map(make => make.toLowerCase()));
      makesToCache = Array.from(uniqueMakes).concat(PREDEFINED_CAR_MAKES);

      const uniqueModels = new Set(modelToCache.map(model => model.toLowerCase()));
      modelToCache = Array.from(uniqueModels).concat(PREDEFINED_CAR_MODELS);

      this.logger.log(`Successfully fetched car makes and models from external API.`);

    } catch (error) {
      this.logger.error(`Failed to fetch car makes from API: ${error.message}.`);
      
      // Use hardcoded list on failure
      useFallbackData();
      this.logger.warn(`Using ${makesToCache.length} hardcoded fallback car makes .`);
    }

    // The caching step that makes the app self-sufficient after the first run
    await this.redisService.getClient().set(CacheKeys.MAKES, JSON.stringify(makesToCache), 'EX', 86400);
    await this.redisService.getClient().set(CacheKeys.MODELS, JSON.stringify(modelToCache), 'EX', 86400);

    this.logger.log(`Car makes and models list successfully stored in Redis.`);
  }
}



