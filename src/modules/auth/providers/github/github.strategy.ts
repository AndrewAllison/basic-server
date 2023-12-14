import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../../db/prisma/prisma.service';
import { lastValueFrom, map } from 'rxjs';
import { UserWithAccounts } from '../../../users/models/user-with-posts.model';
import { JwtService } from '@nestjs/jwt';

class UserProfile {
  id: string;
  name: string;
  email: string;

  accessToken: string;
}

const userToProfile = (user: UserWithAccounts, accessToken): UserProfile => {
  const { id, email, name } = user;
  return {
    id,
    name: name || '',
    email,
    accessToken,
  };
};

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    super({
      // TODO: Tidy this up.
      clientID: configService.get<string>('AUTH_GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('AUTH_GITHUB_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>(
        'AUTH_CALLBACK_URL',
      )}/auth/callback/github`,
      scope: ['public_profile', 'read:user', 'user:email'],
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    const { id, username, displayName, provider } = profile;

    const githubProfileUrl = 'https://api.github.com/user';
    const githubProfileResponse = await lastValueFrom(
      this.httpService
        .get(githubProfileUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'basic-server',
          },
        })
        .pipe(map((response) => response.data)),
    );

    if (!githubProfileResponse.email) {
      try {
        const emailUrl = 'https://api.github.com/user/emails';
        const emailResponse = await lastValueFrom(
          this.httpService
            .get(emailUrl, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': 'basic-server',
              },
            })
            .pipe(map((response) => response.data)),
        );

        const emails = emailResponse.find((e) => e.primary);

        // Check that a user exists already with the email
        const existingUser = await this.prismaService.user.findFirst({
          where: {
            OR: [
              {
                email: {
                  contains: emails.email,
                },
              },
              {
                accounts: {
                  every: {
                    provider,
                    providerAccountId: id,
                  },
                },
              },
            ],
          },
          include: {
            accounts: true,
          },
        });

        if (existingUser) {
          const existingGitHubLink = existingUser.accounts.find(
            (acc) => acc.provider === provider,
          );
          let accountDetails;
          if (existingGitHubLink) {
            accountDetails = {
              update: {
                data: {
                  providerAccountId: id,
                  token: accessToken,
                  refreshToken: _refreshToken,
                },
                where: {
                  id: existingGitHubLink.id,
                },
              },
            };
          } else {
            accountDetails = {
              connectOrCreate: {
                create: {
                  providerAccountId: id,
                  token: accessToken,
                  refreshToken: _refreshToken,
                  provider,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                where: {
                  id: id,
                },
              },
            };
          }
          await this.prismaService.user.update({
            data: {
              verified: true,
              verifyToken: null,
              verifyTokenExpires: null,
              accounts: {
                ...accountDetails,
              },
            },
            where: {
              id: existingUser.id,
            },
          });
          return userToProfile(
            existingUser,
            this.jwtService.sign(existingUser),
          );
        }

        const newUser = await this.prismaService.account.create({
          data: {
            providerAccountId: id,
            token: accessToken,
            refreshToken: _refreshToken,
            provider,
            user: {
              create: {
                email: emails ? emails.email : null,
                name: displayName ?? username,
              },
            },
          },
          include: {
            user: {
              include: {
                accounts: true,
              },
            },
          },
        });

        return userToProfile(newUser.user, this.jwtService.sign(newUser.user));
      } catch (e) {
        console.log(e);
        throw new UnauthorizedException(
          '[GitHub Error]: User Authentication failed.',
        );
      }
    }
  }
}
