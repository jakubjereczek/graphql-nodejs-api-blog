import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { CategoryController } from 'controllers/category.controller';
import {
  Category,
  CreateCategoryInput,
  GetOrDeleteCategoryInput,
  UpdateCategoryInput,
} from 'schemas/category.schema';
import { Role } from 'common/types/Role';

@Resolver()
export default class CategoryResolver {
  constructor(private categoryController: CategoryController) {
    this.categoryController = new CategoryController();
  }

  @Mutation(() => Category)
  @Authorized([Role.Moderator])
  createCategory(@Arg('input') input: CreateCategoryInput) {
    return this.categoryController.createCategory(input);
  }

  @Query(() => Category, { nullable: true })
  getCategory(@Arg('input') input: GetOrDeleteCategoryInput) {
    return this.categoryController.getCategory(input);
  }

  @Query(() => [Category])
  @Authorized([Role.Moderator])
  getCategories() {
    return this.categoryController.getCategories();
  }

  @Mutation(() => Category)
  @Authorized([Role.Moderator])
  updateCategory(@Arg('input') input: UpdateCategoryInput) {
    return this.categoryController.updateCategory(input);
  }

  @Mutation(() => Category)
  @Authorized([Role.Moderator])
  deleteCategory(@Arg('input') input: GetOrDeleteCategoryInput) {
    return this.categoryController.deleteCategory(input);
  }
}
