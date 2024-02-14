import {
  Controller,
  Get,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../../users/user.service';

@Controller('auth')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    const { email } = req.user;
    const existingUser = await this.userService.findUserByEmail(email);
    if (!existingUser) throw new UnauthorizedException();
    return {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      verified: existingUser.verified,
    };
  }
}
