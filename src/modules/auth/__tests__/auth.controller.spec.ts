import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { createMockAuthService } from '@/modules/auth/__mocks__/auth.mocks';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login() should return an access token', async () => {

    const dto = { username: 'alice', password: 'secret' };

    const res = await controller.login(dto);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(res).toHaveProperty('access_token', 'token-for-alice');
  });
});
