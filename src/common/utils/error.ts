import { GraphQLError as Error, GraphQLErrorExtensions } from 'graphql';
import { Maybe } from 'type-graphql';

export const ERROR_MESSAGE = {
  // apollo errors
  UNAUTHORIZED: 'Unauthorized',
  ONLY_UNAUTHORIZED: 'Call only available for unauthorized users.',
  // graphql query/mutation errors
  CATEGORY_ALREADY_EXIST:
    'Category with this name already exists in the database.',
  CATEGORY_NOT_EXIST: 'Category with this name does not exist in the database.',
  USER_ALREADY_EXIST: 'User with this email already exists in the database.',
  USER_NOT_EXIST: 'User with this email does not exist in the database.',
  USER_INVALID_AUTHORIZATION: 'Invalid email or password',
};

export enum ERROR_CODE {
  UNAUTHORIZED = 'UNAUTHORIZED_ERROR',
  INTERNAL_SERVER = 'INTERNAL_SERVER_ERROR',
  BAD_USER_INPUT = 'BAD_USER_INPUT_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
}

// shorten version of GraphQLError
export class GraphQLError extends Error {
  constructor(message: string, extensions?: Maybe<GraphQLErrorExtensions>) {
    super(
      message,
      undefined, // nodes
      undefined, // source
      undefined, // positions
      undefined, // path
      undefined, // originalError
      extensions,
    );
  }
}
