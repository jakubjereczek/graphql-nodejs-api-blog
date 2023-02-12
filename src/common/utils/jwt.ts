import config from 'config';
import jwt from 'jsonwebtoken';
import { JwtTokenType, TokenAccessModifier } from 'common/types/Jwt';
import { capitalized } from 'common/utils/string';

const getConfigJwtKey = (
  type: JwtTokenType,
  accessModifier: TokenAccessModifier,
) => `${accessModifier}${capitalized(type)}Key`;

export function signJwt(
  object: object,
  type: JwtTokenType,
  options?: jwt.SignOptions,
) {
  const privateAccessKey = Buffer.from(
    config.get<string>(getConfigJwtKey(type, 'private')),
    'base64',
  ).toString('ascii'); // we need to decode from base64

  if (!privateAccessKey) {
    console.warn(
      `Private ${type} key is not defined in the environment variables.`,
    );
  }
  return jwt.sign(object, privateAccessKey, {
    ...(options && options),
    algorithm: 'RS256',
  });
}

export function verifyJwt<T>(token: string, type: JwtTokenType): T | null {
  const publicAccessKey = Buffer.from(
    config.get<string>(getConfigJwtKey(type, 'public')),
    'base64',
  ).toString('ascii'); // we need to decode from base64

  if (!publicAccessKey) {
    console.warn(
      `Public ${type} key is not defined in the environment variables.`,
    );
  }
  try {
    const decoded = jwt.verify(token, publicAccessKey) as T;

    return decoded;
  } catch (err) {
    return null;
  }
}
