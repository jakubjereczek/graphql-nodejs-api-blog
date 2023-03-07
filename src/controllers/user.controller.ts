import { compare } from 'bcrypt';
import Authorization from 'common/Authorization/Authorization';
import Context from 'common/types/Context';
import { Role } from 'common/types/Role';
import {
  AuthorizeUserInput,
  CreateUserInput,
  UserModel,
  User,
} from 'schemas/user.schema';
import { ERROR_CODE, ERROR_MESSAGE, GraphQLError } from 'common/utils/error';
import { mapUserIntoUserIdentifier } from 'utils/user.utils';

export class UserController {
  async createUser(input: CreateUserInput) {
    const user = await UserModel.find().findByEmail(input.email).lean();
    if (user) {
      throw new GraphQLError(ERROR_MESSAGE.USER_ALREADY_EXIST, {
        code: ERROR_CODE.CONFLICT,
        statusCode: 409,
      });
    }
    const payload: Partial<User> = { ...input, roles: [Role.Reader] };
    return UserModel.create(payload);
  }

  async authorizeUser(input: AuthorizeUserInput, context: Context) {
    const user = await UserModel.find().findByEmail(input.email).lean();
    if (!user) {
      throw new GraphQLError(ERROR_MESSAGE.UNAUTHORIZED, {
        code: ERROR_CODE.UNAUTHORIZED,
        statusCode: 401,
      });
    }

    const password = await compare(input.password, user.password);
    if (!password) {
      throw new GraphQLError(ERROR_MESSAGE.USER_INVALID_AUTHORIZATION);
    }

    return Authorization.signAndSetAuthorizationTokens(
      mapUserIntoUserIdentifier(user),
      context,
    );
  }

  async logoutUser(context: Context) {
    context.user = null;
    return Authorization.clearCookies(context);
  }

  async getCurrentUser(context: Context) {
    if (context.user) {
      const user = await UserModel.find()
        .findByEmail(context.user.email)
        .lean();
      if (!user) {
        throw new GraphQLError(ERROR_MESSAGE.USER_NOT_EXIST, {
          code: ERROR_CODE.BAD_USER_INPUT,
          statusCode: 400,
        });
      }

      return user;
    }
  }
}
