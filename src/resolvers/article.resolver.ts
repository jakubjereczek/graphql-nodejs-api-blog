import {
  Arg,
  Authorized,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Role } from 'common/types/Role';
import { ArticleController } from 'controllers/article.controller';
import {
  Article,
  CreateArticleInput,
  GetOrDeleteArticleInput,
  UpdateArticleInput,
} from 'schemas/article.schema';
import { IncreaseArticleViews } from 'common/utils/typegraphql';

@Resolver()
export default class ArticleResolver {
  constructor(private articleController: ArticleController) {
    this.articleController = new ArticleController();
  }

  @Mutation(() => Article)
  @Authorized([Role.Moderator, Role.Writer])
  createArticle(@Arg('input') input: CreateArticleInput) {
    return this.articleController.createArticle(input);
  }

  @UseMiddleware(IncreaseArticleViews)
  @Query(() => Article, { nullable: true })
  getArticle(@Arg('input') input: GetOrDeleteArticleInput) {
    return this.articleController.getArticle(input);
  }

  @Query(() => [Article])
  getArticles() {
    return this.articleController.getArticles();
  }

  @Mutation(() => Article)
  @Authorized([Role.Moderator])
  updateArticle(@Arg('input') input: UpdateArticleInput) {
    return this.articleController.updateArticle(input);
  }

  @Mutation(() => Boolean)
  @Authorized([Role.Moderator])
  deleteArticle(@Arg('input') input: GetOrDeleteArticleInput) {
    return this.articleController.deleteArticle(input);
  }
}
