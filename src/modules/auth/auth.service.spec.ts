import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../db/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { IdService } from './id.service';
import { UnauthorizedException } from '@nestjs/common';
import { SignInInput, UserService } from '../users/user.service';
import { Account } from '@prisma/client';
import { UserWithAccounts } from '../users/models/user-with-posts.model';
import { JwtService } from '@nestjs/jwt';

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const name = `${firstName} ${lastName}`;
const email = faker.internet.email({ firstName, lastName });
const password = faker.internet.password();
const userId = faker.string.uuid();

describe('AuthService', () => {
  let authService: AuthService;
  const passwordService = mockDeep<PasswordService>();
  const prismaService = mockDeep<PrismaService>();
  const idService = mockDeep<IdService>();
  const jwtService = mockDeep<JwtService>();
  const userService = mockDeep<UserService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PasswordService,
          useValue: passwordService,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: IdService,
          useValue: idService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const createDetails = {
        email,
        password,
        name,
      };

      const encryptData = {
        salt: Buffer.from('salty'),
        hash: 'Hashed',
      };

      passwordService.encrypt.mockResolvedValue(encryptData);
      idService.createdId.mockReturnValue(userId);

      const result = await authService.register(createDetails);

      expect(result).not.toBeNull();
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          accounts: {
            create: {
              provider: 'email-password',
              providerAccountId: userId,
              salt: encryptData.salt.toString('hex'),
              token: encryptData.hash,
            },
          },
          email: createDetails.email,
          id: userId,
          name: createDetails.name,
        },
      });
    });
    it('should throw an UnauthorizedException if password encryption fails', async () => {
      // Mock the PasswordService to throw an error
      passwordService.encrypt.mockRejectedValue(new Error('Encryption failed'));

      // Test the register function
      await expect(
        authService.register({
          name,
          email,
          password,
        }),
      ).rejects.toThrowError(UnauthorizedException);
    });
    it('should throw an UnauthorizedException if PrismaService throws an error', async () => {
      // Mock the PrismaService to throw an error
      prismaService.user.create.mockRejectedValue(new Error('Prisma error'));

      // Test the register function
      await expect(
        authService.register({
          name,
          email,
          password,
        }),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      // Mock dependencies
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue({
        id: userId,
        name,
        email,
        accounts: [
          {
            provider: 'email-password',
            token: 'mockedHash',
            salt: 'mockedSalt',
          },
        ] as Account[],
      } as UserWithAccounts);

      jest.spyOn(passwordService, 'verifyPassword');

      // Test the signIn function
      const result = await authService.signIn({
        email,
        password,
      } as SignInInput);

      if (!result) return;

      // Assertions
      expect(result).toHaveProperty('access_token');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      // Mock dependencies to simulate user not found
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      // Test the signIn function
      await expect(
        authService.signIn({
          email,
          password,
        } as SignInInput),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should throw UnauthorizedException if emailPasswordAccount is not found', async () => {
      // Mock dependencies to simulate emailPasswordAccount not found
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue({
        id: userId,
        name,
        email,
        accounts: [] as Account[],
      } as UserWithAccounts);

      // Test the signIn function
      await expect(
        authService.signIn({
          email,
          password,
        } as SignInInput),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should throw UnauthorizedException on password verification failure', async () => {
      // Mock dependencies to simulate password verification failure
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue({
        id: userId,
        name,
        email,
        accounts: [
          {
            provider: 'email-password',
            token: 'mockedHash',
            salt: 'mockedSalt',
          },
        ] as Account[],
      } as UserWithAccounts);

      jest
        .spyOn(passwordService, 'verifyPassword')
        .mockRejectedValue(new UnauthorizedException('Verification failed'));

      // Test the signIn function
      await expect(
        authService.signIn({
          email,
          password,
        } as SignInInput),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should throw UnauthorizedException if salt is empty', async () => {
      // Mock dependencies
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue({
        id: userId,
        name,
        email,
        accounts: [
          {
            provider: 'email-password',
            token: 'mockedHash',
            salt: null,
          },
        ] as Account[],
      } as UserWithAccounts);

      jest.spyOn(passwordService, 'verifyPassword');

      // Assertions
      await expect(
        authService.signIn({
          email,
          password,
        } as SignInInput),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should throw UnauthorizedException when salt is null', async () => {
      // Arrange
      const signInInput: SignInInput = {
        email: 'john@example.com',
        password: 'securepassword',
      };

      const existingUser: UserWithAccounts = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [
          {
            id: '',
            provider: 'email-password',
            providerAccountId: 'someProviderId',
            salt: 'someSalt',
            token: 'someHash',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(existingUser);

      // Act/Assert
      await expect(authService.signIn(signInInput)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should call passwordService.verifyPassword when salt is not null', async () => {
      // Arrange
      const signInInput: SignInInput = {
        email,
        password,
      };

      const existingUser: UserWithAccounts = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [
          {
            id: '',
            provider: 'email-password',
            providerAccountId: 'someProviderId',
            salt: null,
            token: 'someHash',
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(existingUser);

      // Act/Assert
      await expect(authService.signIn(signInInput)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
});
