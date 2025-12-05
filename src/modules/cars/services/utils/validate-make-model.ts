import { RedisService } from "@/services/redis.service";
import { BadRequestException, Logger } from "@nestjs/common";
import { MAKES_CACHE_KEY, MODELS_CACHE_KEY } from "../make-seeder.service";


export const validateMakeAndModel = async (
    redisService: RedisService,
    logger: Logger,
    make?: string | undefined, 
    model?: string, 
    isUpdate = false): Promise<{ normalizedMake?: string; normalizedModel?: string }> => {
    if (!isUpdate && (!make || !model)) throw new BadRequestException('Make and model are required');

    // TODO(optional) : ENum for Redis KEYS
    const cachedMakes = await redisService.getClient().get(MAKES_CACHE_KEY);
    const cachedModels = await redisService.getClient().get(MODELS_CACHE_KEY);

    if(!cachedMakes || !cachedModels) {
      logger.warn('Car makes/models not found in cache.');
    }

    if (make && !cachedMakes?.includes(make.toLowerCase())) {
      console.log("here");
      throw new BadRequestException(`Invalid car make: ${make}`);
    }

    if(model && !cachedModels?.includes(model.toLowerCase())) {
      throw new BadRequestException(`Invalid car model: ${model}`);
    }

    return { 
      ...(make ? { normalizedMake: normalizeString(make) } : undefined),
      ...(model ? { normalizedModel: normalizeString(model) } : undefined)
     };
  }

function normalizeString(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}