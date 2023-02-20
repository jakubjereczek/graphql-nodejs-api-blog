import { ApolloError } from 'apollo-server';
import { CookieOptions } from 'express';
import Context from 'common/types/Context';
import { signJwt, verifyJwt } from 'common/utils/jwt';
import { UserModel, mapUserIntoUserIdentifier } from 'schemas/user.schema';
import { UserIdentifier } from 'common/types/User';
import { JwtTokenType } from 'common/types/Jwt';
import { ERROR_CODE, ERROR_MESSAGE } from 'common/utils/error';

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

    try {
      if (access_token) {
        await this.validateAccessToken(context);
      } else if (refresh_token) {
        await this.refreshTokens(context);
      }
    } catch (err) {
      throw new ApolloError(
        ERROR_MESSAGE.UNAUTHORIZED,
        ERROR_CODE.UNAUTHORIZED,
        {
          statusCode: 401,
        },
      );
    }

    return context;
  }

  private static async validateAccessToken(context: Context) {
    const decoded = Authorization.decodeToken<UserIdentifier>(
      context.req.cookies.access_token,
      'access',
    );

    if (decoded) {
      if (!context.user) {
        const user = await UserModel.find().findByEmail(decoded.email).lean();

        if (user) {
          context.user = mapUserIntoUserIdentifier(user);
        } else {
          throw new Error('User does not exists in database.');
        }
      }
    } else {
      Authorization.refreshTokens(context);
    }

    return context;
  }

  private static async refreshTokens(context: Context) {
    if (context.req.cookies.refresh_token) {
      const decoded = Authorization.decodeToken<UserIdentifier>(
        context.req.cookies.refresh_token,
        'refresh',
      );
      if (!decoded) {
        throw new Error('Refresh token is not valid.');
      }

      const user = await UserModel.find().findByEmail(decoded.email).lean();
      if (user) {
        Authorization.signAndSetAuthorizationTokens(
          mapUserIntoUserIdentifier(user),
          context,
        );
        context.user = mapUserIntoUserIdentifier(user);
      } else {
        throw new Error('User does not exist in database.');
      }
    }
  }

  public static signAndSetAuthorizationTokens(
    user: UserIdentifier,
    context: Context,
  ): { access_token: string; refresh_token: string } {
    const accessToken = Authorization.signToken(user, EXP_ACCESS, 'access');
    const accessTokenCookie =
      Authorization.createTokenCookieOptions(EXP_ACCESS);
    context.res.cookie(KEY_ACCESS, accessToken, accessTokenCookie);

    const refreshToken = Authorization.signToken(user, EXP_REFRESH, 'refresh');
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

  private static signToken<T extends object>(
    object: T,
    expiresIn: number,
    type: JwtTokenType,
  ) {
    return signJwt(object, type, {
      expiresIn: `${expiresIn}m`,
    });
  }

  private static decodeToken<T>(token: string, type: JwtTokenType) {
    return verifyJwt<T>(token, type);
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
