// src/cars/services/make-seeder.service.ts
import { 
  Injectable, 
  Inject,  
  OnModuleInit, 
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // Helper for NestJS HttpService
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class MakeSeederService implements OnModuleInit {
  private readonly logger = new Logger(MakeSeederService.name);
  
  // Use a constant key for your cache item
  public readonly CACHE_KEY = 'valid_car_makes'; 

  // REPLACE THIS with the actual URL for the 40 makes you found
  private readonly API_URL = "https://private-anon-a64d73744d-carsapi1.apiary-mock.com/cars";

  // Hardcoded Fallback list for guaranteed functionality if the API is down
  private readonly FALLBACK_MAKES: string[] = [
    'toyota', 'honda', 'bmw', 'ford', 'tesla', 'mercedes-benz', 'audi', 'porsche'
  ]; 

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  // Automatically called when the module initializes
  async onModuleInit(): Promise<void> {
    await this.seedMakesIfEmpty();
  }

  public async seedMakesIfEmpty(): Promise<void> {
    // 1. Idempotency Check: Don't fetch if already in Redis
    const cachedMakes = await this.cacheManager.get(this.CACHE_KEY);
    console.log("cachedMakes",cachedMakes);
    if (cachedMakes) {
      this.logger.log(`Car makes already cached.`);
      return;
    }

    this.logger.warn('Redis cache miss for car makes. Starting API fetch...');

    let makesToCache: string[] = [];

    try {
      // 2. Fetch data from the external API
      // Use firstValueFrom to handle the Observable returned by HttpService
      const response = await firstValueFrom(
        this.httpService.get<{make: string}[]>(this.API_URL) 
      );

      // Map the response data to an array of strings and normalize (important!)
      makesToCache = response.data
        .map(item => item?.make) 
        .filter(name => name?.length > 0);

      this.logger.log(`Successfully fetched ${makesToCache.length} car makes from external API.`);

    } catch (error) {
      this.logger.error(`Failed to fetch car makes from API: ${error.message}.`);
      
      // 3. FALLBACK: Use hardcoded list on failure
      makesToCache = this.FALLBACK_MAKES;
      this.logger.warn(`Using ${makesToCache.length} hardcoded fallback car makes.`);
    }

    // 4. Cache the result in Redis with a long TTL (e.g., 90 days = 7776000 seconds)
    // This is the caching step that makes your app self-sufficient after the first run
    await this.cacheManager.set(this.CACHE_KEY, makesToCache).then(res => {
      console.log("res",res);
    });
    this.logger.log(`Car makes list successfully stored in Redis.`);
  }
}



