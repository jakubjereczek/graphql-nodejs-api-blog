import { MiddlewareFn } from 'type-graphql';
import Context from 'common/types/Context';
import { ArticleModel } from 'schemas/article.schema';

const IncreaseArticleViews: MiddlewareFn<Context> = async ({ args }, next) => {
  if (!args.input.articleId) {
    return next();
  }

  const result = await ArticleModel.updateOne(
    { article_id: args.input.articleId },
    { $inc: { views: 1 } },
  ).lean();

  if (result.matchedCount === 0) {
    console.warn(
      'The article does not exist - unable to increase views count.',
    );
  }

  return next();
};

export default IncreaseArticleViews;
