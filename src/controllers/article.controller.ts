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
    };
    return ArticleModel.create(payload);
  }

  async getArticle(input: GetOrDeleteArticleInput) {
    // TODO
  }

  async getArticles() {
    // TODO
  }

  async updateArticle(input: UpdateArticleInput) {
    // TODO
  }

  async deleteArticle(input: GetOrDeleteArticleInput) {
    // TODO
  }
}
