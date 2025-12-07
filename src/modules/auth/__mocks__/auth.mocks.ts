export const createMockAuthService = () => ({
  login: jest.fn((dto) => ({ access_token: 'token-for-' + dto.username })),
});
