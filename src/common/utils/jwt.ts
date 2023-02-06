import Context from 'common/types/Context';
import config from 'config';
import jwt from 'jsonwebtoken';
import { User } from 'schemas/user.schema';

const publicKey = Buffer.from(
  config.get<string>('publicKey'),
  'base64',
).toString('ascii'); // we need to decode from base64
const privateKey = Buffer.from(
  config.get<string>('privateKey'),
  'base64',
).toString('ascii'); // we need to decode from base64

export function signJwt(object: object, options?: jwt.SignOptions) {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: 'RS256',
  });
}

export function verifyJwt<T>(token: string): T | null {
  try {
    const decoded = jwt.verify(token, publicKey) as T;

    return decoded;
  } catch (err) {
    return null;
  }
}

interface ValidateAuthorizationArgs {
  context: Context;
}

// todo
export function validateAuthorization({ context }: ValidateAuthorizationArgs) {
  if (context.req.cookies.accessToken) {
    const user = verifyJwt<User>(context.req.cookies.accessToken);
    if (user) {
      context.user = user;
    } else if (context.req.cookies.refreshToken) {
      if (verifyJwt(context.req.cookies.refreshToken)) {
        const newAccessToken = signJwt(user, {});
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        };
        context.res.cookie('accessToken');
      }
    }
  }
  return context;
}
