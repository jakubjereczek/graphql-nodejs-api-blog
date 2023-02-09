import { ApolloError } from 'apollo-server';
import { CookieOptions } from 'express';
import Context from 'common/types/Context';
import { signJwt, verifyJwt } from 'common/utils/jwt';
import { UserModel, mapUserIntoUserIdentifier } from 'schemas/user.schema';
import { UserIdentifier } from 'common/types/User';

export const KEY_ACCESS = 'access_token';
export const KEY_REFRESH = 'refresh_token';
export const EXP_ACCESS = 15;
export const EXP_REFRESH = 10080;

class Authorization {
  public static async validate(context: Context): Promise<Context> {
    const {
      req: {
        cookies: { access_token, refresh_token },
      },
    } = context;

    if (access_token) {
      const decoded = Authorization.decodeToken<UserIdentifier>(access_token);

      if (decoded) {
        const user = await UserModel.find().findByEmail(decoded.email).lean();
        if (user) {
          context.user = mapUserIntoUserIdentifier(user);
        } else {
          throw new ApolloError('403');
        }
      } else {
        const decoded =
          Authorization.decodeToken<UserIdentifier>(refresh_token);
        if (!decoded) {
          throw new ApolloError('403');
        }

        const user = await UserModel.find().findByEmail(decoded.email).lean();
        if (!user) {
          throw new ApolloError('403');
        }

        Authorization.signAndSetAuthorizationTokens(
          mapUserIntoUserIdentifier(user),
          context,
        );
      }
    }
    return context;
  }

  public static signAndSetAuthorizationTokens(
    user: UserIdentifier,
    context: Context,
  ): { access_token: string; refresh_token: string } {
    const accessToken = Authorization.signToken(user, EXP_ACCESS);
    const accessTokenCookie =
      Authorization.createTokenCookieOptions(EXP_ACCESS);
    context.res.cookie(KEY_ACCESS, accessToken, accessTokenCookie);

    const refreshToken = Authorization.signToken(user, EXP_REFRESH);
    const refreshTokenCookie =
      Authorization.createTokenCookieOptions(EXP_REFRESH);
    context.res.cookie(KEY_REFRESH, refreshToken, refreshTokenCookie);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  public static clearCookies(context: Context) {
    const accessCookie = context.req.cookies[KEY_ACCESS];

    if (accessCookie) {
      context.res.cookie(KEY_ACCESS, '', { maxAge: 1 });
      context.res.cookie(KEY_REFRESH, '', { maxAge: 1 });
      return true;
    }
    return false;
  }

  private static signToken<T extends object>(object: T, expiresIn: number) {
    return signJwt(object, {
      expiresIn: `${expiresIn}m`,
    });
  }

  private static decodeToken<T>(token: string) {
    return verifyJwt<T>(token);
  }

  private static createTokenCookieOptions(expiresIn: number): CookieOptions {
    return {
      expires: new Date(Date.now() + expiresIn * 60 * 1000),
      maxAge: expiresIn * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // https only
      path: '/',
      domain: 'localhost',
    };
  }
}

export default Authorization;
