import ArticleResolver from 'resolvers/article.resolver';
import CategoryResolver from 'resolvers/category.resolver';
import UserResolver from 'resolvers/user.resolver';

export const resolvers = [
  UserResolver,
  CategoryResolver,
  ArticleResolver,
] as const;
