import { ApiProperty } from '@nestjs/swagger';
import { USERNAME_API, PASSWORD_API } from '@/modules/auth/docs/login.docs';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty(USERNAME_API)
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty(PASSWORD_API)
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
