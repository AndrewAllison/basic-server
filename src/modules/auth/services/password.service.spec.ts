import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { UnauthorizedException } from '@nestjs/common';
import * as argon from 'argon2';

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(passwordService).toBeDefined();
  });

  describe('encrypt', () => {
    it('should encrypt a password and return salt and hash', async () => {
      const password = 'password123';
      const result = await passwordService.encrypt(password);

      expect(result).toHaveProperty('salt');
      expect(result).toHaveProperty('hash');
    });
  });

  describe('verifyPassword', () => {
    it('should throw UnauthorizedException for invalid password', async () => {
      const token = await argon.hash('$invalidToken');
      const password = 'password123';
      const salt = 'validSalt';

      await expect(
        passwordService.verifyPassword(token, password, salt),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should not throw error for valid password', async () => {
      const token = await passwordService.encrypt('password123');
      const password = 'password123';
      const salt = token.salt.toString('hex');

      await expect(
        passwordService.verifyPassword(token.hash, password, salt),
      ).resolves.not.toThrowError();
    });
  });
});
