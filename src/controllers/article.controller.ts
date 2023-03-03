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

    const updateResult = await ArticleModel.updateOne(
      { article_id: articleId },
      {
        ...input,
        ...(categoryId && { category: categoryId }),
      },
    ).lean();

    if (updateResult.matchedCount === 0) {
      throw new GraphQLError(ERROR_MESSAGE.ARTICLE_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    const modifiedArticle = await ArticleModel.find()
      .populate({
        path: 'author',
        select: 'name email roles',
      })
      .populate('category')
      .findByArticleId(articleId)
      .lean();

    return modifiedArticle;
  }

  async deleteArticle(input: GetOrDeleteArticleInput) {
    const result = await ArticleModel.deleteOne({
      article_id: input.articleId,
    }).lean();

    // TODO: Delete all article comments and its child. Find all by article ID - recursive iteration and remove!

    if (result.deletedCount === 0) {
      throw new GraphQLError(ERROR_MESSAGE.ARTICLE_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    return result.deletedCount === 1;
  }
}
