import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../db/prisma/prisma.service';
import { mockDeep } from 'jest-mock-extended';
import { RequestLogService } from '../log/log.service';

describe('UserService', () => {
  let service: UserService;
  const prismaService = mockDeep<PrismaService>();
  const mockedRequestLogService = mockDeep<RequestLogService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: RequestLogService,
          useValue: mockedRequestLogService,
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
        {
          id: '1234',
          name: 'andu',
          email: 'mail@mail.com',
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ]);
      service.users({ skip: 10 });
      expect(prismaService.user.findMany).toHaveBeenCalledWith({ skip: 10 });
    });
  });
});
