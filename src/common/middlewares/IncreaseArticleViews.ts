import { MiddlewareFn } from 'type-graphql';
import Context from 'common/types/Context';
import { ArticleModel } from 'schemas/article.schema';

const IncreaseArticleViews: MiddlewareFn<Context> = async ({ args }, next) => {
  if (!args.input.articleId) {
    return next();
  }

  const updateResult = await ArticleModel.updateOne(
    { article_id: args.input.articleId },
    { $inc: { views: 1 } },
  ).lean();

  if (updateResult.matchedCount === 0) {
    console.warn('Unable to increase views. The article does not exist.');
  }

  return next();
};

export default IncreaseArticleViews;
