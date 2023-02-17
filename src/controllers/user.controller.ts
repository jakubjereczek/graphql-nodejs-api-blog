import { GraphQLError } from 'graphql';
import { compare } from 'bcrypt';
import Authorization from 'common/Authorization/Authorization';
import Context from 'common/types/Context';
import { Role } from 'common/types/Role';
import {
  AuthorizeUserInput,
  CreateUserInput,
  UserModel,
  mapUserIntoUserIdentifier,
} from 'schemas/user.schema';
import { ERROR_MESSAGE } from 'common/utils/error';

export class UserController {
  async createUser(input: CreateUserInput) {
    const user = await UserModel.find().findByEmail(input.email).lean();
    if (user) {
      throw new GraphQLError(ERROR_MESSAGE.USER_ALREADY_EXIST);
    }
    return UserModel.create({ ...input, roles: [Role.Reader] });
  }

  async authorizeUser(input: AuthorizeUserInput, context: Context) {
    const user = await UserModel.find().findByEmail(input.email).lean();
    if (!user) {
      throw new GraphQLError(ERROR_MESSAGE.USER_INVALID_AUTHORIZATION);
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
        throw new GraphQLError(ERROR_MESSAGE.USER_NOT_EXIST);
      }

      return user;
    }
  }
}
