import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { AwsConfig } from '../../config/models/aws.config';

@Injectable()
export class CognitoJwtStrategy {
  private jwksClient: jwksRsa.JwksClient;

  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.get<AwsConfig>('aws');
    if (!awsConfig) {
      throw new Error('AwsConfig Failed to load.');
    }
    const { region, cognitoUserPoolId } = awsConfig;

    this.jwksClient = jwksRsa({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${cognitoUserPoolId}/.well-known/jwks.json`,
    });
  }

  async validateToken(token: string): Promise<any> {
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken || typeof decodedToken === 'string') {
      throw new Error('Token is not valid');
    }

    const key = await this.jwksClient.getSigningKey(decodedToken.header.kid);
    const signingKey = key.getPublicKey();

    try {
      return jwt.verify(token, signingKey);
    } catch (error) {
      throw new Error('Token is not valid');
    }
  }
}
