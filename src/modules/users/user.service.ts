import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { RequestLogService } from '../log/log.service';
import { IsEmail, IsString } from 'class-validator';

export class VerifyEmailInput {
  @IsString()
  token: string;
}

export class SignInInput {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: RequestLogService,
  ) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    this.logger.info({ skip, take, where }, 'User Request');
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
}
