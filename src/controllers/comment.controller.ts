import Context from 'common/types/Context';
import { Role } from 'common/types/Role';
import { getTimestamp } from 'common/utils/datetime';
import { ERROR_CODE, ERROR_MESSAGE, GraphQLError } from 'common/utils/error';
import { ArticleModel } from 'schemas/article.schema';
import {
  Comment,
  CommentModel,
  CreateCommentInput,
  GetOrDeleteCommentInput,
  UpdateCommentInput,
} from 'schemas/comment.schema';

export class CommentController {
  async createComment(
    { commentId, articleId, ...input }: CreateCommentInput,
    { user }: Context,
  ) {
    if (!user) {
      throw new GraphQLError(ERROR_MESSAGE.UNAUTHORIZED, {
        code: ERROR_CODE.UNAUTHORIZED,
        statusCode: 401,
      });
    }

    const article = await ArticleModel.find().findByArticleId(articleId).lean();
    if (!article) {
      throw new GraphQLError(ERROR_MESSAGE.ARTICLE_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    try {
      const payload = {
        ...input,
        article_id: article._id,
        author: user._id,
        answers: new Array<Comment>(),
        created_at: getTimestamp(),
      };
      const result = await CommentModel.create(payload);

      let commentReference;
      if (commentId) {
        commentReference = await CommentModel.updateOne(
          { comment_id: commentId },
          { $push: { answers: result._id } },
        );
      } else {
        commentReference = await ArticleModel.updateOne(
          { article_id: articleId },
          { $push: { comments_ids: result._id } },
        );
      }

      if (commentReference.modifiedCount === 0) {
        throw new GraphQLError(ERROR_MESSAGE.CATEGORY_NOT_EXIST, {
          code: ERROR_CODE.BAD_USER_INPUT,
          statusCode: 400,
        });
      }

      return result;
    } catch (err) {
      console.warn('An error occurred when tried to create comment.', err);

      throw new GraphQLError(ERROR_MESSAGE.UPDATE_COMMENT_REFERENCES, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }
  }

  async getComment(input: GetOrDeleteCommentInput) {
    return await CommentModel.find()
      .populate({
        path: 'author',
        select: 'name email roles',
      })
      .populate({
        path: 'answers',
        populate: [
          {
            path: 'answers',
          },
          {
            path: 'author',
          },
        ],
      })
      .findByCommentId(input.commentId)
      .lean();
  }

  async getComments() {
    return await CommentModel.find()
      .populate({
        path: 'author',
        select: 'name email roles',
      })
      .populate({
        path: 'answers',
        populate: [
          {
            path: 'answers',
          },
          {
            path: 'author',
          },
        ],
      })
      .lean();
  }

  async updateComment(
    { commentId, ...input }: UpdateCommentInput,
    { user }: Context,
  ) {
    const comment = await CommentModel.find().findByCommentId(commentId).lean();
    if (!comment) {
      throw new GraphQLError(ERROR_MESSAGE.COMMENT_NOT_EXIST, {
        code: ERROR_CODE.BAD_USER_INPUT,
        statusCode: 400,
      });
    }

    if (user?._id === comment.author || user?.roles.includes(Role.Moderator)) {
      const result = await CommentModel.updateOne(
        { comment_id: commentId },
        {
          ...input,
        },
      ).lean();

      if (result.matchedCount === 0) {
        throw new GraphQLError(ERROR_MESSAGE.COMMENT_NOT_EXIST, {
          code: ERROR_CODE.BAD_USER_INPUT,
          statusCode: 400,
        });
      }
    } else {
      throw new GraphQLError(ERROR_MESSAGE.COMMENT_CANNOT_DELETE, {
        code: ERROR_CODE.UNAUTHORIZED,
        statusCode: 403,
      });
    }

    return await CommentModel.find().findByCommentId(commentId).lean();
  }

  async deleteComment(input: GetOrDeleteCommentInput) {
    // TODO.
  }
}
