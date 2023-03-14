import ArticleResolver from 'resolvers/article.resolver';
import CategoryResolver from 'resolvers/category.resolver';
import UserResolver from 'resolvers/user.resolver';
import CommentResolver from 'resolvers/comment.resolver';
import ImageResolver from 'resolvers/image.resolver';

export const resolvers = [
  UserResolver,
  CategoryResolver,
  ArticleResolver,
  CommentResolver,
  ImageResolver,
] as const;
