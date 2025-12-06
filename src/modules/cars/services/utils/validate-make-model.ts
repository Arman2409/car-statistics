import { BadRequestException } from "@nestjs/common";
import { ValidationCacheKeys } from "@/modules/cars/constants/ValidationCacheKeys";
import type { ValidateMakeAndModelArgs, ValidateMakeAndModelResult } from "@/modules/cars/types/ValidateMakeAndModelArgs";

// Validates the provided make and model against cached values.
export const validateMakeAndModel = async (
  {
    redisService,
    logger,
    make,
    model,
    isUpdate = false,
  }: ValidateMakeAndModelArgs): Promise<ValidateMakeAndModelResult> => {
  if (!isUpdate && (!make || !model)) throw new BadRequestException('Make and model are required');

  const cachedMakes = await redisService.getClient().get(ValidationCacheKeys.MAKES);
  const cachedModels = await redisService.getClient().get(ValidationCacheKeys.MODELS);

  if (!cachedMakes || !cachedModels) {
    logger.warn('Car makes/models not found in cache.');
  }

  if (make && !cachedMakes?.includes(make.toLowerCase())) {
    console.log("here");
    throw new BadRequestException(`Invalid car make: ${make}`);
  }

  if (model && !cachedModels?.includes(model.toLowerCase())) {
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