// src/modules/auth/guards/api-key-auth.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// Define the name of the header you expect the API key to be in
const API_KEY_HEADER = 'x-api-key';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  private readonly requiredApiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    // Read the secure key from the environment during Guard initialization
    this.requiredApiKey = this.configService.get<string>('INGESTION_API_KEY');
    
    console.log('Required API Key:', this.requiredApiKey); // For debugging purposes only
    if (!this.requiredApiKey) {
        // This is a safety check for development setup errors;
        throw new Error('INGESTION_API_KEY is not defined in the environment.');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // 1. Extract the API key from the request header
    const apiKey = request.headers[API_KEY_HEADER];

    // 2. Check if the header exists
    if (!apiKey) {
      throw new UnauthorizedException('API Key is missing.');
    }

    if (apiKey === this.requiredApiKey) {
      // Access granted
      return true;
    }

    // Access denied
    throw new UnauthorizedException('Invalid API Key provided.');
  }
}