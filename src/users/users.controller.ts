import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../modules/db/prisma/prisma.service';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiTags } from '@nestjs/swagger';

export class RegisterUser {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  name: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('')
  async getUsers() {
    return this.prisma.user.findMany();
  }

  @Post('register')
  async registerUser(@Body() registerUser: RegisterUser) {
    return registerUser;
  }
}
