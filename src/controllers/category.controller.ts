import {
  CategoryModel,
  CreateCategoryInput,
  GetOrDeleteCategoryInput,
  UpdateCategoryInput,
} from 'schemas/category.schema';
import { ERROR_CODE, ERROR_MESSAGE, GraphQLError } from 'common/utils/error';
import { ArticleModel } from 'schemas/article.schema';

export class CategoryController {
  async createCategory(input: CreateCategoryInput) {
    const category = await CategoryModel.find().findByName(input.name).lean();
    if (category) {
      throw new GraphQLError(ERROR_MESSAGE.CATEGORY_ALREADY_EXIST, {
        code: ERROR_CODE.CONFLICT,
        statusCode: 409,
      });
    }
    return CategoryModel.create(input);
  }

  async getCategory(input: GetOrDeleteCategoryInput) {
    return await CategoryModel.find().findByName(input.name).lean();
  }

  async getCategories() {
    return await CategoryModel.find().lean();
  }

  async updateCategory(input: UpdateCategoryInput) {
    const updateResult = await CategoryModel.updateOne(
      { name: input.name },
      {
        ...input,
        name: input.newName,
      },
    ).lean();

    if (updateResult.modifiedCount === 0) {
      throw new GraphQLError(ERROR_MESSAGE.CATEGORY_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    const modifiedCategory = await CategoryModel.find()
      .findByName(input.newName)
      .lean();

    return modifiedCategory;
  }

  async deleteCategory(input: GetOrDeleteCategoryInput) {
    const category = await CategoryModel.find().findByName(input.name).lean();
    if (!category) {
      throw new GraphQLError(ERROR_MESSAGE.CATEGORY_NOT_EXIST, {
        code: ERROR_CODE.CONFLICT,
        statusCode: 400,
      });
    }

    const articles = await ArticleModel.find({ category: category._id }).lean();
    if (articles.length > 0) {
      throw new GraphQLError(ERROR_MESSAGE.CATEGORY_HAS_ARTICLES, {
        code: ERROR_CODE.CONFLICT,
        statusCode: 409,
      });
    }

    const result = await CategoryModel.deleteOne({
      name: input.name,
    }).lean();

    if (result.deletedCount === 0) {
      throw new GraphQLError(ERROR_MESSAGE.CATEGORY_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    return result.deletedCount === 1;
  }
}
