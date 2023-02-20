import Context from 'common/types/Context';
import { Role } from 'common/types/Role';
import { UserIdentifier } from 'common/types/User';

export const mockedTokens = {
  access_token: 'access_token',
  refresh_token: 'refresh_token',
};

export const mockContext = (cookies: any) =>
  ({
    res: {
      cookie: jest.fn(),
    },
    req: {
      cookies: {
        ...cookies,
      },
    },
    user: null,
  } as unknown as Context);

export const mockedUser: UserIdentifier = {
  _id: 'user.id',
  email: 'user.email',
  roles: [Role.Writer],
};
