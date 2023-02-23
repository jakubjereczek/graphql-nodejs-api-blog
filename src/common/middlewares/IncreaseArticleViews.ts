import { MiddlewareFn } from 'type-graphql';
import Context from 'common/types/Context';

const IncreaseArticleViews: MiddlewareFn<Context> = async (
  { root, args, context, info },
  next,
) => {
  // TODO: Implement logic for increase article views.

  return next();
};

export default IncreaseArticleViews;
