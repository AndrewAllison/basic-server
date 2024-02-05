import { Injectable } from '@nestjs/common';
import {
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AdminInitiateAuthCommandOutput,
  AttributeType,
  CognitoIdentityProviderClient,
  GetUserCommand,
  SignUpCommand,
  SignUpCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';
import { AwsConfig } from '../../config/models/aws.config';

const mapAttributesToObject = (attributes: AttributeType[] | undefined) => {
  if (!attributes) {
    return null;
  }
  const userObject = {};
  attributes.forEach((attr: any) => {
    userObject[attr.Name] = attr.Value;
  });
  return userObject;
};

@Injectable()
export class CognitoService {
  private cognitoClient: CognitoIdentityProviderClient;
  private config: AwsConfig;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<AwsConfig>('aws');
    if (!config) throw new Error('AWS Configuration Failed');
    this.config = config;

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: config.region,
    });
  }

  async signUp(
    username: string,
    password: string,
    email: string,
  ): Promise<void> {
    const signUpParams: SignUpCommandInput = {
      ClientId: this.config.cognitoClientId, // replace with your Cognito App client ID
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    };

    const command = new SignUpCommand(signUpParams);

    try {
      const response = await this.cognitoClient.send(command);
      console.log('SignUp successful', response);
    } catch (error) {
      console.error('Error in SignUp', error);
      throw error;
    }
  }

  async signIn(
    username: string,
    password: string,
  ): Promise<AdminInitiateAuthCommandOutput | null> {
    const signInParams: AdminInitiateAuthCommandInput = {
      UserPoolId: this.config.cognitoUserPoolId,
      ClientId: this.config.cognitoClientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    const command = new AdminInitiateAuthCommand(signInParams);
    try {
      const response = await this.cognitoClient.send(command);

      const userCommand = new GetUserCommand({
        AccessToken: response.AuthenticationResult?.AccessToken,
      });

      const user = await this.cognitoClient.send(userCommand);

      console.log('SignIn successful', {
        username: user.Username,
        ...mapAttributesToObject(user.UserAttributes),
      });
      return response;
    } catch (error) {
      console.error('Error in SignIn', error);
      return null;
    }
  }
}
