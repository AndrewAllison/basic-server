import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '../models/public.decorator';
import { SignInInput } from '../../users/user.service';
import { CognitoService } from '../services/cognito.service';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../models/cookies.constants';
import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';

@Controller('cognito')
export class CognitoController {
  constructor(private readonly cognitoService: CognitoService) {}

  @Public()
  @Post('sign-in')
  async signIn(
    @Body() signInInput: SignInInput,
    @Req() req: any,
    @Res() res: any,
  ) {
    try {
      const { email, password } = signInInput;
      const response = await this.cognitoService.signIn(email, password);
      req.session.user = req.user;

      if (!response) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed',
        });
      }

      const { AccessToken, RefreshToken } =
        response.AuthenticationResult as AuthenticationResultType;

      // const redirectUrl = req.session.redirectUrl || '/';
      res.cookie(ACCESS_TOKEN_KEY, AccessToken, {
        secure: true,
        httpOnly: true,
      });
      res.cookie(REFRESH_TOKEN_KEY, RefreshToken, {
        secure: true,
        httpOnly: true,
      });

      return res.json({
        success: true,
        user: {},
      });
    } catch (error) {
      console.error(error);
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed',
          error: error.message,
        });
      }
      return res.status(500).json({ error });
    }
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() signInInput: SignInInput,
    @Req() req: any,
    @Res() res: any,
  ) {
    try {
      const { email, password } = signInInput;
      const response = await this.cognitoService.resetPassword(email, password);

      return res.json({
        success: true,
        user: response,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed',
          error: error.message,
        });
      }
      return res.status(500).json({ error });
    }
  }
}
