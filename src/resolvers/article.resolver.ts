import {
  Arg,
  Authorized,
  Ctx,
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
import IncreaseArticleViews from 'common/middlewares/IncreaseArticleViews';
import Context from 'common/types/Context';

@Resolver()
export default class ArticleResolver {
  constructor(private articleController: ArticleController) {
    this.articleController = new ArticleController();
  }

  @Mutation(() => Article)
  @Authorized([Role.Moderator, Role.Writer])
  createArticle(
    @Arg('input') input: CreateArticleInput,
    @Ctx() context: Context,
  ) {
    return this.articleController.createArticle(input, context);
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
