import { ACCESS_TOKEN_KEY } from '../models/cookies.constants';

const jwtCookieAccessTokenExtractor = (req: any) => {
  if (req && req.cookies) {
    return req.cookies[ACCESS_TOKEN_KEY];
  }
  return null;
};

const jwtCookieRefreshTokenExtractor = (req: any) => {
  if (req && req.cookies) {
    return req.cookies[ACCESS_TOKEN_KEY];
  }
  return null;
};

export { jwtCookieAccessTokenExtractor, jwtCookieRefreshTokenExtractor };
