import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AUTH_TAG, LOGIN_OPERATION, LOGIN_RESPONSE } from '@/modules/auth/docs/auth.docs';
import { AuthService } from '@/modules/auth/auth.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';

@ApiTags(AUTH_TAG)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation(LOGIN_OPERATION)
  @ApiResponse(LOGIN_RESPONSE)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
