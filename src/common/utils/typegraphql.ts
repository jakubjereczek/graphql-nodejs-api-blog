import { MiddlewareFn } from 'type-graphql';
import { ApolloError } from 'apollo-server';
import Context from 'common/types/Context';
import { ERROR_MESSAGE } from 'common/utils/error';

export const Unauthorized: MiddlewareFn<Context> = async (
  { context: { user } },
  next,
) => {
  if (user) {
    throw new ApolloError(ERROR_MESSAGE.ONLY_UNAUTHORIZED);
  }
  return next();
};
