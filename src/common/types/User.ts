import { User } from 'schemas/user.schema';

export type UserIdentifier = Pick<User, '_id' | 'email' | 'roles'>;

export type UserConfig = Pick<User, 'name' | 'password' | 'email'>;
