import CategoryResolver from './category.resolver';
import UserResolver from './user.resolver';

export const resolvers = [UserResolver, CategoryResolver] as const;
