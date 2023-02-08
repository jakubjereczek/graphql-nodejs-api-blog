import { User } from 'schemas/user.schema';

export type UserIdentifier = Pick<User, '_id' | 'email' | 'roles'>;
