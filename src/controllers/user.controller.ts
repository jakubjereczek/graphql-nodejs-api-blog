import { ApolloError } from 'apollo-server';
import { compare } from 'bcrypt';
import Context from 'common/types/Context';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_KEY,
  createTokenCookieOptions,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_KEY,
  signAuthorizationToken,
} from 'common/utils/jwt';
import {
  AuthorizeUserInput,
  CreateUserInput,
  UserModel,
} from 'schemas/user.schema';

export class UserController {
  async createUser(input: CreateUserInput) {
    const user = await UserModel.find().findByEmail(input.email).lean();
    if (user) {
      throw new ApolloError(
        'User with this email already exists in the database.',
      );
    }
    return UserModel.create(input);
  }

  async authorizeUser(input: AuthorizeUserInput, context: Context) {
    const user = await UserModel.find().findByEmail(input.email).lean();
    if (!user) {
      throw new ApolloError('Invalid email or password.');
    }

    const password = await compare(input.password, user.password);
    if (!password) {
      throw new ApolloError('Invalid email or password.');
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

    return {
      access_token,
      refresh_token,
    };
  }

  async logoutUser(context: Context) {
    context.res.cookie(ACCESS_TOKEN_KEY, '', { maxAge: 1 });
    context.res.cookie(REFRESH_TOKEN_KEY, '', { maxAge: 1 });

    return true;
  }
}
