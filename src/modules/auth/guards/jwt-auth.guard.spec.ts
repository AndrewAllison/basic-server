import { JwtAuthGuard } from './jwt-auth.guard';
import { mockDeep } from 'jest-mock-extended';
import { Reflector } from '@nestjs/core';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new JwtAuthGuard(mockDeep<Reflector>())).toBeDefined();
  });
});
