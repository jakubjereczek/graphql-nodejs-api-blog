import { ArticleModel } from 'schemas/article.schema';
import { CommentModel } from 'schemas/comment.schema';
import { getRecursiveArticleCommentsIds } from 'utils/article.utils';
import {
  mockedAllComments,
  mockedArticle,
  mockedArticleId,
} from 'utils/__mocks__/article.mock';

jest.mock('schemas/article.schema', () => ({
  ...jest.requireActual('schemas/article.schema'),
  ArticleModel: {
    find: jest.fn().mockReturnValue({
      findByArticleId: jest.fn().mockReturnValue({
        lean: jest.fn(),
      }),
    }),
  },
}));

jest.mock('schemas/comment.schema', () => ({
  ...jest.requireActual('schemas/comment.schema'),
  CommentModel: {
    findById: jest.fn().mockReturnValue({
      lean: jest.fn(),
    }),
  },
}));

describe('article.utils', () => {
  describe('getRecursiveArticleCommentsIds method', () => {
    it('it should return all article inner depth commends ids', async () => {
      (
        ArticleModel.find().findByArticleId('any-id')
          .lean as unknown as jest.Mock
      ).mockResolvedValue(mockedArticle);
      CommentModel.findById = jest.fn().mockImplementation((_id: string) => ({
        lean: jest.fn().mockImplementation(() => {
          return mockedAllComments.find((comment) => comment._id === _id);
        }),
      }));
      const result = await getRecursiveArticleCommentsIds(mockedArticleId);

      expect(result).toEqual([
        'comment-1',
        'comment-1-1',
        'comment-1-2',
        'comment-1-3',
        'comment-1-3-1',
        'comment-1-3-2',
        'comment-2',
      ]);
    });
  });
});
