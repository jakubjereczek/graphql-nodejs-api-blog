import Context from 'common/types/Context';
import { getTimestamp } from 'common/utils/datetime';
import { ERROR_CODE, ERROR_MESSAGE, GraphQLError } from 'common/utils/error';
import {
  ArticleModel,
  CreateArticleInput,
  GetOrDeleteArticleInput,
  UpdateArticleInput,
} from 'schemas/article.schema';
import { CategoryModel } from 'schemas/category.schema';
import { CommentModel } from 'schemas/comment.schema';
import { getRecursiveCommentsIds } from 'utils/article.utils';

export class ArticleController {
  async createArticle(
    { category: categoryName, ...input }: CreateArticleInput,
    { user }: Context,
  ) {
    if (!user) {
      throw new GraphQLError(ERROR_MESSAGE.UNAUTHORIZED, {
        code: ERROR_CODE.UNAUTHORIZED,
        statusCode: 401,
      });
    }

    const category = await CategoryModel.find().findByName(categoryName).lean();
    if (!category) {
      throw new GraphQLError(ERROR_MESSAGE.CATEGORY_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    const payload = {
      ...input,
      category: category._id,
      author: user._id,
      views: 0,
      created_at: getTimestamp(),
      comments_ids: [],
    };
    return ArticleModel.create(payload);
  }

  async getArticle(input: GetOrDeleteArticleInput) {
    return await ArticleModel.find()
      .populate({
        path: 'author',
        select: 'name email roles',
      })
      .populate('category')
      .findByArticleId(input.articleId)
      .lean();
  }

  async getArticles() {
    return await ArticleModel.find()
      .populate({
        path: 'author',
        select: 'name email roles',
      })
      .populate('category')
      .lean();
  }

  async updateArticle({ articleId, category, ...input }: UpdateArticleInput) {
    let categoryId;
    if (category) {
      const catg = await CategoryModel.find().findByName(category).lean();

      if (!catg) {
        throw new GraphQLError(ERROR_MESSAGE.CATEGORY_NOT_EXIST, {
          code: ERROR_CODE.BAD_USER_INPUT,
          statusCode: 400,
        });
      }
      categoryId = catg._id;
    }

    const result = await ArticleModel.updateOne(
      { article_id: articleId },
      {
        ...input,
        ...(categoryId && { category: categoryId }),
      },
    ).lean();

    if (result.matchedCount === 0) {
      throw new GraphQLError(ERROR_MESSAGE.ARTICLE_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    const article = await ArticleModel.find()
      .populate({
        path: 'author',
        select: 'name email roles',
      })
      .populate('category')
      .findByArticleId(articleId)
      .lean();

    return article;
  }

  async deleteArticle(input: GetOrDeleteArticleInput) {
    const article = await ArticleModel.find()
      .findByArticleId(input.articleId)
      .lean();

    if (!article) {
      throw new GraphQLError(ERROR_MESSAGE.ARTICLE_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    await CommentModel.deleteMany({
      comment_id: {
        $in: (
          await getRecursiveCommentsIds({
            id: article.article_id,
            isArticle: true,
          })
        ).reverse(),
      },
    });

    const result = await ArticleModel.deleteOne({
      article_id: input.articleId,
    }).lean();

    if (result.deletedCount === 0) {
      throw new GraphQLError(ERROR_MESSAGE.ARTICLE_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    return result.deletedCount === 1;
  }
}
