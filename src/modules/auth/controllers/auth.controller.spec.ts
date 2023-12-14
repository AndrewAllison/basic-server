import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { SignUpInput } from '../../users/models/sign-up.input';
import { SignInInput } from '../../users/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { UserWithAccounts } from '../../users/models/user-with-posts.model';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService & { signIn: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>({ signIn: jest.fn() }),
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService) as any; // Cast as any to allow mocking signIn method
  });

  describe('register', () => {
    it('should call authService.register with the provided input', async () => {
      // Arrange
      const registerUserInput: SignUpInput = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      // Act
      await authController.signUp(registerUserInput);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerUserInput);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with the provided input', async () => {
      // Arrange
      const signInInput: SignInInput = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      authService.signIn.mockResolvedValue({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      } as UserWithAccounts);

      // Act
      await authController.signIn(signInInput);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(signInInput);
    });

    it('should return the user profile on successful sign-in', async () => {
      // Arrange
      const signInInput: SignInInput = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const expectedResult = 'SomeJwtTypeToken!';

      authService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await authController.signIn(signInInput);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should catch UnauthorizedException and return a specific message on failure', async () => {
      // Arrange
      const signInInput: SignInInput = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const unauthorizedException = new UnauthorizedException(
        'Authentication failed',
      );

      authService.signIn.mockRejectedValue(unauthorizedException);

      // Act / Assert
      await expect(authController.signIn(signInInput)).rejects.toThrowError(
        unauthorizedException,
      );
    });

    it('should re-throw other exceptions', async () => {
      // Arrange
      const signInInput: SignInInput = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const unexpectedError = new Error('Unexpected error');

      authService.signIn.mockRejectedValue(unexpectedError);

      // Act/Assert
      await expect(authController.signIn(signInInput)).rejects.toThrowError(
        unexpectedError,
      );
    });
  });
});
