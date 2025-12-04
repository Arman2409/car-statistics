import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { UsersService } from '@/modules/users/users.service';
import type { TestingModule } from '@nestjs/testing';
import type { LoginDto } from '@/modules/auth/dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    validateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };
      const mockUser = { id: 1, username: 'testuser', password: 'hashed' };
      const mockToken = 'mock-jwt-token';

      mockUsersService.validateUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: mockToken });
      expect(mockUsersService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockUsersService.validateUser.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
