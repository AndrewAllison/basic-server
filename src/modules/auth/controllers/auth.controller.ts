import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SignUpInput } from '../../users/models/sign-up.input';
import { SignInInput, VerifyEmailInput } from '../../users/user.service';
import { Public } from '../models/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../models/cookies.constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('sign-up')
  async signUp(@Body() registerUserInput: SignUpInput) {
    return this.authService.register(registerUserInput);
  }

  @Public()
  @Post('sign-in')
  async signIn(@Body() signInInput: SignInInput, @Req() req, @Res() res) {
    try {
      const { accessToken, refreshToken } = await this.authService.signIn(
        signInInput,
      );
      req.session.user = req.user;
      const redirectUrl = req.session.redirectUrl || '/';
      res.cookie(ACCESS_TOKEN_KEY, accessToken, {
        secure: true,
        httpOnly: true,
      });
      res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
        secure: true,
        httpOnly: true,
      });

      return res.json({
        success: true,
        redirectUrl,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof UnauthorizedException) {
        res.status(401).json({
          success: false,
          message: 'Authentication failed',
          error: error.message,
        });
      }
      throw error;
    }
  }

  @Post('sign-out')
  async signOut(@Req() req, @Res() res) {
    const userId = req.user.id;
    await this.authService.invalidateRefreshToken(userId);

    res.clearCookie(ACCESS_TOKEN_KEY, {
      httpOnly: true,
    });
    res.clearCookie(REFRESH_TOKEN_KEY, {
      httpOnly: true,
    });

    return res.json({
      success: true,
      message: 'Token Refreshed',
    });
  }

  @Public()
  @Get('refresh-token')
  async refresh(@Req() req, @Res() res) {
    const refreshToken = req.cookies[REFRESH_TOKEN_KEY];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token available');
    }

    const decodedToken = this.jwtService.decode(refreshToken);

    if (!decodedToken || !decodedToken.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.validateRefreshToken(
        decodedToken.sub,
        refreshToken,
      );

    res.cookie(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
    });
    res.cookie(REFRESH_TOKEN_KEY, newRefreshToken, {
      httpOnly: true,
    });

    return res.json({
      success: true,
      message: 'Token Refreshed',
    });
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailInput: VerifyEmailInput) {
    try {
      return this.authService.verifyEmail(verifyEmailInput.token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return { message: 'Authentication failed', error: error.message };
      }
      throw error;
    }
  }

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async loginGithub() {}

  @Public()
  @Get('callback/github')
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@Req() req, @Res() res) {
    req.session.user = req.user;
    const redirectUrl =
      req.session.redirectUrl && 'https://localhost:3000/dashboard';
    req.session.redirectUrl = null;
    res.cookie(ACCESS_TOKEN_KEY, req.user.accessToken, { httpOnly: true });
    res.cookie(REFRESH_TOKEN_KEY, req.user.accessToken, { httpOnly: true });

    return res.redirect(redirectUrl);
  }
}
