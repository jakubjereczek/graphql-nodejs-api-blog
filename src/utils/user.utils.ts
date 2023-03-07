import { UserIdentifier } from 'common/types/User';
import { User } from 'schemas/user.schema';

export function mapUserIntoUserIdentifier({
  _id,
  email,
  roles,
}: User): UserIdentifier {
  return {
    _id,
    email,
    roles,
  };
}
