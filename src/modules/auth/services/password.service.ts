import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as argon from 'argon2';
import { argon2id } from 'argon2';

@Injectable()
export class PasswordService {
  async encrypt(password: string) {
    const salt = randomBytes(16);
    const encPassword = await argon.hash(password, {
      type: argon2id,
      timeCost: 2,
      salt,
    });
    return {
      salt,
      hash: encPassword,
    };
  }

  async verifyPassword(
    token: string,
    password: string,
    salt: string,
  ): Promise<void> {
    const saltBuffer = Buffer.from(salt, 'hex');
    const verifyPassword = await argon.verify(token, password, {
      type: argon2id,
      timeCost: 2,
      salt: saltBuffer,
    });

    if (!verifyPassword) {
      throw new UnauthorizedException('Invalid username or password.');
    }
  }
}
