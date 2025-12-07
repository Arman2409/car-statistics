import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import {
  SWAGGER_SETTINGS,
  GLOBAL_VALIDATION_SETTINGS,
  SwaggerSetupDetails,
  DEFAULT_PORT,
} from '@/shared/constants/settings';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe(GLOBAL_VALIDATION_SETTINGS));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(SwaggerSetupDetails.TITLE)
    .setDescription(SwaggerSetupDetails.DESCRIPTION)
    .setVersion(SwaggerSetupDetails.VERSION)
    .addBearerAuth(SWAGGER_SETTINGS, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || DEFAULT_PORT;

  await app.listen(port);

  const logger = new Logger('Bootstrap');

  logger.log(
    `Application is running on: ${process.env.NODE_ENV === 'development' ? `${process.env.DEV_HOSTNAME}:` : 'Port '}${port}`,
  );
  logger.log(
    `Swagger documentation: ${process.env.NODE_ENV === 'development' ? `${process.env.DEV_HOSTNAME}:${port}` : 'By endpoint '}/api/docs`,
  );
}

bootstrap();
