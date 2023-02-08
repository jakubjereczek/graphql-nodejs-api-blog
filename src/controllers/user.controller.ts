import { ApolloError } from 'apollo-server';
import { compare } from 'bcrypt';
import Authorization from 'common/Authorization/Authorization';
import Context from 'common/types/Context';
import {
  AuthorizeUserInput,
  CreateUserInput,
  UserModel,
  mapUserIntoUserIdentifier,
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
    const currentUser = await UserModel.find().findByEmail(input.email).lean();
    if (!currentUser) {
      throw new ApolloError('Invalid email or password.');
    }

    const password = await compare(input.password, currentUser.password);
    if (!password) {
      throw new ApolloError('Invalid email or password.');
    }

    return Authorization.signAndSetAuthorizationTokens(
      mapUserIntoUserIdentifier(currentUser),
      context,
    );
  }

  async logoutUser(context: Context) {
    return Authorization.clearCookies(context);
  }
}
