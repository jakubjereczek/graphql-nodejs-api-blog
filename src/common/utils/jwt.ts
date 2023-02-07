import { ApolloError } from 'apollo-server';
import config from 'config';
import { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserModel } from 'schemas/user.schema';
import Context from 'common/types/Context';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const ACCESS_TOKEN_EXPIRES_IN = 120;
export const REFRESH_TOKEN_EXPIRES_IN = 10080;

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

export async function validateAuthorization({
  context,
}: ValidateAuthorizationArgs) {
  if (context.req.cookies.access_token) {
    const decoded = verifyJwt<User>(context.req.cookies.access_token);
    if (decoded) {
      context.user = decoded;
    }
  } else if (context.req.cookies.refresh_token) {
    const decoded = verifyJwt<User>(context.req.cookies.refresh_token);
    if (!decoded) {
      throw new ApolloError('403');
    }

    const user = await UserModel.find().findByEmail(decoded.email).lean();
    if (!user) {
      throw new ApolloError('403');
    }

    const { access_token, refresh_token } = signAuthorizationToken({ user });
    context.res.cookie(
      ACCESS_TOKEN_KEY,
      access_token,
      createTokenCookieOptions({ expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
    );
    context.res.cookie(
      REFRESH_TOKEN_KEY,
      refresh_token,
      createTokenCookieOptions({ expiresIn: REFRESH_TOKEN_EXPIRES_IN }),
    );
    context.user = user;
  }
  return context;
}

interface SignAuthorizationTokenArgs {
  user: User;
}

export function signAuthorizationToken({ user }: SignAuthorizationTokenArgs) {
  const access_token = signJwt(user, {
    expiresIn: `${ACCESS_TOKEN_EXPIRES_IN}m`,
  });
  const refresh_token = signJwt(user, {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_IN}m`,
  });

  return { access_token, refresh_token };
}

interface CreateTokenCookieOptionsArgs {
  expiresIn: number;
}

export function createTokenCookieOptions({
  expiresIn,
}: CreateTokenCookieOptionsArgs): CookieOptions {
  return {
    expires: new Date(Date.now() + expiresIn * 60 * 1000),
    maxAge: expiresIn * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // https only
    path: '/',
    domain: 'localhost',
  };
}
