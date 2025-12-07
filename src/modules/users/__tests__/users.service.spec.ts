import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { mockUser, createMockUsersRepository } from '@/modules/users/__mocks__/users.mocks';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashedpw'),
  compare: jest.fn(async () => true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockRepo: ReturnType<typeof createMockUsersRepository>;

  beforeEach(async () => {
    mockRepo = createMockUsersRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'UserRepository', useValue: mockRepo },
      ],
    })
      .useMocker((token) => {
        if (token === 'UserRepository') return mockRepo;
      })
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findByUsername should call repo', async () => {
    const res = await service.findByUsername('bob');
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { username: 'bob' } });
    expect(res).toEqual(mockUser);
  });

  it('validateUser should return user when password matches', async () => {
    const res = await service.validateUser('bob', 'secret');
    expect(mockRepo.findOne).toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalled();
    expect(res).toEqual(mockUser);
  });
});
