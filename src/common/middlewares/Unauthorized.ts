import { MiddlewareFn } from 'type-graphql';
import { ApolloError } from 'apollo-server';
import Context from 'common/types/Context';
import { ERROR_CODE, ERROR_MESSAGE } from 'common/utils/error';

const Unauthorized: MiddlewareFn<Context> = async (
  { context: { user } },
  next,
) => {
  if (user) {
    throw new ApolloError(
      ERROR_MESSAGE.ONLY_UNAUTHORIZED,
      ERROR_CODE.ONLY_UNAUTHORIZED,
      {
        statusCode: 403,
      },
    );
  }
  return next();
};

export default Unauthorized;
