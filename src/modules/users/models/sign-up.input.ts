import { IsEmail, IsString } from 'class-validator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
export class SignUpInput {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;
}
