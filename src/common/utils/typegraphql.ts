import { MiddlewareFn } from 'type-graphql';
import Context from 'common/types/Context';
import { GraphQLError } from 'graphql';

export const Unauthorized: MiddlewareFn<Context> = async (
  { context: { user } },
  next,
) => {
  if (user) {
    throw new GraphQLError('Call available only for unauthorized users.');
  }
  return next();
};
