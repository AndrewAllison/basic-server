export interface JwtConfig {
  secret: string;
  expiresIn: string;
  issuer: string;
  audience: string;
}
