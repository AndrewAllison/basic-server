import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { mockDeep } from 'jest-mock-extended';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockedAuthService = mockDeep<AuthService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockedAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
