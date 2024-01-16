import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from '../config/models/email.config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly config: EmailConfig | undefined;

  constructor(configService: ConfigService) {
    this.config = configService.get<EmailConfig>('email');
    if (!this.config) throw new Error('Email configuration is not complete!');
    sgMail.setApiKey(this.config.password);
    this.transporter = nodemailer.createTransport({
      host: this.config?.host,
      port: this.config?.port,
      secure: false,
      auth: {
        user: this.config?.user,
        pass: this.config?.password,
      },
    });
  }

  async sendVerificationEmail(to: string, verifyToken: string): Promise<void> {
    try {
      const results = await sgMail.send({
        from: {
          email: this.config?.fromAddress || '',
          name: 'Simple-Server Mail',
        },
        to,
        subject: 'Email Verification',
        html: `
        <p>Thank you for registering!</p>
        <p>Please click the following link to verify your email:</p>
        <a href="https://localhost:3000/auth/verify-email?token=${verifyToken}">Verify Email</a>
      `,
      });
      console.log(results);
    } catch (e) {
      console.error(e);
    }
  }
  async sendPasswordResetEmail(to: string, verifyToken: string): Promise<void> {
    try {
      await sgMail.send({
        from: {
          email: this.config?.fromAddress || '',
          name: 'Simple-Server Mail',
        },
        to,
        subject: 'Password Reset',
        html: `
        <p>Thank you for registering!</p>
        <p>Please click below to reset your password:</p>
        <a href="https://localhost:3000/auth/reset-password?token=${verifyToken}">Reset Password</a>
      `,
      });
    } catch (e) {
      console.error(e);
    }
  }
}
