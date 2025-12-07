import type { User } from '@/modules/users/entities/user.entity';

export const mockUser: User = {
  id: 1,
  username: 'bob',
  password: 'hashedpw',
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

export const createMockUsersRepository = () => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockImplementation((u) => u),
  save: jest.fn().mockResolvedValue(mockUser),
});

export const createMockUsersService = () => ({
  findByUsername: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
  validateUser: jest.fn().mockResolvedValue(mockUser),
});
