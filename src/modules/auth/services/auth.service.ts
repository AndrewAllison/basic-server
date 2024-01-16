import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Account, User } from '@prisma/client';
import * as crypto from 'crypto';

import { PasswordService } from './password.service';
import { SignInInput, UserService } from '../../users/user.service';
import { PrismaService } from '../../db/prisma/prisma.service';
import { IdService } from './id.service';
import { SignUpInput } from '../../users/models/sign-up.input';
import { UserWithAccounts } from '../../users/models/user-with-posts.model';
import { EmailService } from '../../communications/email.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly prisma: PrismaService,
    private readonly idService: IdService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  generateToken() {
    const verifyToken = crypto.randomBytes(20).toString('hex');
    const verifyTokenHash = crypto
      .createHash('sha256')
      .update(verifyToken)
      .digest('hex');

    return { verifyToken, verifyTokenHash };
  }

  generateExpiryDate(hours = 1) {
    const verifyTokenExpires = new Date();
    verifyTokenExpires.setHours(verifyTokenExpires.getHours() + hours);
    return verifyTokenExpires;
  }

  async register(registerUserInput: SignUpInput) {
    try {
      const { password, name, email } = registerUserInput;
      const userId = this.idService.createdId();

      const { salt, hash } = await this.passwordService.encrypt(password);

      const verifyTokenExpires = this.generateExpiryDate();
      const { verifyToken, verifyTokenHash } = this.generateToken();

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
          verifyToken: verifyTokenHash,
          verifyTokenExpires,
        },
      });

      await this.emailService.sendVerificationEmail(user.email, verifyToken);

      return {
        result: 'success',
        payload: user,
      };
    } catch (error) {
      throw new UnauthorizedException('Registration failed.');
    }
  }

  async signIn(
    signInInput: SignInInput,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

      const { accessToken } = await this.tokenService.generateAccessToken({
        sub: existingUser.id,
        ...existingUser,
      });
      const { refreshToken } = await this.tokenService.generateRefreshToken({
        sub: existingUser.id,
        ...existingUser,
      });

      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    }

    throw new UnauthorizedException('Could not Authorize user.');
  }

  async verifyEmail(verifyToken: string) {
    const verifyTokenHash = crypto
      .createHash('sha256')
      .update(verifyToken)
      .digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        verifyToken: verifyTokenHash,
        verifyTokenExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verified: true,
        verifyToken: null,
        verifyTokenExpires: null,
      },
    });

    return {
      result: 'success',
      message: 'Email verified successfully.',
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const isTokenValid = await this.tokenService.validateRefreshToken(
      userId,
      refreshToken,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const existingUser = (await this.userService.findUserById(
      userId,
    )) as UserWithAccounts;

    const { accessToken } = await this.tokenService.generateAccessToken({
      sub: existingUser.id,
      ...existingUser,
    });
    const { refreshToken: newRefreshToken } =
      await this.tokenService.generateRefreshToken({
        sub: existingUser.id,
        ...existingUser,
      });

    return {
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async invalidateRefreshToken(userId: string) {
    await this.tokenService.invalidateRefreshToken(userId);
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

  async resendVerifyEmail(id: string) {
    const existingUser = await this.userService.findUserById(id);

    if (!existingUser) {
      throw new UnauthorizedException();
    }

    const verifyTokenExpires = this.generateExpiryDate();
    const { verifyToken, verifyTokenHash } = this.generateToken();

    const user = await this.prisma.user.update({
      data: {
        verified: false,
        verifyToken: verifyTokenHash,
        verifyTokenExpires,
      },
      where: {
        id,
      },
    });

    await this.emailService.sendVerificationEmail(user.email, verifyToken);

    return {
      success: true,
      message: 'Success',
    };
  }

  async forgotPassword(email: any) {
    const verifyTokenExpires = this.generateExpiryDate();
    const { verifyToken, verifyTokenHash } = this.generateToken();

    const existingUser = await this.userService.findUserByEmail(email);

    if (!existingUser) {
      console.log('User does not exist');
      return null;
    }

    // We will clear all other resets just incase.
    await this.prisma.passwordReset.deleteMany({
      where: {
        userId: existingUser.id,
      },
    });

    await this.prisma.passwordReset.create({
      data: {
        token: verifyTokenHash,
        userId: existingUser.id,
        expiresAt: verifyTokenExpires,
      },
    });

    await this.emailService.sendPasswordResetEmail(email, verifyToken);
  }

  async resetPassword(token: any, newPassword: any) {
    const verifyTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const tokenRecod = await this.prisma.passwordReset.findFirst({
      where: {
        token: verifyTokenHash,
      },
    });

    if (!tokenRecod) throw new UnauthorizedException('Not a valid token.');

    const { salt, hash } = await this.passwordService.encrypt(newPassword);

    await this.prisma.account.update({
      data: {
        token: hash,
        salt: salt.toString('hex'),
      },
      where: {
        provider_providerAccountId: {
          providerAccountId: tokenRecod.userId,
          provider: 'email-password',
        },
      },
    });
    return true;
  }
}
