import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '../config/config.module';
import { PasswordService } from './services/password.service';
import { IdService } from './services/id.service';
import { PrismaModule } from '../db/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CommunicationsModule } from '../communications/communications.module';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from '../config/models/jwt.config';
import { GithubStrategy } from './providers/github/github.strategy';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { ProfileController } from './controllers/profile.controller';
import { TokenService } from './services/token.service';
import { RedisModule } from '../db/redis/redis.module';

@Module({
  imports: [
    CommunicationsModule,
    ConfigModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtConfig>('jwt');
        if (!jwtConfig) throw new Error('Configuration error: No JWT config.');
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          },
        };
      },
    }),
    PassportModule.register({ session: true }),
    PrismaModule,
    RedisModule,
    UsersModule,
  ],
  controllers: [AuthController, ProfileController],
  providers: [
    AuthService,
    GithubStrategy,
    IdService,
    JwtStrategy,
    PasswordService,
    RedisModule,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
