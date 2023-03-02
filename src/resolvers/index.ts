import ArticleResolver from 'resolvers/article.resolver';
import CategoryResolver from 'resolvers/category.resolver';
import UserResolver from 'resolvers/user.resolver';
import CommentResolver from 'resolvers/comment.resolver';

export const resolvers = [
  UserResolver,
  CategoryResolver,
  ArticleResolver,
  CommentResolver,
] as const;
