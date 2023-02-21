import ArticleResolver from './article.resolver';
import CategoryResolver from './category.resolver';
import UserResolver from './user.resolver';

export const resolvers = [
  UserResolver,
  CategoryResolver,
  ArticleResolver,
] as const;
