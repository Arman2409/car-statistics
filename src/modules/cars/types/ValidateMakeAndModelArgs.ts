import { RedisService } from "@/services/redis.service";
import { Logger } from "@nestjs/common";

export interface ValidateMakeAndModelArgs {
    redisService: RedisService;
    logger: Logger;
    make?: string;
    model?: string;
    isUpdate?: boolean;
}

export interface ValidateMakeAndModelResult {
    normalizedMake?: string;
    normalizedModel?: string;
}