import { ApolloError } from 'apollo-server';
import {
  CategoryModel,
  CreateCategoryInput,
  GetOrDeleteCategoryInput,
  UpdateCategoryInput,
} from 'schemas/category.schema';

export class CategoryController {
  async createCategory(input: CreateCategoryInput) {
    const category = await CategoryModel.find().findByName(input.name).lean();
    if (category) {
      throw new ApolloError(
        'Category with this name already exists in the database.',
      );
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
    const result = await CategoryModel.updateOne(
      { name: input.name },
      {
        ...input,
        name: input.newName,
      },
    );

    if (result.modifiedCount === 0) {
      throw new ApolloError(
        'Category with this name does not exist in the database.',
      );
    }

    return result;
  }

  async deleteCategory(input: GetOrDeleteCategoryInput) {
    const result = await CategoryModel.deleteOne({
      name: input.name,
    });

    if (result.deletedCount === 0) {
      throw new ApolloError(
        'Category with this name does not exist in the database.',
      );
    }

    return result;
  }
}
