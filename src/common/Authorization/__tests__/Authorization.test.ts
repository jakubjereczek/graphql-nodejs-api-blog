import { ApolloError } from 'apollo-server';
import Authorization, {
  KEY_ACCESS,
  KEY_REFRESH,
} from 'common/Authorization/Authorization';
import { signJwt, verifyJwt } from 'common/utils/jwt';
import { UserModel } from 'schemas/user.schema';
import {
  mockContext,
  mockedTokens,
  mockedUser,
} from '../__mocks__/Authorization.mock';

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

const mockedContext = mockContext(mockedTokens);

describe('Authorization tests', () => {
  describe('validate method', () => {
    it('should call the signJwt function with the access_token if it is present in the request cookies.', async () => {
      (verifyJwt as jest.Mock).mockImplementation(() => mockedUser);
      (
        UserModel.find().findByEmail(mockedUser.email)
          .lean as unknown as jest.Mock
      ).mockResolvedValue(mockedUser);
      await Authorization.validate(mockedContext);

      expect(verifyJwt).toHaveBeenCalledWith(
        mockedTokens.access_token,
        'access',
      );
    });

    it('should update the context user if the access_token is successfully decoded', async () => {
      const mockedContext = mockContext(mockedTokens);
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

    it('should call the verifyJwt function with the refresh_token if it is provided and the access_token is present but not valid', async () => {
      (verifyJwt as jest.Mock)
        .mockImplementationOnce(() => null)
        .mockImplementationOnce(() => mockedUser);
      (
        UserModel.find().findByEmail(mockedUser.email)
          .lean as unknown as jest.Mock
      ).mockResolvedValue(mockedUser);
      await Authorization.validate(mockedContext);

      expect(verifyJwt).toHaveBeenCalledWith(
        mockedTokens.refresh_token,
        'refresh',
      );
    });

    it('should throw an ApolloError when tried to decode the refresh_token and wasnt valid', () => {
      const mockedContext = mockContext({
        ...mockedTokens,
        access_token: undefined,
      });
      (verifyJwt as jest.Mock)
        .mockImplementationOnce(() => null)
        .mockImplementationOnce(() => null);

      Authorization.validate(mockedContext).catch((error) => {
        expect(verifyJwt).toHaveBeenLastCalledWith(
          mockedTokens.refresh_token,
          'refresh',
        );
        expect(error).toBeInstanceOf(ApolloError);
      });
    });

    it('should throw an ApolloError if a user cant be found in the database when tried to refresh tokens.', () => {
      const mockedContext = mockContext({
        ...mockedTokens,
        access_token: undefined,
      });
      (verifyJwt as jest.Mock)
        .mockImplementationOnce(() => null)
        .mockImplementationOnce(() => mockedUser);
      (
        UserModel.find().findByEmail(mockedUser.email)
          .lean as unknown as jest.Mock
      ).mockResolvedValue(null);

      Authorization.validate(mockedContext).catch((error) => {
        expect(error).toBeInstanceOf(ApolloError);
      });
    });

    it('should call signAndSetAuthorizationTokens if the refresh_token is successfully decoded', async () => {
      const spy = jest.spyOn(Authorization, 'signAndSetAuthorizationTokens');
      (verifyJwt as jest.Mock)
        .mockImplementationOnce(() => null)
        .mockImplementationOnce(() => mockedUser);
      (
        UserModel.find().findByEmail(mockedUser.email)
          .lean as unknown as jest.Mock
      ).mockResolvedValue(mockedUser);

      const context = await Authorization.validate(mockedContext);

      expect(spy).toHaveBeenCalledWith(mockedUser, context);
    });
  });

  describe('signAndSetAuthorizationTokens method', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should call signJwt twice', () => {
      Authorization.signAndSetAuthorizationTokens(mockedUser, mockedContext);

      expect(signJwt).toHaveBeenCalledTimes(2);
    });

    it('should call context.res.cookie for access and refresh tokens', () => {
      Authorization.signAndSetAuthorizationTokens(mockedUser, mockedContext);

      expect(mockedContext.res.cookie).toHaveBeenCalledTimes(2);
    });

    it('should return access and refresh tokens', () => {
      (signJwt as jest.Mock)
        .mockImplementationOnce(() => 'token1')
        .mockImplementationOnce(() => 'token2');

      const result = Authorization.signAndSetAuthorizationTokens(
        mockedUser,
        mockedContext,
      );
      expect(result).toEqual({
        access_token: 'token1',
        refresh_token: 'token2',
      });
    });
  });

  describe('clearCookies method', () => {
    it('should call context.res.cookie for access and refresh tokens with maxAge param 1', () => {
      Authorization.clearCookies(mockedContext);

      expect(mockedContext.res.cookie).toHaveBeenCalledWith(KEY_ACCESS, '', {
        maxAge: 1,
      });
      expect(mockedContext.res.cookie).toHaveBeenCalledWith(KEY_REFRESH, '', {
        maxAge: 1,
      });
    });
  });
});
