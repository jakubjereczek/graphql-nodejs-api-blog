import { LeanDocument } from 'mongoose';
import { Article } from 'schemas/article.schema';
import { Comment } from 'schemas/comment.schema';

export const mockedArticleId = 'article-1';

export const mockedInnerDepthComments: LeanDocument<Comment[]> = [
  {
    _id: '602e06c050d20d3f19e3f0158',
    comment_id: 'comment-1-3-1',
    article_id: mockedArticleId,
    author: 'mockedAuthor',
    body: 'mockedBody',
    answers: [],
    created_at: 1678130376700,
  },
  {
    _id: '602e06c05010d3f19ess0159',
    comment_id: 'comment-1-3-2',
    article_id: mockedArticleId,
    author: 'mockedAuthor',
    body: 'mockedBody',
    answers: [],
    created_at: 1678130376700,
  },
];

export const mockedInnerComments: LeanDocument<Comment[]> = [
  {
    _id: '602e06c05010d3f19e3f0158',
    comment_id: 'comment-1-1',
    article_id: mockedArticleId,
    author: 'mockedAuthor',
    body: 'mockedBody',
    answers: [],
    created_at: 1678130376700,
  },
  {
    _id: '602e06c05010d3f19e3f0159',
    comment_id: 'comment-1-2',
    article_id: mockedArticleId,
    author: 'mockedAuthor',
    body: 'mockedBody',
    answers: [],
    created_at: 1678130376700,
  },
  {
    _id: '602e06c05010d3f19e3f015a',
    comment_id: 'comment-1-3',
    article_id: mockedArticleId,
    author: 'mockedAuthor',
    body: 'mockedBody',
    answers: ['602e06c050d20d3f19e3f0158', '602e06c05010d3f19ess0159'],
    created_at: 1678130376700,
  },
];

export const mockedComments: LeanDocument<Comment[]> = [
  {
    _id: '602e06c05010d3f19e3f015b',
    comment_id: 'comment-1',
    article_id: mockedArticleId,
    author: 'mockedAuthor',
    body: 'mockedBody',
    answers: [
      '602e06c05010d3f19e3f0158',
      '602e06c05010d3f19e3f0159',
      '602e06c05010d3f19e3f015a',
    ],
    created_at: 1678130376700,
  },
  {
    _id: '602e06c05010d3f19e3f015c',
    comment_id: 'comment-2',
    article_id: mockedArticleId,
    author: 'mockedAuthor',
    body: 'mockedBody',
    answers: [],
    created_at: 1678130376700,
  },
];

export const mockedAllComments = [
  ...mockedComments,
  ...mockedInnerComments,
  ...mockedInnerDepthComments,
];

const mockedCommentsIds = mockedComments.map((comment) => comment._id);

export const mockedArticle: LeanDocument<Article> = {
  _id: 'mockedId',
  article_id: mockedArticleId,
  category: 'mockedCategory',
  name: 'mockedName',
  body: 'mockedBody',
  author: 'mockedAuthor',
  views: 0,
  created_at: 1678130376700,
  thumbnail_url: 'mockedThumbnailUrl',
  comments_ids: mockedCommentsIds,
};
