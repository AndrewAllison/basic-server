import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../modules/db/prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('')
  async getUsers() {
    return this.prisma.user.findMany();
  }
}
