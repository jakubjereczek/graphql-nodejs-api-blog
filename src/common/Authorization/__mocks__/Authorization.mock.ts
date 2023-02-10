import Context from 'common/types/Context';
import { UserIdentifier } from 'common/types/User';

export const mockedTokens = {
  access_token: 'access_token',
  refresh_token: 'refresh_token',
};

export const mockedContext = {
  res: {
    cookie: jest.fn(),
  },
  req: {
    cookies: {
      ...mockedTokens,
    },
  },
  user: null,
} as unknown as Context;

export const mockedUser: UserIdentifier = {
  _id: 'user.id',
  email: 'user.email',
  roles: [],
};
