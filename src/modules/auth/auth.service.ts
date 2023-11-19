import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordService } from './password.service';
import { SignInInput, UserService } from '../users/user.service';
import { PrismaService } from '../db/prisma/prisma.service';
import { IdService } from './id.service';
import { RegisterUserInput } from '../users/models/register-user.input';
import { Account, User } from '@prisma/client';
import { UserWithAccounts } from '../users/models/user-with-posts.model';
import { JwtService } from '@nestjs/jwt';
import { SignInPayload } from './models/signInPayload';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly prisma: PrismaService,
    private readonly idService: IdService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(registerUserInput: RegisterUserInput) {
    try {
      const { password, name, email } = registerUserInput;
      const userId = this.idService.createdId();
      const { salt, hash } = await this.passwordService.encrypt(password);

      const user = await this.prisma.user.create({
        data: {
          id: userId,
          name,
          email,
          accounts: {
            create: {
              providerAccountId: userId,
              token: hash,
              provider: 'email-password',
              salt: salt.toString('hex'),
            },
          },
        },
      });

      return {
        result: 'success',
        payload: user,
      };
    } catch (error) {
      throw new UnauthorizedException('Registration failed.');
    }
  }

  async signIn(signInInput: SignInInput): Promise<SignInPayload> {
    const { email, password } = signInInput;
    const existingUser = (await this.userService.findUserByEmail(
      email,
    )) as UserWithAccounts;

    this.validateUser(existingUser);

    const emailPasswordAccount = this.getEmailPasswordAccount(existingUser);
    this.validateEmailPasswordAccount(emailPasswordAccount);

    if (emailPasswordAccount.salt != null) {
      await this.passwordService.verifyPassword(
        emailPasswordAccount.token,
        password,
        emailPasswordAccount.salt,
      );
      return { access_token: this.jwtService.sign(existingUser) };
    }

    throw new UnauthorizedException('Could not Authorize user.');
  }

  validateUser(user: User | null) {
    if (!user) {
      throw new UnauthorizedException('Invalid username or password.');
    }
  }

  getEmailPasswordAccount(user: UserWithAccounts): Account {
    const emailPasswordAccounts = user.accounts.filter(
      (acc) => acc.provider === 'email-password',
    );

    if (emailPasswordAccounts.length === 0) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    return emailPasswordAccounts[0];
  }

  validateEmailPasswordAccount(account: Account) {
    if (!account.token || !account.salt) {
      throw new UnauthorizedException('Invalid username or password.');
    }
  }
}
