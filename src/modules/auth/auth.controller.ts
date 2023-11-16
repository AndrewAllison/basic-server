import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserInput } from '../users/models/register-user.input';
import { SignInInput } from '../users/user.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() registerUserInput: RegisterUserInput) {
    return this.authService.register(registerUserInput);
  }

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
}
