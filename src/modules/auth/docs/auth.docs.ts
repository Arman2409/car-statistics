import { HttpStatus } from '@nestjs/common';

export const AUTH_TAG = 'Authentication';

export const LOGIN_OPERATION = { summary: 'Login with username and password' };

export const LOGIN_RESPONSE = {
  status: HttpStatus.OK,
  description: 'Returns JWT access token',
  schema: {
    type: 'object',
    properties: {
      access_token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  },
};

export const LOGIN_UNAUTHORIZED_RESPONSE = {
  status: HttpStatus.UNAUTHORIZED,
  description: 'Invalid credentials provided',
};
