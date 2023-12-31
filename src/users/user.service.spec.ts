import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../modules/db/prisma/prisma.service';
import { mockDeep } from 'jest-mock-extended';

describe('UserService', () => {
  let service: UserService;
  const prismaService = mockDeep<PrismaService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        UserService,
      ],
    }).compile();

    service = await module.resolve<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findMany', () => {
    it('should find many', () => {
      prismaService.user.findMany.mockResolvedValue([
        { id: '1234', name: 'andu', email: 'mail@mail.com' },
      ]);
      service.users({ skip: 10 });
    });
  });
});
