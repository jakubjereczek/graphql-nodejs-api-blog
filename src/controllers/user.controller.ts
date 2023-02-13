import { ApolloError } from 'apollo-server';
import { compare } from 'bcrypt';
import Authorization from 'common/Authorization/Authorization';
import Context from 'common/types/Context';
import { GraphQLError } from 'graphql';
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
    const user = await UserModel.find().findByEmail(input.email).lean();
    if (!user) {
      throw new ApolloError('Invalid email or password.');
    }

    const password = await compare(input.password, user.password);
    if (!password) {
      throw new ApolloError('Invalid email or password.');
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

  async currentUser(context: Context) {
    if (context.user) {
      const user = await UserModel.find()
        .findByEmail(context.user.email)
        .lean();
      if (!user) {
        return new GraphQLError('User not found.');
      }

      return user;
    }
  }
}
