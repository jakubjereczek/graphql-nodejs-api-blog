import Context from 'common/types/Context';
import Authorization from 'common/Authorization/Authorization';
import { verifyJwt } from 'common/utils/jwt';
import { ApolloError } from 'apollo-server';

jest.mock('common/utils/jwt', () => ({
  signJwt: jest.fn(),
  verifyJwt: jest.fn(),
}));

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

describe('Authorization tests', () => {
  describe('validate method', () => {
    it('should call the signJwt function with the access_token if it is present in the request cookies.', () => {
      try {
        (verifyJwt as jest.Mock).mockImplementation(() => null);

        Authorization.validate(mockedContext);

        expect(verifyJwt).toHaveBeenCalledWith(mockedTokens.access_token);
      } catch (err) {
        expect(err).toBeInstanceOf(ApolloError);
      }
    });

    // it('should update the context user if the access_token is successfully decoded', () => {});

    // it('should call the decodeToken function with the refresh_token if it is provided and the access_token is present but not valid', () => {});

    // it('should throw an ApolloError when tried to decode the refresh_token and wasnt valid', () => {});

    // it('should throw an ApolloError if a user cant be found in the database when tried to refresh tokens.', () => {});

    // it('should call signAndSetAuthorizationTokens if the refresh_token is successfully decoded', () => {});
  });

  // describe('signAndSetAuthorizationTokens method', () => {});

  // describe('clearCookies method', () => {});
});
