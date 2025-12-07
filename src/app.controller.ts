import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { APP_SWAGGER } from '@/shared/docs/app.swagger';

@Controller()
@ApiTags(APP_SWAGGER.TAG)
export class AppController {
  @Get()
  @ApiOperation({ summary: APP_SWAGGER.ROOT.summary })
  @ApiOkResponse(APP_SWAGGER.ROOT.okResponse)
  getHello(): string {
    return 'Server Running!';
  }

  @Get('health')
  @ApiOperation({ summary: APP_SWAGGER.HEALTH.summary })
  @ApiOkResponse(APP_SWAGGER.HEALTH.okResponse)
  healthCheck(): string {
    return 'OK';
  }
}
