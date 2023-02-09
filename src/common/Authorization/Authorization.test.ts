import Context from 'common/types/Context';
import Authorization from 'common/Authorization/Authorization';
import { verifyJwt } from 'common/utils/jwt';
import { UserIdentifier } from 'common/types/User';
import { UserModel } from 'schemas/user.schema';
import { ApolloError } from 'apollo-server';

jest.mock('common/utils/jwt', () => ({
  signJwt: jest.fn(),
  verifyJwt: jest.fn(),
}));

jest.mock('schemas/user.schema', () => ({
  ...jest.requireActual('schemas/user.schema'),
  UserModel: {
    find: jest.fn().mockReturnValue({
      findByEmail: jest.fn().mockReturnValue({
        lean: jest.fn(),
      }),
    }),
  },
}));

jest.mock('apollo-server');

const mockedTokens = {
  access_token: 'access_token',
  refresh_token: 'refresh_token',
};

const mockedContext = {
  res: {},
  req: {
    cookies: {
      ...mockedTokens,
    },
  },
  user: null,
} as unknown as Context;

const mockedUser: UserIdentifier = {
  _id: 'user.id',
  email: 'user.email',
  roles: [],
};

describe('Authorization tests', () => {
  describe('validate method', () => {
    it('should call the signJwt function with the access_token if it is present in the request cookies.', async () => {
      (verifyJwt as jest.Mock).mockImplementation(() => mockedUser);
      (
        UserModel.find().findByEmail(mockedUser.email)
          .lean as unknown as jest.Mock
      ).mockResolvedValue(mockedUser);
      await Authorization.validate(mockedContext);

      expect(verifyJwt).toHaveBeenCalledWith(mockedTokens.access_token);
    });

    it('should update the context user if the access_token is successfully decoded', async () => {
      (verifyJwt as jest.Mock).mockImplementation(() => mockedUser);
      (
        UserModel.find().findByEmail(mockedUser.email)
          .lean as unknown as jest.Mock
      ).mockResolvedValue(mockedUser);
      const context = await Authorization.validate(mockedContext);

      expect(context).toEqual({ ...mockedContext, user: mockedUser });
    });

    it('should throw an ApolloError if the access_token is successfully decoded but user is not found in database', () => {
      (verifyJwt as jest.Mock).mockImplementation(() => mockedUser);
      (
        UserModel.find().findByEmail(mockedUser.email)
          .lean as unknown as jest.Mock
      ).mockResolvedValue(null);

      Authorization.validate(mockedContext).catch((error) => {
        expect(error).toBeInstanceOf(ApolloError);
      });
    });

    it.only('should call the verifyJwt function with the refresh_token if it is provided and the access_token is present but not valid', async () => {
      (verifyJwt as jest.Mock)
        .mockImplementationOnce(() => null)
        .mockImplementationOnce(() => mockedUser);
      await Authorization.validate(mockedContext);

      expect(verifyJwt).toHaveBeenCalledWith(mockedTokens.refresh_token);
    });

    // it('should throw an ApolloError when tried to decode the refresh_token and wasnt valid', () => {});

    // it('should throw an ApolloError if a user cant be found in the database when tried to refresh tokens.', () => {});

    // it('should call signAndSetAuthorizationTokens if the refresh_token is successfully decoded', () => {});
  });

  // describe('signAndSetAuthorizationTokens method', () => {
  // it('should call signJwt twice', () => {});

  // it('should call context.res.cookie for access and refresh tokens', () => {

  // })

  // it('should return access and refresh tokens', () => {})
  // });

  // describe('clearCookies method', () => {
  // it('should call context.res.cookie for access and refresh tokens with maxAge param 1', () => {});
  // });
});
