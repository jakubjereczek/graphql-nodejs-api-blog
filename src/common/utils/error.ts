export const ERROR_MESSAGE = {
  // apollo errors
  UNAUTHORIZED: 'Unauthorized',
  ONLY_UNAUTHORIZED: 'Call only available for unauthorized users.',
  // graphql query/mutation errors
  CATEGORY_ALREADY_EXIST:
    'Category with this name already exists in the database.',
  CATEGORY_NOT_EXIST: 'Category with this name does not exist in the database.',
  USER_ALREADY_EXIST: 'User with this email already exists in the database.',
  USER_NOT_EXIST: 'User with this email does not exist in the database.',
  USER_INVALID_AUTHORIZATION: 'Invalid email or password',
};
