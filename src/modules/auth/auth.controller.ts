import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserInput } from '../users/models/register-user.input';
import { SignInInput } from '../users/user.service';
import { Public } from './models/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerUserInput: RegisterUserInput) {
    return this.authService.register(registerUserInput);
  }

  @Public()
  @Post('sign-in')
  async signIn(@Body() signInInput: SignInInput) {
    try {
      return this.authService.signIn(signInInput);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return { message: 'Authentication failed', error: error.message };
      }
      throw error;
    }
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
